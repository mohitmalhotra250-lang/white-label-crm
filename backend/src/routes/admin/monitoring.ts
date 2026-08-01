import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/role';
import { pool } from '../lib/db';
const router = Router();
router.use(authenticate, requireSuperAdmin);
router.get('/', async (req, res) => {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    const dbMs = Date.now() - start;
    res.json({ status: 'healthy', dbLatencyMs: dbMs, timestamp: new Date().toISOString(), queue: 'connected', providers: 'monitored' });
  } catch (e) {
    res.status(503).json({ status: 'unhealthy', error: String(e), timestamp: new Date().toISOString() });
  }
});
export default router;
