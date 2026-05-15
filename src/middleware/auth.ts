import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Branch from '../models/Branch';
import { IBranch } from '../types';
import { Document } from 'mongoose';

export interface AuthRequest extends Request {
  branch?: Document & IBranch & { gym: { _id: unknown; name: string; status: string } };
}

const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authorized — token missing' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gym-secret-dev-key') as { id: string };
    const branch = await Branch.findById(decoded.id)
      .select('-password')
      .populate('gym', 'name status email');
    if (!branch) {
      res.status(401).json({ error: 'Branch not found' });
      return;
    }
    if (branch.status === 'inactive') {
      res.status(403).json({ error: 'This branch is inactive' });
      return;
    }
    req.branch = branch as unknown as AuthRequest['branch'];
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default protect;
