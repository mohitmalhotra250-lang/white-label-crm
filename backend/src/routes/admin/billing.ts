import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/role';
import { pool } from '../lib/db';
const router = Router();
router.use(authenticate, requireSuperAdmin);
router.get('/', async (req, res) => { const r = await pool.query('SELECT * FROM billing_usage ORDER BY date DESC LIMIT 200'); res.json({ usage: r.rows }); });
router.get('/:clientId', async (req, res) => { const r = await pool.query('SELECT * FROM billing_usage WHERE client_id = $1 ORDER BY date DESC', [req.params.clientId]); res.json({ usage: r.rows }); });
export default router;
