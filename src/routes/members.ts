import { Router, Response, NextFunction } from 'express';
import { DateTime } from 'luxon';
import Member from '../models/Member';
import Fee from '../models/Fee';
import protect, { AuthRequest } from '../middleware/auth';
import { branchFilter } from '../utils/gymFilter';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, page: pageQ, limit: limitQ } = req.query as Record<string, string>;
    const filter = branchFilter(req, status ? { status } : {});
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ] as unknown as typeof filter.$or;
    }
    if (pageQ !== undefined || limitQ !== undefined) {
      const page = Math.max(parseInt(pageQ || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(limitQ || '10', 10), 1), 500);
      const skip = (page - 1) * limit;
      const [members, total] = await Promise.all([
        Member.find(filter).populate('services', 'name price category').sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
        Member.countDocuments(filter),
      ]);
      res.json({ members, total, page, pages: Math.ceil(total / limit) });
    } else {
      const members = await Member.find(filter)
        .populate('services', 'name price category')
        .sort({ createdAt: -1 });
      res.json(members);
    }
  } catch (err) { next(err); }
});

router.get('/renewals', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const days = Math.min(Math.max(parseInt((req.query.days as string) || '7', 10), 1), 90);
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const skip = (page - 1) * limit;
    const now = DateTime.now().toUTC().toJSDate();
    const future = DateTime.now().toUTC().plus({ days }).toJSDate();
    // Exclude members who already have a paid fee in the last 60 days — they've renewed
    const paidMemberIds = await Fee.distinct('member', {
      branch: req.branch!._id,
      status: 'paid',
      dueDate: { $gte: DateTime.now().toUTC().minus({ days: 60 }).toJSDate() },
    });
    const filter = branchFilter(req, {
      status: 'active',
      membershipEndDate: { $gte: now, $lte: future },
      _id: { $nin: paidMemberIds },
    });
    const [members, total] = await Promise.all([
      Member.find(filter).populate('services', 'name price category').sort({ membershipEndDate: 1, _id: 1 }).skip(skip).limit(limit),
      Member.countDocuments(filter),
    ]);
    res.json({ members, total, page, pages: Math.ceil(total / limit) });
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
