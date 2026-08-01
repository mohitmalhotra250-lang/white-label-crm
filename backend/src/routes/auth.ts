import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../lib/db';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);
  const user = result.rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role, clientId: user.client_id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, clientId: user.client_id } });
});

router.post('/register', async (req, res) => {
  const { email, password, fullName, role = 'client', clientId } = req.body;
  const hash = bcrypt.hashSync(password, 12);
  try {
    const result = await pool.query('INSERT INTO users (email, password_hash, full_name, role, client_id, is_active) VALUES ($1,$2,$3,$4,$5,TRUE) RETURNING *', [email, hash, fullName, role, clientId || null]);
    res.status(201).json({ message: 'Registered', user: result.rows[0] });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Registration failed' });
  }
});

router.get('/me', async (req, res) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user });
});

export default router;
