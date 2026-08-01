import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/role';
import { pool } from '../lib/db';
import { AdapterService } from '../services/adapter-service';

const router = Router();
router.use(authenticate, requireSuperAdmin);

router.get('/', async (req, res) => {
  const providers = await pool.query('SELECT id, name, base_url, health_status, enabled FROM providers WHERE enabled = TRUE');
  res.json({ providers: providers.rows });
});

router.post('/test', async (req, res) => {
  const { providerId, agentId, phoneNumber, agentConfig } = req.body;
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    if (!provider.rows[0]) return res.status(404).json({ error: 'Provider not found' });
    const p = provider.rows[0];
    const apiKey = p.api_key_encrypted || process.env.VAPI_API_KEY || '';

    const startTime = Date.now();
    const adapterResult = await AdapterService.startCall({
      agentConfig: agentConfig || { agentId: agentId || 'default', name: agentId || 'Test Agent', prompt: 'Test call', voice: 'Rachel', language: 'en', greeting: 'Hello, this is a test.' },
      phoneNumber: phoneNumber || '+911234567890',
      leadId: 'sandbox-test',
      campaignId: 'sandbox-campaign',
    }, p.name, apiKey, p.base_url);

    const latencyMs = Date.now() - startTime;

    // Fetch additional details
    let transcript = '';
    let recordingUrl = '';
    try {
      const t = await AdapterService.getTranscript(adapterResult.providerCallId, p.name, apiKey, p.base_url);
      transcript = t.text || '';
    } catch (e) { transcript = 'Not available'; }
    try {
      const r = await AdapterService.getRecording(adapterResult.providerCallId, p.name, apiKey, p.base_url);
      recordingUrl = r.recordingUrl || '';
    } catch (e) { recordingUrl = ''; }

    // Log webhook events (simulated)
    const webhookEvents = [
      { event: 'call.started', payload: { providerCallId: adapterResult.providerCallId, status: adapterResult.status } },
      { event: 'call.status', payload: { status: adapterResult.status, latencyMs } },
    ];

    // Update provider last successful call
    await pool.query('UPDATE providers SET health_status = $1, last_tested_at = NOW() WHERE id = $2', ['connected', providerId]);

    res.json({
      provider: p.name,
      providerCallId: adapterResult.providerCallId,
      status: adapterResult.status,
      latencyMs,
      recordingUrl,
      transcript,
      aiSummary: adapterResult.aiSummary || 'Pending',
      rawRequest: { agentConfig, phoneNumber: phoneNumber || '+911234567890', providerName: p.name },
      rawResponse: { providerCallId: adapterResult.providerCallId, status: adapterResult.status, durationSeconds: adapterResult.durationSeconds, recordingUrl: adapterResult.recordingUrl },
      webhookEvents,
      error: adapterResult.errorMessage || null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || String(e), rawRequest: req.body, provider: req.body?.providerId });
  }
});

export default router;
