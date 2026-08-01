import { Router } from 'express';
import { authenticate, requireClientAccess } from '../middleware/auth';
import { pool } from '../lib/db';
import { AdapterService } from '../services/adapter-service';
import { enqueueCall } from '../jobs/queue';

const router = Router();
router.use(authenticate, requireClientAccess);

router.get('/', async (req, res) => {
  const user = (req as any).user;
  const clientId = user.role === 'super_admin' ? (req.query.clientId || null) : user.clientId;
  const q = clientId ? 'SELECT * FROM calls WHERE client_id = $1 ORDER BY created_at DESC LIMIT 100' : 'SELECT * FROM calls ORDER BY created_at DESC LIMIT 100';
  const params = clientId ? [clientId] : [];
  const result = await pool.query(q, params);
  res.json({ calls: result.rows, count: result.rowCount });
});

router.post('/start', async (req, res) => {
  const user = (req as any).user;
  const { campaignId, agentId, leadId, phone } = req.body;
  // Get campaign + agent + provider info
  const camp = await pool.query('SELECT * FROM campaigns WHERE id = $1', [campaignId]);
  if (!camp.rows[0]) return res.status(400).json({ error: 'Campaign not found' });
  const agent = await pool.query('SELECT * FROM agents WHERE id = $1', [agentId || camp.rows[0].agent_id]);
  const provider = await pool.query('SELECT * FROM providers WHERE id = $1', [camp.rows[0].provider_id || (await pool.query('SELECT id FROM providers WHERE enabled = TRUE LIMIT 1')).rows[0]?.id]);
  if (!provider.rows[0]) return res.status(400).json({ error: 'No active provider configured' });

  // Decrypt API key in production (use encryption service)
  const apiKey = provider.rows[0].api_key_encrypted || process.env.VAPI_API_KEY || 'test';

  // Insert call record
  const callRes = await pool.query(
    `INSERT INTO calls (client_id, lead_id, campaign_id, agent_id, provider, phone, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,'dialing',NOW()) RETURNING *`,
    [user.clientId || camp.rows[0].client_id, leadId || null, campaignId, agentId || agent.rows[0]?.id || null, provider.rows[0].name, phone || '']
  );
  const call = callRes.rows[0];

  // Check usage limits before calling
  const limitsRes = await pool.query('SELECT * FROM client_limits WHERE client_id = $1', [user.clientId || camp.rows[0].client_id]);
  const lim = limitsRes.rows[0];
  if (lim) {
    const usedMin = lim.minutes_used || 0;
    const remMin = lim.minutes_remaining || 0;
    const monthly = lim.monthly_call_limit || 0;
    const daily = lim.daily_call_limit || 0;
    const status = lim.status || 'active';
    const todayCountRes = await pool.query('SELECT COUNT(*) FROM calls WHERE client_id = $1 AND created_at >= CURRENT_DATE', [user.clientId || camp.rows[0].client_id]);
    const todayCalls = parseInt(todayCountRes.rows[0].count) || 0;
    if (status === 'suspended' || status === 'expired') return res.status(403).json({ error: 'Client account suspended or expired' });
    if (remMin <= 0 || usedMin <= 0) return res.status(403).json({ error: 'No remaining minutes. Upgrade plan.', limitType: 'minutes' });
    if (daily > 0 && todayCalls >= daily) return res.status(403).json({ error: 'Daily call limit exceeded', limitType: 'daily_calls', used: todayCalls, limit: daily });
    if (monthly > 0 && (lim.total_calls_completed || 0) >= monthly) return res.status(403).json({ error: 'Monthly call limit exceeded', limitType: 'monthly_calls' });
  }
  // Call adapter
  try {
    const adapterResult = await AdapterService.startCall({
      agentConfig: {
        agentId: agent.rows[0]?.id || 'default',
        name: agent.rows[0]?.name || 'AI Agent',
        prompt: agent.rows[0]?.prompt || '',
        voice: agent.rows[0]?.voice,
        language: agent.rows[0]?.language || 'en',
        greeting: agent.rows[0]?.greeting,
      },
      phoneNumber: phone,
      leadId: leadId || '',
      campaignId,
      variables: {},
    }, provider.rows[0].name, apiKey, provider.rows[0].base_url);

    await pool.query('UPDATE calls SET provider_call_id = $1, status = $2 WHERE id = $3', [adapterResult.providerCallId, adapterResult.status, call.id]);
    await enqueueCall({ callId: call.id, clientId: call.client_id||'', campaignId, agentId: agentId||agent.rows[0]?.id||'default', leadId: leadId||'', phone: phone||'', providerName: provider.rows[0].name, apiKey, baseUrl: provider.rows[0].base_url });
    res.json({ call: { ...call, providerCallId: adapterResult.providerCallId, status: adapterResult.status } });
  } catch (e: any) {
    await pool.query("UPDATE calls SET status = 'failed', error_message = $1 WHERE id = $2", [e.message || String(e), call.id]);
    res.status(500).json({ error: e.message || 'Call initiation failed', call });
  }
});

