import { Router, Response, NextFunction } from 'express';
import { DateTime } from 'luxon';
import Fee from '../models/Fee';
import protect, { AuthRequest } from '../middleware/auth';
import { branchFilter } from '../utils/gymFilter';

const router = Router();
router.use(protect);

function withOverdue(statusQuery?: string) {
  if (!statusQuery || statusQuery === 'overdue') {
    const now = DateTime.now().toUTC().toJSDate();
    return statusQuery === 'overdue'
      ? { $or: [{ status: 'overdue' }, { status: 'pending', dueDate: { $lt: now } }] }
      : {};
  }
  return { status: statusQuery };
}

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, memberId } = req.query as Record<string, string>;
    const filter = branchFilter(req, { ...withOverdue(status), ...(memberId ? { member: memberId } : {}) });
    const fees = await Fee.find(filter)
      .populate('member', 'name email phone')
      .populate('services', 'name price')
      .sort({ dueDate: -1 });
    res.json(fees);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fee = await Fee.findOne(branchFilter(req, { _id: req.params.id }))
      .populate('member', 'name email phone')
      .populate('services', 'name price');
    if (!fee) { res.status(404).json({ error: 'Fee not found' }); return; }
    res.json(fee);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fee = await Fee.create({ ...req.body, branch: req.branch!._id });
    await fee.populate('member', 'name email phone');
    res.status(201).json(fee);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fee = await Fee.findOneAndUpdate(
      branchFilter(req, { _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    ).populate('member', 'name email phone').populate('services', 'name price');
    if (!fee) { res.status(404).json({ error: 'Fee not found' }); return; }
    res.json(fee);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fee = await Fee.findOneAndDelete(branchFilter(req, { _id: req.params.id }));
    if (!fee) { res.status(404).json({ error: 'Fee not found' }); return; }
    res.json({ message: 'Fee deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
