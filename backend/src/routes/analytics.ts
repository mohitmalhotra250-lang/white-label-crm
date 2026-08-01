import { Router } from 'express';
import { authenticate, requireClientAccess } from '../middleware/auth';
import { pool } from '../lib/db';

const router = Router();
router.use(authenticate, requireClientAccess);

router.get('/', async (req, res) => {
  const user = (req as any).user;
  const clientId = user.role === 'super_admin' ? (req.query.clientId || null) : user.clientId;
  const from = req.query.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const to = req.query.to || new Date().toISOString().split('T')[0];
  const q = clientId
    ? `SELECT date, metric, value FROM analytics WHERE client_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date, metric`
    : `SELECT date, metric, value FROM analytics WHERE date BETWEEN $1 AND $2 ORDER BY date, metric`;
  const params = clientId ? [clientId, from, to] : [from, to];
  const result = await pool.query(q, params);
  res.json({ analytics: result.rows });
});

export default router;
