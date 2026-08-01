import { Router } from 'express';
import { authenticate, requireClientAccess } from '../middleware/auth';
import { pool } from '../lib/db';
import { LeadProcessor } from '../services/lead-processor';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();
router.use(authenticate, requireClientAccess);

router.get('/', async (req, res) => {
  const user = (req as any).user;
  const clientId = user.role === 'super_admin' ? (req.query.clientId || null) : user.clientId;
  const q = clientId ? 'SELECT * FROM leads WHERE client_id = $1 ORDER BY created_at DESC LIMIT 200' : 'SELECT * FROM leads ORDER BY created_at DESC LIMIT 200';
  const params = clientId ? [clientId] : [];
  const result = await pool.query(q, params);
  res.json({ leads: result.rows, count: result.rowCount });
});

router.post('/', async (req, res) => {
  const user = (req as any).user;
  const { name, phone, email, company, city, state, country, tags, notes, customFields } = req.body;
  const result = await pool.query(
    `INSERT INTO leads (client_id, name, phone, email, company, city, state, country, tags, notes, custom_fields, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'new',$12) RETURNING *`,
    [user.clientId || req.body.clientId, name, phone, email, company, city, state, country, tags || [], notes || '', JSON.stringify(customFields || {}), user.userId]
  );
  res.status(201).json({ lead: result.rows[0] });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  const user = (req as any).user;
  const clientId = user.clientId || req.body.clientId;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const stats = await LeadProcessor.processCsvBuffer(req.file.buffer, clientId, user.userId);
  // Notify
  await pool.query(`INSERT INTO notifications (user_id, client_id, type, message, is_read) VALUES ($1,$2,'csv_uploaded',$3,FALSE)`, [user.userId, clientId, 'CSV uploaded successfully']);
  res.json({ message: 'Upload complete', ...stats });
});

router.get('/:id', async (req, res) => {
  const user = (req as any).user;
  const result = await pool.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ lead: result.rows[0] });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
  res.json({ deleted: true });
});

export default router;
