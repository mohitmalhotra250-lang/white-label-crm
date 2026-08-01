import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'super_admin' | 'client';
  clientId?: string | null;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthUser;
    (req as any).user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(role: 'super_admin' | 'client') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (user.role !== role) return res.status(403).json({ error: 'Forbidden: insufficient role' });
    next();
  };
}

export function requireClientAccess(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthUser;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  // Super admin can access any; clients can only access their own clientId
  if (user.role === 'super_admin') return next();
  const targetClientId = (req.params.clientId || (req.body && req.body.clientId) || (req.query.clientId));
  if (targetClientId && user.clientId && user.clientId !== targetClientId) {
    return res.status(403).json({ error: 'Access denied: not your tenant' });
  }
  next();
}
