import { Request, Response, NextFunction } from 'express';
import { db } from '../database/db';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

export const roleMiddleware = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user || user.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
