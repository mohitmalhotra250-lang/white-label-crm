import { Router } from 'express';
import { authenticate, requireClientAccess } from '../middleware/auth';
import { pool } from '../lib/db';
const router = Router();
router.use(authenticate, requireClientAccess);
router.get('/', async (req, res) => { const user = (req as any).user; const cid = user.role === 'super_admin' ? (req.query.clientId || null) : user.clientId; const q = cid ? 'SELECT * FROM appointments WHERE client_id=$1 ORDER BY date DESC' : 'SELECT * FROM appointments ORDER BY date DESC'; const r = await pool.query(q, cid ? [cid] : []); res.json({ appointments: r.rows }); });
router.post('/', async (req, res) => { const user = (req as any).user; const r = await pool.query('INSERT INTO appointments (client_id, lead_id, customer_name, phone, date, time, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [user.clientId || req.body.clientId, req.body.leadId||null, req.body.customerName, req.body.phone, req.body.date, req.body.time, req.body.status||'booked', req.body.notes||'']); res.status(201).json({ appointment: r.rows[0] }); });
export default router;
