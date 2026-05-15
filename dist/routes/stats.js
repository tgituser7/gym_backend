"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const luxon_1 = require("luxon");
const Member_1 = __importDefault(require("../models/Member"));
const Staff_1 = __importDefault(require("../models/Staff"));
const Service_1 = __importDefault(require("../models/Service"));
const Fee_1 = __importDefault(require("../models/Fee"));
const auth_1 = __importDefault(require("../middleware/auth"));
const gymFilter_1 = require("../utils/gymFilter");
const router = (0, express_1.Router)();
router.use(auth_1.default);
router.get('/', async (req, res, next) => {
    try {
        const monthStart = luxon_1.DateTime.now().toUTC().startOf('month').toJSDate();
        const base = (0, gymFilter_1.branchFilter)(req);
        const branchId = req.branch._id;
        const [totalMembers, activeMembers, totalStaff, activeStaff, totalServices, revenueResult, pendingResult, recentMembers, upcomingDues,] = await Promise.all([
            Member_1.default.countDocuments(base),
            Member_1.default.countDocuments({ ...base, status: 'active' }),
            Staff_1.default.countDocuments(base),
            Staff_1.default.countDocuments({ ...base, status: 'active' }),
            Service_1.default.countDocuments({ ...base, status: 'active' }),
            Fee_1.default.aggregate([
                { $match: { branch: branchId, status: 'settled', settledOn: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Fee_1.default.aggregate([
                { $match: { branch: branchId, status: { $in: ['due', 'overdue'] } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Member_1.default.find(base).sort({ createdAt: -1 }).limit(5)
                .select('name email status membershipEndDate createdAt'),
            Fee_1.default.find({ ...base, status: { $in: ['due', 'overdue'] } })
                .sort({ dueDate: 1 }).limit(5)
                .populate('member', 'name email'),
        ]);
        res.json({
            totalMembers, activeMembers,
            totalStaff, activeStaff,
            totalServices,
            monthlyRevenue: revenueResult[0]?.total || 0,
            pendingAmount: pendingResult[0]?.total || 0,
            recentMembers,
            upcomingDues,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=stats.js.map