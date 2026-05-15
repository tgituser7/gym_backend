import { Router, Response, NextFunction } from 'express';
import { DateTime } from 'luxon';
import Fee from '../models/Fee';
import protect, { AuthRequest } from '../middleware/auth';
import { branchFilter } from '../utils/gymFilter';

const router = Router();
router.use(protect);

function withOverdue(statusQuery?: string) {
  if (!statusQuery || statusQuery === 'overdue') {
    const now = DateTime.now().toUTC().toISO();
    return statusQuery === 'overdue'
      ? { $or: [{ status: 'overdue' }, { status: 'due', dueDate: { $lt: now } }] }
      : {};
  }
  return { status: statusQuery };
}

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, memberId, page: pageQ, limit: limitQ } = req.query as Record<string, string>;
    const filter = branchFilter(req, { ...withOverdue(status), ...(memberId ? { member: memberId } : {}) });

    // If page/limit provided, return paginated response; otherwise return full array (used internally)
    if (pageQ !== undefined || limitQ !== undefined) {
      const page = Math.max(parseInt(pageQ || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(limitQ || '10', 10), 1), 500);
      const skip = (page - 1) * limit;
      const branchOnlyFilter = branchFilter(req);
      const [fees, total, summaryResult] = await Promise.all([
        Fee.find(filter).populate('member', 'name email phone').populate('services', 'name price').sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
        Fee.countDocuments(filter),
        Fee.aggregate([
          { $match: branchOnlyFilter },
          { $group: {
            _id: null,
            totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'settled'] }, '$amount', 0] } },
            totalOutstanding: { $sum: { $cond: [{ $ne: ['$status', 'settled'] }, '$amount', 0] } },
            overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
          }},
        ]),
      ]);
      const summary = (summaryResult as Array<{ totalPaid: number; totalOutstanding: number; overdueCount: number }>)[0]
        ?? { totalPaid: 0, totalOutstanding: 0, overdueCount: 0 };
      res.json({ fees, total, page, pages: Math.ceil(total / limit), summary });
    } else {
      const fees = await Fee.find(filter)
        .populate('member', 'name email phone')
        .populate('services', 'name price')
        .sort({ createdAt: -1, _id: -1 });
      res.json(fees);
    }
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
