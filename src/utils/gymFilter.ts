import { AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';

export function branchFilter(req: AuthRequest, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { branch: req.branch!._id as Types.ObjectId, ...extra };
}
