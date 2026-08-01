import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/role';
import { pool } from '../lib/db';
const router = Router();
router.use(authenticate, requireSuperAdmin);
router.get('/', async (req, res) => {
  const providers = await pool.query('SELECT id, name, health_status, enabled, last_tested_at FROM providers WHERE enabled = TRUE ORDER BY name');
  const lastCalls = await pool.query(`SELECT DISTINCT ON (provider) provider, status, created_at FROM calls WHERE provider IS NOT NULL ORDER BY provider, created_at DESC`);
  res.json({ providers: providers.rows, lastCalls: lastCalls.rows, timestamp: new Date().toISOString() });
});
export default router;
