import { Router, Response, NextFunction } from 'express';
import { DateTime } from 'luxon';
import { Types } from 'mongoose';
import Member from '../models/Member';
import Staff from '../models/Staff';
import Service from '../models/Service';
import Fee from '../models/Fee';
import protect, { AuthRequest } from '../middleware/auth';
import { branchFilter } from '../utils/gymFilter';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const monthStart = DateTime.now().toUTC().startOf('month').toJSDate();
    const base = branchFilter(req);
    const branchId = req.branch!._id as Types.ObjectId;

    const [
      totalMembers, activeMembers,
      totalStaff, activeStaff,
      totalServices,
      revenueResult, pendingResult,
      recentMembers, upcomingDues,
    ] = await Promise.all([
      Member.countDocuments(base),
      Member.countDocuments({ ...base, status: 'active' }),
      Staff.countDocuments(base),
      Staff.countDocuments({ ...base, status: 'active' }),
      Service.countDocuments({ ...base, status: 'active' }),
      Fee.aggregate([
        { $match: { branch: branchId, status: 'paid', paymentDate: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Fee.aggregate([
        { $match: { branch: branchId, status: { $in: ['pending', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Member.find(base).sort({ createdAt: -1 }).limit(5)
        .select('name email status membershipEndDate createdAt'),
      Fee.find({ ...base, status: { $in: ['pending', 'overdue'] } })
        .sort({ dueDate: 1 }).limit(5)
        .populate('member', 'name email'),
    ]);

    res.json({
      totalMembers, activeMembers,
      totalStaff, activeStaff,
      totalServices,
      monthlyRevenue: (revenueResult as Array<{ total: number }>)[0]?.total || 0,
      pendingAmount: (pendingResult as Array<{ total: number }>)[0]?.total || 0,
      recentMembers,
      upcomingDues,
    });
  } catch (err) { next(err); }
});

export default router;
