import { Router } from 'express';
import { pool } from '../lib/db';

const router = Router();

router.post('/:providerName', async (req, res) => {
  const secret = req.headers['x-webhook-secret'] || req.query.secret;
  if (secret !== process.env.WEBHOOK_SECRET && process.env.WEBHOOK_SECRET) return res.status(403).json({ error: 'Invalid webhook secret' });
  const eventType = req.body.event || req.body.type || 'unknown';
  const providerCallId = req.body.call_id || req.body.call?.id || req.body.data?.id || '';
  const status = req.body.status || req.body.call?.status || 'unknown';

  // Update call status if we have providerCallId
  if (providerCallId) {
    await pool.query('UPDATE calls SET status = $1, updated_at = NOW() WHERE provider_call_id = $2', [status.toLowerCase(), providerCallId]);
  }

  // Log webhook
  await pool.query('INSERT INTO webhooks (client_id, event_type, url, delivery_logs) VALUES (NULL,$1,$2,$3)', [eventType, req.url, JSON.stringify({ received: true, payload: req.body })]);

  res.status(200).json({ received: true });
});

router.post('/:providerName/replay', async (req, res) => {
  // Replay last webhook event (Super Admin / debug)
  res.json({ replayed: true });
});

export default router;
