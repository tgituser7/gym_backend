import { Router, Response, NextFunction } from 'express';
import Member from '../models/Member';
import protect, { AuthRequest } from '../middleware/auth';
import { branchFilter } from '../utils/gymFilter';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status } = req.query as Record<string, string>;
    const filter = branchFilter(req, status ? { status } : {});
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ] as unknown as typeof filter.$or;
    }
    const members = await Member.find(filter)
      .populate('services', 'name price category')
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await Member.findOne(branchFilter(req, { _id: req.params.id }))
      .populate({ path: 'services', populate: { path: 'instructor', select: 'name role' } });
    if (!member) { res.status(404).json({ error: 'Member not found' }); return; }
    res.json(member);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await Member.create({ ...req.body, branch: req.branch!._id });
    await member.populate('services', 'name price category');
    res.status(201).json(member);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await Member.findOneAndUpdate(
      branchFilter(req, { _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    ).populate('services', 'name price category');
    if (!member) { res.status(404).json({ error: 'Member not found' }); return; }
    res.json(member);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await Member.findOneAndDelete(branchFilter(req, { _id: req.params.id }));
    if (!member) { res.status(404).json({ error: 'Member not found' }); return; }
    res.json({ message: 'Member deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
