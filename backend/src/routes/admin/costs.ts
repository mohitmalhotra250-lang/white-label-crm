import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/role';
import { pool } from '../lib/db';
const router = Router();
router.use(authenticate, requireSuperAdmin);
router.get('/', async (req, res) => {
  const providers = await pool.query('SELECT provider, total_calls, total_minutes, cost_per_minute_cents, total_cost_cents, revenue_cents, gross_profit_cents, profit_margin_percent, average_duration_seconds FROM provider_costs WHERE enabled IS NOT FALSE ORDER BY provider');
  const clients = await pool.query('SELECT c.id, c.name, SUM(COALESCE(b.total_revenue_cents,0)) as revenue, SUM(COALESCE(b.total_ai_cost_cents,0)) as cost FROM clients c LEFT JOIN billing_summary b ON c.id = b.client_id GROUP BY c.id, c.name');
  res.json({ providerCosts: providers.rows, clientBilling: clients.rows });
});
export default router;
