import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth';
import { pool } from '../lib/db';
const router = Router();
router.use(authenticate, requireSuperAdmin);
router.get('/', async (req, res) => { const r = await pool.query('SELECT * FROM subscription_plans WHERE is_active=TRUE'); res.json({ plans: r.rows }); });
router.post('/', async (req, res) => { const r = await pool.query('INSERT INTO subscription_plans (name,billing_cycle,price_cents,features,is_active) VALUES ($1,$2,$3,$4,$5) RETURNING *', [req.body.name, req.body.bc||'monthly', req.body.price, JSON.stringify(req.body.features||{}), true]); res.status(201).json({ plan: r.rows[0] }); });
router.get('/invoices', async (req, res) => { const r = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 100'); res.json({ invoices: r.rows }); });
export default router;
