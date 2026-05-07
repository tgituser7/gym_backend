import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import Branch from '../models/Branch';
import protect, { AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

function gymId(req: AuthRequest) {
  return (req.branch!.gym as { _id: unknown })._id;
}

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { gym: gymId(req) };
    if (req.query.status) filter.status = req.query.status;
    const branches = await Branch.find(filter)
      .select('-password')
      .populate('manager', 'name role')
      .sort({ createdAt: -1 });
    res.json(branches);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const branch = await Branch.findOne({ _id: req.params.id, gym: gymId(req) })
      .select('-password')
      .populate('manager', 'name role email phone');
    if (!branch) { res.status(404).json({ error: 'Branch not found' }); return; }
    res.json(branch);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password, ...rest } = req.body as { password?: string; [key: string]: unknown };
    if (!password) { res.status(400).json({ error: 'Password is required for a new branch' }); return; }
    const hashed = await bcrypt.hash(password, 12);
    const branch = await Branch.create({ ...rest, gym: gymId(req), password: hashed });
    const { password: _pw, ...safe } = branch.toObject();
    void _pw;
    res.status(201).json(safe);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password, ...rest } = req.body as { password?: string; [key: string]: unknown };
    const update: Record<string, unknown> = { ...rest };
    if (password) update.password = await bcrypt.hash(password, 12);
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, gym: gymId(req) },
      update,
      { new: true, runValidators: true }
    ).select('-password').populate('manager', 'name role');
    if (!branch) { res.status(404).json({ error: 'Branch not found' }); return; }
    res.json(branch);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.params.id === String(req.branch!._id)) {
      res.status(400).json({ error: 'Cannot delete the branch you are currently logged in to' });
      return;
    }
    const branch = await Branch.findOneAndDelete({ _id: req.params.id, gym: gymId(req) });
    if (!branch) { res.status(404).json({ error: 'Branch not found' }); return; }
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
