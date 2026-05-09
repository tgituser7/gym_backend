"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const luxon_1 = require("luxon");
const Fee_1 = __importDefault(require("../models/Fee"));
const auth_1 = __importDefault(require("../middleware/auth"));
const gymFilter_1 = require("../utils/gymFilter");
const router = (0, express_1.Router)();
router.use(auth_1.default);
function withOverdue(statusQuery) {
    if (!statusQuery || statusQuery === 'overdue') {
        const now = luxon_1.DateTime.now().toUTC().toJSDate();
        return statusQuery === 'overdue'
            ? { $or: [{ status: 'overdue' }, { status: 'pending', dueDate: { $lt: now } }] }
            : {};
    }
    return { status: statusQuery };
}
router.get('/', async (req, res, next) => {
    try {
        const { status, memberId, page: pageQ, limit: limitQ } = req.query;
        const filter = (0, gymFilter_1.branchFilter)(req, { ...withOverdue(status), ...(memberId ? { member: memberId } : {}) });
        // If page/limit provided, return paginated response; otherwise return full array (used internally)
        if (pageQ !== undefined || limitQ !== undefined) {
            const page = Math.max(parseInt(pageQ || '1', 10), 1);
            const limit = Math.min(Math.max(parseInt(limitQ || '10', 10), 1), 500);
            const skip = (page - 1) * limit;
            const branchOnlyFilter = (0, gymFilter_1.branchFilter)(req);
            const [fees, total, summaryResult] = await Promise.all([
                Fee_1.default.find(filter).populate('member', 'name email phone').populate('services', 'name price').sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
                Fee_1.default.countDocuments(filter),
                Fee_1.default.aggregate([
                    { $match: branchOnlyFilter },
                    { $group: {
                            _id: null,
                            totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
                            totalOutstanding: { $sum: { $cond: [{ $ne: ['$status', 'paid'] }, '$amount', 0] } },
                            overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
                        } },
                ]),
            ]);
            const summary = summaryResult[0]
                ?? { totalPaid: 0, totalOutstanding: 0, overdueCount: 0 };
            res.json({ fees, total, page, pages: Math.ceil(total / limit), summary });
        }
        else {
            const fees = await Fee_1.default.find(filter)
                .populate('member', 'name email phone')
                .populate('services', 'name price')
                .sort({ createdAt: -1, _id: -1 });
            res.json(fees);
        }
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const fee = await Fee_1.default.findOne((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }))
            .populate('member', 'name email phone')
            .populate('services', 'name price');
        if (!fee) {
            res.status(404).json({ error: 'Fee not found' });
            return;
        }
        res.json(fee);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const fee = await Fee_1.default.create({ ...req.body, branch: req.branch._id });
        await fee.populate('member', 'name email phone');
        res.status(201).json(fee);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const fee = await Fee_1.default.findOneAndUpdate((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }), req.body, { new: true, runValidators: true }).populate('member', 'name email phone').populate('services', 'name price');
        if (!fee) {
            res.status(404).json({ error: 'Fee not found' });
            return;
        }
        res.json(fee);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const fee = await Fee_1.default.findOneAndDelete((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }));
        if (!fee) {
            res.status(404).json({ error: 'Fee not found' });
            return;
        }
        res.json({ message: 'Fee deleted successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=fees.js.map