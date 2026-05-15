"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SubscriptionTier_1 = __importDefault(require("../models/SubscriptionTier"));
const Branch_1 = __importDefault(require("../models/Branch"));
const Member_1 = __importDefault(require("../models/Member"));
const Service_1 = __importDefault(require("../models/Service"));
const Staff_1 = __importDefault(require("../models/Staff"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// ── Public: get the active Starter tier ───────────────────────────────────────
router.get('/tier', async (_req, res, next) => {
    try {
        let tier = await SubscriptionTier_1.default.findOne({ isActive: true });
        if (!tier) {
            tier = await SubscriptionTier_1.default.create({
                name: 'Starter',
                basePrice: 600,
                memberLimit: 100,
                serviceLimit: 5,
                staffLimit: 3,
                additionalMemberPrice: 10,
                additionalMemberUnit: 10,
                isActive: true,
            });
        }
        res.json(tier);
    }
    catch (err) {
        next(err);
    }
});
// ── Admin: update the Starter tier limits / prices ────────────────────────────
router.put('/tier', async (req, res, next) => {
    try {
        const adminSecret = process.env.ADMIN_SECRET || 'fitark-admin-2025';
        if (req.headers['x-admin-secret'] !== adminSecret) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const allowed = ['name', 'basePrice', 'memberLimit', 'serviceLimit', 'staffLimit',
            'additionalMemberPrice', 'additionalMemberUnit', 'isActive'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined)
                updates[key] = req.body[key];
        }
        const tier = await SubscriptionTier_1.default.findOneAndUpdate({ isActive: true }, { $set: updates }, { new: true, upsert: false });
        if (!tier) {
            res.status(404).json({ error: 'Tier not found' });
            return;
        }
        res.json(tier);
    }
    catch (err) {
        next(err);
    }
});
// ── Protected: get current branch subscription + usage + computed limits ──────
router.get('/', auth_1.default, async (req, res, next) => {
    try {
        const tier = await SubscriptionTier_1.default.findOne({ isActive: true });
        if (!tier) {
            res.status(404).json({ error: 'No active tier found' });
            return;
        }
        const branch = await Branch_1.default.findById(req.branch._id);
        if (!branch) {
            res.status(404).json({ error: 'Branch not found' });
            return;
        }
        // Attach tier to branch subscription if not already linked
        if (!branch.subscription?.tierId) {
            branch.subscription = {
                tierId: tier._id,
                additionalMembers: 0,
                additionalStaff: 0,
                additionalServices: 0,
                additionalAmount: 0,
                status: 'active',
                startDate: new Date(),
            };
            await branch.save();
        }
        const sub = branch.subscription;
        const effectiveMemberLimit = tier.memberLimit + (sub.additionalMembers ?? 0);
        const effectiveServiceLimit = tier.serviceLimit + (sub.additionalServices ?? 0);
        const effectiveStaffLimit = tier.staffLimit + (sub.additionalStaff ?? 0);
        const [memberCount, serviceCount, staffCount] = await Promise.all([
            Member_1.default.countDocuments({ branch: branch._id, status: 'active' }),
            Service_1.default.countDocuments({ branch: branch._id, status: 'active' }),
            Staff_1.default.countDocuments({ branch: branch._id, status: 'active' }),
        ]);
        res.json({
            tier,
            subscription: sub,
            usage: { members: memberCount, services: serviceCount, staff: staffCount },
            limits: {
                members: effectiveMemberLimit,
                services: effectiveServiceLimit,
                staff: effectiveStaffLimit,
            },
            totalMonthlyAmount: tier.basePrice + sub.additionalAmount,
        });
    }
    catch (err) {
        next(err);
    }
});
// ── Protected: update branch add-ons (additional members) ────────────────────
router.put('/addon', auth_1.default, async (req, res, next) => {
    try {
        const { additionalMembers } = req.body;
        if (typeof additionalMembers !== 'number' || additionalMembers < 0) {
            res.status(400).json({ error: 'additionalMembers must be a non-negative number' });
            return;
        }
        const tier = await SubscriptionTier_1.default.findOne({ isActive: true });
        if (!tier) {
            res.status(404).json({ error: 'No active tier found' });
            return;
        }
        const units = Math.ceil(additionalMembers / tier.additionalMemberUnit);
        const additionalAmount = units * tier.additionalMemberPrice * tier.additionalMemberUnit;
        const roundedAdditionalMembers = units * tier.additionalMemberUnit;
        await Branch_1.default.findByIdAndUpdate(req.branch._id, {
            $set: {
                'subscription.tierId': tier._id,
                'subscription.additionalMembers': roundedAdditionalMembers,
                'subscription.additionalAmount': additionalAmount,
                'subscription.status': 'active',
            },
        }, { new: true });
        res.json({
            additionalMembers: roundedAdditionalMembers,
            additionalAmount,
            effectiveMemberLimit: tier.memberLimit + roundedAdditionalMembers,
            totalMonthlyAmount: tier.basePrice + additionalAmount,
        });
    }
    catch (err) {
        next(err);
    }
});
// ── Admin: set per-branch custom limits ───────────────────────────────────────
router.put('/branch/:branchId/limits', async (req, res, next) => {
    try {
        const adminSecret = process.env.ADMIN_SECRET || 'fitark-admin-2025';
        if (req.headers['x-admin-secret'] !== adminSecret) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const { additionalMembers, additionalStaff, additionalServices } = req.body;
        const updates = {};
        if (typeof additionalMembers === 'number' && additionalMembers >= 0)
            updates['subscription.additionalMembers'] = additionalMembers;
        if (typeof additionalStaff === 'number' && additionalStaff >= 0)
            updates['subscription.additionalStaff'] = additionalStaff;
        if (typeof additionalServices === 'number' && additionalServices >= 0)
            updates['subscription.additionalServices'] = additionalServices;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No valid fields provided' });
            return;
        }
        const branch = await Branch_1.default.findByIdAndUpdate(req.params.branchId, { $set: updates }, { new: true });
        if (!branch) {
            res.status(404).json({ error: 'Branch not found' });
            return;
        }
        const tier = await SubscriptionTier_1.default.findOne({ isActive: true });
        const sub = branch.subscription;
        res.json({
            message: 'Limits updated',
            limits: {
                members: (tier?.memberLimit ?? 0) + (sub?.additionalMembers ?? 0),
                staff: (tier?.staffLimit ?? 0) + (sub?.additionalStaff ?? 0),
                services: (tier?.serviceLimit ?? 0) + (sub?.additionalServices ?? 0),
            },
            additionalMembers: sub?.additionalMembers ?? 0,
            additionalStaff: sub?.additionalStaff ?? 0,
            additionalServices: sub?.additionalServices ?? 0,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=subscription.js.map