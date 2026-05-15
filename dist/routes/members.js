"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const luxon_1 = require("luxon");
const Member_1 = __importDefault(require("../models/Member"));
const Fee_1 = __importDefault(require("../models/Fee"));
const auth_1 = __importDefault(require("../middleware/auth"));
const gymFilter_1 = require("../utils/gymFilter");
const router = (0, express_1.Router)();
router.use(auth_1.default);
router.get('/', async (req, res, next) => {
    try {
        const { search, status, page: pageQ, limit: limitQ } = req.query;
        const filter = (0, gymFilter_1.branchFilter)(req, status ? { status } : {});
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }
        if (pageQ !== undefined || limitQ !== undefined) {
            const page = Math.max(parseInt(pageQ || '1', 10), 1);
            const limit = Math.min(Math.max(parseInt(limitQ || '10', 10), 1), 500);
            const skip = (page - 1) * limit;
            const [members, total] = await Promise.all([
                Member_1.default.find(filter).populate('services', 'name price category').sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
                Member_1.default.countDocuments(filter),
            ]);
            res.json({ members, total, page, pages: Math.ceil(total / limit) });
        }
        else {
            const members = await Member_1.default.find(filter)
                .populate('services', 'name price category')
                .sort({ createdAt: -1 });
            res.json(members);
        }
    }
    catch (err) {
        next(err);
    }
});
router.get('/renewals', async (req, res, next) => {
    try {
        const daysRaw = parseInt(req.query.days || '7', 10);
        // days=0 means "all" (no upper bound)
        const days = isNaN(daysRaw) ? 7 : Math.min(Math.max(daysRaw, 0), 365);
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
        const skip = (page - 1) * limit;
        const paidMemberIds = await Fee_1.default.distinct('member', {
            branch: req.branch._id,
            status: 'settled',
            dueDate: { $gte: luxon_1.DateTime.now().toUTC().minus({ days: 60 }).toJSDate() },
        });
        const baseConditions = {
            status: 'active',
            membershipEndDate: { $exists: true, $ne: null },
            'services.0': { $exists: true },
            _id: { $nin: paidMemberIds },
        };
        const windowFilter = (n) => (0, gymFilter_1.branchFilter)(req, {
            ...baseConditions,
            membershipEndDate: { $exists: true, $ne: null, $lte: luxon_1.DateTime.now().toUTC().startOf('day').plus({ days: n }).toJSDate() },
        });
        const allFilter = (0, gymFilter_1.branchFilter)(req, baseConditions);
        const mainFilter = days === 0 ? allFilter : windowFilter(days);
        const [members, total, cnt3, cnt7, cnt14, cnt30, cntAll] = await Promise.all([
            Member_1.default.find(mainFilter).populate('services', 'name price category').sort({ membershipEndDate: 1, _id: 1 }).skip(skip).limit(limit),
            Member_1.default.countDocuments(mainFilter),
            Member_1.default.countDocuments(windowFilter(3)),
            Member_1.default.countDocuments(windowFilter(7)),
            Member_1.default.countDocuments(windowFilter(14)),
            Member_1.default.countDocuments(windowFilter(30)),
            Member_1.default.countDocuments(allFilter),
        ]);
        res.json({
            members, total, page, pages: Math.ceil(total / limit),
            summary: { days3: cnt3, days7: cnt7, days14: cnt14, days30: cnt30, total: cntAll },
        });
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const member = await Member_1.default.findOne((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }))
            .populate({ path: 'services', populate: { path: 'instructor', select: 'name role' } });
        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }
        res.json(member);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const member = await Member_1.default.create({ ...req.body, branch: req.branch._id });
        await member.populate('services', 'name price category');
        res.status(201).json(member);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const member = await Member_1.default.findOneAndUpdate((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }), req.body, { new: true, runValidators: true }).populate('services', 'name price category');
        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }
        res.json(member);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const member = await Member_1.default.findOneAndDelete((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }));
        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }
        res.json({ message: 'Member deleted successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=members.js.map