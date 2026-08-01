import { Request, Response, NextFunction } from 'express';
import { AuthUser } from './auth';

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthUser;
  if (!user || user.role !== 'super_admin') return res.status(403).json({ error: 'Super Admin only' });
  next();
}

export function requireClient(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthUser;
  if (!user || user.role !== 'client') return res.status(403).json({ error: 'Client only' });
  next();
}
