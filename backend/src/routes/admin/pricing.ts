import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/role';
import { pool } from '../lib/db';
const router = Router();
router.use(authenticate, requireSuperAdmin);

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT id, provider, total_calls, total_minutes, cost_per_minute_cents, currency, setup_fee_cents, markup_percent, fixed_fee_per_call_cents, is_active FROM provider_costs ORDER BY provider');
  res.json({ pricing: result.rows });
});

router.put('/:provider', async (req, res) => {
  const { cost_per_minute_cents, currency, setup_fee_cents, markup_percent, fixed_fee_per_call_cents, is_active } = req.body;
  await pool.query(`UPDATE provider_costs SET cost_per_minute_cents = $1, currency = $2, setup_fee_cents = $3, markup_percent = $4, fixed_fee_per_call_cents = $5, is_active = $6, updated_at = NOW() WHERE provider = $7`, [cost_per_minute_cents || 0, currency || 'INR', setup_fee_cents || 0, markup_percent || 0, fixed_fee_per_call_cents || 0, is_active !== undefined ? is_active : true, req.params.provider]);
  await pool.query('INSERT INTO audit_logs (user_id, client_id, action, entity_type, entity_id, new_values, created_at) VALUES ($1, NULL, $2, $3, $4, $5, NOW())', [req.user?.userId || null, 'pricing_updated', 'provider', req.params.provider, JSON.stringify(req.body)]);
  res.json({ updated: true, provider: req.params.provider });
});

export default router;
