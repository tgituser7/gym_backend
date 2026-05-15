import { Router, Response, NextFunction } from 'express';
import Staff from '../models/Staff';
import protect, { AuthRequest } from '../middleware/auth';
import { branchFilter } from '../utils/gymFilter';
import { enforceLimit } from '../utils/limitCheck';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, role, page: pageQ, limit: limitQ } = req.query as Record<string, string>;
    const extra: Record<string, string> = {};
    if (status) extra.status = status;
    if (role) extra.role = role;
    const filter = branchFilter(req, extra);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ] as unknown as typeof filter.$or;
    }
    if (pageQ !== undefined || limitQ !== undefined) {
      const page = Math.max(parseInt(pageQ || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(limitQ || '10', 10), 1), 500);
      const skip = (page - 1) * limit;
      const [staff, total] = await Promise.all([
        Staff.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
        Staff.countDocuments(filter),
      ]);
      res.json({ staff, total, page, pages: Math.ceil(total / limit) });
    } else {
      const staff = await Staff.find(filter).sort({ createdAt: -1 });
      res.json(staff);
    }
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const staff = await Staff.findOne(branchFilter(req, { _id: req.params.id }));
    if (!staff) { res.status(404).json({ error: 'Staff member not found' }); return; }
    res.json(staff);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const allowed = await enforceLimit(req.branch!._id, 'staff', res);
    if (!allowed) return;
    const staff = await Staff.create({ ...req.body, branch: req.branch!._id });
    res.status(201).json(staff);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const staff = await Staff.findOneAndUpdate(
      branchFilter(req, { _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    );
    if (!staff) { res.status(404).json({ error: 'Staff member not found' }); return; }
    res.json(staff);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const staff = await Staff.findOneAndDelete(branchFilter(req, { _id: req.params.id }));
    if (!staff) { res.status(404).json({ error: 'Staff member not found' }); return; }
    res.json({ message: 'Staff member deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
