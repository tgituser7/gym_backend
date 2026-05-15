"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceLimit = enforceLimit;
const Branch_1 = __importDefault(require("../models/Branch"));
const SubscriptionTier_1 = __importDefault(require("../models/SubscriptionTier"));
const Member_1 = __importDefault(require("../models/Member"));
const Staff_1 = __importDefault(require("../models/Staff"));
const Service_1 = __importDefault(require("../models/Service"));
async function enforceLimit(branchId, resource, res) {
    const branch = await Branch_1.default.findById(branchId).select('subscription');
    if (!branch?.subscription?.tierId)
        return true; // no tier yet — allow
    const tier = await SubscriptionTier_1.default.findById(branch.subscription.tierId);
    if (!tier)
        return true;
    let current;
    let limit;
    let label;
    if (resource === 'members') {
        current = await Member_1.default.countDocuments({ branch: branchId, status: 'active' });
        limit = tier.memberLimit + branch.subscription.additionalMembers;
        label = 'active members';
    }
    else if (resource === 'staff') {
        current = await Staff_1.default.countDocuments({ branch: branchId, status: 'active' });
        limit = tier.staffLimit + (branch.subscription?.additionalStaff ?? 0);
        label = 'staff accounts';
    }
    else {
        current = await Service_1.default.countDocuments({ branch: branchId, status: 'active' });
        limit = tier.serviceLimit + (branch.subscription?.additionalServices ?? 0);
        label = 'services';
    }
    if (current >= limit) {
        res.status(403).json({
            error: `You have reached your ${tier.name} tier limit of ${limit} ${label}. Visit Subscription to increase your limit.`,
            code: 'LIMIT_REACHED',
            current,
            limit,
            resource,
        });
        return false;
    }
    return true;
}
//# sourceMappingURL=limitCheck.js.map