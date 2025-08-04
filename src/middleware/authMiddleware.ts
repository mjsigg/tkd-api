import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, JWTPayloadSchema } from '../types/user.js';

// Extend Request to include user property
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify and validate JWT with Zod
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const validatedPayload = JWTPayloadSchema.parse(decoded); // Runtime validation
    
    req.user = validatedPayload; // TypeScript knows exact type now!
    next(); // Continue to route handler
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  // First check if user is authenticated
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};