router.post('/:id/stop', async (req, res) => {
  const call = await pool.query('SELECT * FROM calls WHERE id = $1', [req.params.id]);
  if (!call.rows[0]) return res.status(404).json({ error: 'Not found' });
  const provider = await pool.query('SELECT * FROM providers WHERE name = $1', [call.rows[0].provider]);
  const apiKey = provider.rows[0]?.api_key_encrypted || '';
  if (provider.rows[0] && call.rows[0].provider_call_id) {
    try {
      const adapter = await AdapterService.getAdapterByName(provider.rows[0].name, apiKey, provider.rows[0].base_url);
      await adapter.stopCall(call.rows[0].provider_call_id);
    } catch (e) { /* log */ }
  }
  await pool.query("UPDATE calls SET status = 'completed', end_timestamp = NOW() WHERE id = $1", [req.params.id]);
  res.json({ stopped: true });
});

router.get('/:id/transcript', async (req, res) => {
  const call = await pool.query('SELECT * FROM calls WHERE id = $1', [req.params.id]);
  if (!call.rows[0]) return res.status(404).json({ error: 'Not found' });
  const provider = await pool.query('SELECT * FROM providers WHERE name = $1', [call.rows[0].provider]);
  const apiKey = provider.rows[0]?.api_key_encrypted || '';
  try {
    if (provider.rows[0] && call.rows[0].provider_call_id) {
      const adapter = await AdapterService.getAdapterByName(provider.rows[0].name, apiKey, provider.rows[0].base_url);
      const result = await adapter.getTranscript(call.rows[0].provider_call_id);
      await pool.query('INSERT INTO transcripts (call_id, content, speaker_segments) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [req.params.id, result.text || '', JSON.stringify(result.segments || [])]);
      res.json({ transcript: result });
    } else {
      res.status(400).json({ error: 'No provider call id' });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id/recording', async (req, res) => {
  const call = await pool.query('SELECT * FROM calls WHERE id = $1', [req.params.id]);
  if (!call.rows[0]) return res.status(404).json({ error: 'Not found' });
  const provider = await pool.query('SELECT * FROM providers WHERE name = $1', [call.rows[0].provider]);
  const apiKey = provider.rows[0]?.api_key_encrypted || '';
  try {
    if (provider.rows[0] && call.rows[0].provider_call_id) {
      const adapter = await AdapterService.getAdapterByName(provider.rows[0].name, apiKey, provider.rows[0].base_url);
      const result = await adapter.getRecording(call.rows[0].provider_call_id);
      await pool.query('INSERT INTO recordings (call_id, file_url, duration_seconds) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [req.params.id, result.recordingUrl || '', result.durationSeconds || 0]);
      res.json({ recording: result });
    } else {
      res.status(400).json({ error: 'No provider call id' });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
