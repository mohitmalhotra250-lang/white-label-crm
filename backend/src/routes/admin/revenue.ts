import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/role';
import { pool } from '../lib/db';
const router = Router();
router.use(authenticate, requireSuperAdmin);

router.get('/', async (req, res) => {
  try {
    // Revenue / Billing
    const revRes = await pool.query(`SELECT COALESCE(SUM(revenue_cents),0) as total_rev, COALESCE(SUM(ai_cost_cents),0) as total_cost FROM billing_summary`);
    const rev = revRes.rows[0];
    const totalRevenue = parseInt(rev.total_rev || 0);
    const totalCost = parseInt(rev.total_cost || 0);
    const grossProfit = totalRevenue - totalCost;

    // Client analytics
    const clientsRes = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = \'active\' THEN 1 ELSE 0 END) as active FROM clients');
    const clients = clientsRes.rows[0];

    // Usage analytics (last 30 days)
    const usageRes = await pool.query(`SELECT COALESCE(SUM(minutes_used),0) as total_minutes, COALESCE(SUM(calls_completed),0) as total_calls FROM client_usage WHERE date >= CURRENT_DATE - INTERVAL '30 days'`);
    const usage = usageRes.rows[0];

    // Provider costs
    const providerRes = await pool.query('SELECT provider, total_calls, total_minutes, total_cost_cents, revenue_cents FROM provider_costs WHERE enabled IS NOT FALSE');

    // Subscription
    const subRes = await pool.query(`SELECT COUNT(*) as plans FROM subscription_plans WHERE is_active = TRUE`);
    const invRes = await pool.query(`SELECT COUNT(*) as pending FROM invoices WHERE status = 'pending'`);

    // Daily / Monthly usage
    const dailyRes = await pool.query(`SELECT date, SUM(minutes_used) as minutes FROM client_usage WHERE date >= CURRENT_DATE - INTERVAL '7 days' GROUP BY date ORDER BY date`);
    const monthlyRes = await pool.query(`SELECT TO_CHAR(date, 'YYYY-MM') as month, SUM(minutes_used) as minutes FROM client_usage WHERE date >= CURRENT_DATE - INTERVAL '30 days' GROUP BY month ORDER BY month`);

    res.json({
      revenue: { totalRevenueCents: totalRevenue, totalCostCents: totalCost, grossProfitCents: grossProfit, mrrCents: Math.round(totalRevenue / 3), arrCents: Math.round(totalRevenue) },
      clients: clients,
      usage: usage,
      providerCosts: providerRes.rows,
      subscriptions: { activePlans: parseInt(subRes.rows[0].plans || 0), pendingInvoices: parseInt(invRes.rows[0].pending || 0) },
      charts: { dailyUsage: dailyRes.rows, monthlyUsage: monthlyRes.rows }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Revenue query failed' });
  }
});
export default router;
