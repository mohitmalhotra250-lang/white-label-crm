// BullMQ Worker — processes queued calls asynchronously
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { AdapterService } from '../services/adapter-service';
import { pool } from '../lib/db';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const callWorker = new Worker('ai-calling-engine', async (job) => {
  const { callId, clientId, campaignId, agentId, leadId, phone, providerName, apiKey, baseUrl } = job.data;

  // Prevent duplicate processing for same call
  const existing = await pool.query('SELECT status FROM calls WHERE id = $1', [callId]);
  if (existing.rows[0]?.status === 'completed' || existing.rows[0]?.status === 'failed') return 'already-processed';

  // Update to queued/dialing
  await pool.query("UPDATE calls SET status = 'dialing', retry_count = retry_count + 1 WHERE id = $1", [callId]);

  try {
    const result = await AdapterService.startCall({
      agentConfig: { agentId: agentId || 'default', name: agentId || 'Agent', prompt: '', voice: 'Rachel', language: 'en', greeting: 'Hello' },
      phoneNumber: phone,
      leadId: leadId || '',
      campaignId,
    }, providerName, apiKey, baseUrl);

    await pool.query('UPDATE calls SET status = $1, provider_call_id = $2 WHERE id = $3', [result.status, result.providerCallId, callId]);

    // Store recording/transcript/summary when done (simplified — in production use webhook or polling loop)
    if (result.recordingUrl) await pool.query('INSERT INTO recordings (call_id, file_url, duration_seconds) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [callId, result.recordingUrl, result.durationSeconds || 0]);
    if (result.transcriptText) await pool.query('INSERT INTO transcripts (call_id, content) VALUES ($1,$2) ON CONFLICT DO NOTHING', [callId, result.transcriptText]);
    if (result.aiSummary) await pool.query('UPDATE calls SET ai_summary = $1 WHERE id = $2', [result.aiSummary, callId]);

    return { providerCallId: result.providerCallId, status: result.status };
  } catch (error: any) {
    await pool.query("UPDATE calls SET status = 'failed', error_message = $1 WHERE id = $2", [error.message || String(error), callId]);
    throw error; // BullMQ will retry based on attempts
  }
}, { connection, concurrency: 10, limiter: { max: 5, duration: 1000 } });
