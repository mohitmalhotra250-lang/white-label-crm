import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/role';
import { pool } from '../lib/db';
import { AdapterService } from '../services/adapter-service';

const router = Router();
router.use(authenticate, requireSuperAdmin);

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT id, name, display_name, base_url, version, health_status, enabled, last_tested_at FROM providers ORDER BY name');
  res.json({ providers: result.rows });
});

router.post('/', async (req, res) => {
  const { name, displayName, apiKeyEncrypted, baseUrl, authType, headers, version } = req.body;
  const result = await pool.query('INSERT INTO providers (name, display_name, api_key_encrypted, base_url, auth_type, headers, version, health_status, enabled) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,FALSE) RETURNING *', [name, displayName, apiKeyEncrypted, baseUrl, authType || 'bearer', JSON.stringify(headers || {}), version || 'v1', 'disconnected']);
  res.status(201).json({ provider: result.rows[0] });
});

router.post('/:id/test', async (req, res) => {
  const provider = await pool.query('SELECT * FROM providers WHERE id = $1', [req.params.id]);
  if (!provider.rows[0]) return res.status(404).json({ error: 'Provider not found' });
  const p = provider.rows[0];
  try {
    // In production: decrypt api_key_encrypted here
    const result = await AdapterService.testConnection(p.name, p.api_key_encrypted || '', p.base_url);
    await pool.query('UPDATE providers SET health_status = $1, last_tested_at = NOW() WHERE id = $2', [result.ok ? 'connected' : 'error', req.params.id]);
    res.json({ test: result, provider: { ...p, health_status: result.ok ? 'connected' : 'error' } });
  } catch (e: any) {
    await pool.query('UPDATE providers SET health_status = $1, last_tested_at = NOW() WHERE id = $2', ['error', req.params.id]);
    res.status(500).json({ error: e.message, test: { ok: false, message: e.message } });
  }
});

router.put('/:id', async (req, res) => {
  const { displayName, baseUrl, enabled, apiKeyEncrypted } = req.body;
  await pool.query('UPDATE providers SET display_name = $1, base_url = $2, enabled = $3, api_key_encrypted = $4 WHERE id = $5', [displayName || null, baseUrl || null, enabled !== undefined ? enabled : null, apiKeyEncrypted || null, req.params.id]);
  res.json({ updated: true });
});

export default router;
