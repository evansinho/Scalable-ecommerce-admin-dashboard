import { Request, Response, NextFunction } from 'express';

export const requireRole = (role: 'ADMIN' | 'USER') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return; // Ensure the function ends here
    }

    if (user.role !== role) {
      res.status(403).json({ error: `Requires role: ${role}` });
      return; // Ensure the function ends here
    }

    next(); // Call next() to pass control to the next middleware
  };
};
