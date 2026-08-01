import { Router } from 'express';
import { authenticate, requireClientAccess } from '../middleware/auth';
import { pool } from '../lib/db';

const router = Router();
router.use(authenticate, requireClientAccess);

router.get('/', async (req, res) => {
  const user = (req as any).user;
  const clientId = user.role === 'super_admin' ? (req.query.clientId || null) : user.clientId;
  const q = clientId ? 'SELECT * FROM campaigns WHERE client_id = $1 ORDER BY created_at DESC LIMIT 50' : 'SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 50';
  const params = clientId ? [clientId] : [];
  const result = await pool.query(q, params);
  res.json({ campaigns: result.rows });
});

router.post('/', async (req, res) => {
  const user = (req as any).user;
  const { name, agentId, providerId, csvFileUrl } = req.body;
  const result = await pool.query('INSERT INTO campaigns (client_id, agent_id, provider_id, name, csv_file_url, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [user.clientId || req.body.clientId, agentId || null, providerId || null, name, csvFileUrl || null, 'draft']);
  res.status(201).json({ campaign: result.rows[0] });
});

router.post('/:id/start', async (req, res) => {
  await pool.query("UPDATE campaigns SET status = 'running', started_at = NOW() WHERE id = $1", [req.params.id]);
  res.json({ started: true });
});

router.post('/:id/pause', async (req, res) => {
  await pool.query("UPDATE campaigns SET status = 'paused' WHERE id = $1", [req.params.id]);
  res.json({ paused: true });
});

router.post('/:id/stop', async (req, res) => {
  await pool.query("UPDATE campaigns SET status = 'stopped', completed_at = NOW() WHERE id = $1", [req.params.id]);
  res.json({ stopped: true });
});

export default router;
