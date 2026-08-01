import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/role';
import { pool } from '../lib/db';
const router = Router();
router.use(authenticate, requireSuperAdmin);

router.get('/', async (req, res) => {
  const clients = await pool.query(`SELECT c.id, c.name, cl.current_plan, cl.status, COALESCE(cl.minutes_remaining,0) as remaining, COALESCE(cl.daily_call_limit,0) as daily_limit FROM clients c LEFT JOIN client_limits cl ON c.id = cl.client_id`);
  res.json({ clients: clients.rows });
});

router.get('/:clientId', async (req, res) => {
  const r = await pool.query('SELECT * FROM client_limits WHERE client_id = $1', [req.params.clientId]);
  res.json({ limits: r.rows[0] || null });
});

router.put('/:clientId', async (req, res) => {
  const { minutes_purchased, minutes_used, minutes_remaining, monthly_call_limit, daily_call_limit, concurrent_call_limit, total_leads, total_calls_completed, current_plan, expiry_date, status } = req.body;
  await pool.query(`INSERT INTO client_limits (client_id, total_minutes_purchased, minutes_used, minutes_remaining, monthly_call_limit, daily_call_limit, concurrent_call_limit, total_leads_uploaded, total_calls_completed, current_plan, expiry_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (client_id) DO UPDATE SET total_minutes_purchased = EXCLUDED.total_minutes_purchased, minutes_used = EXCLUDED.minutes_used, minutes_remaining = EXCLUDED.minutes_remaining, monthly_call_limit = EXCLUDED.monthly_call_limit, daily_call_limit = EXCLUDED.daily_call_limit, concurrent_call_limit = EXCLUDED.concurrent_call_limit, total_leads_uploaded = EXCLUDED.total_leads_uploaded, total_calls_completed = EXCLUDED.total_calls_completed, current_plan = EXCLUDED.current_plan, expiry_date = EXCLUDED.expiry_date, status = EXCLUDED.status, updated_at = NOW()`, [req.params.clientId, minutes_purchased||0, minutes_used||0, minutes_remaining||0, monthly_call_limit||0, daily_call_limit||0, concurrent_call_limit||0, total_leads||0, total_calls_completed||0, current_plan||'Basic', expiry_date||null, status||'active']);
  res.json({ updated: true });
});

router.get('/usage', async (req, res) => {
  const r = await pool.query('SELECT * FROM client_usage ORDER BY date DESC LIMIT 50');
  res.json({ usage: r.rows });
});

export default router;
