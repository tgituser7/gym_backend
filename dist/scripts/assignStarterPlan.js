"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * One-time migration: assigns the Starter tier to every branch that has no subscription.
 * Run: npx ts-node --transpile-only src/scripts/assignStarterPlan.ts
 */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const Branch_1 = __importDefault(require("../models/Branch"));
const SubscriptionTier_1 = __importDefault(require("../models/SubscriptionTier"));
async function run() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management');
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
        console.log('Created Starter tier');
    }
    console.log(`Using tier: ${tier.name} (${tier._id})`);
    const branches = await Branch_1.default.find({ 'subscription.tierId': { $exists: false } });
    console.log(`Found ${branches.length} branch(es) without a subscription`);
    for (const branch of branches) {
        await Branch_1.default.updateOne({ _id: branch._id }, {
            $set: {
                subscription: {
                    tierId: tier._id,
                    additionalMembers: 0,
                    additionalStaff: 0,
                    additionalServices: 0,
                    additionalAmount: 0,
                    status: 'active',
                    startDate: new Date(),
                },
            },
        });
        console.log(`  Assigned Starter to: ${branch.name} (${branch.email})`);
    }
    console.log('\nDone.\n');
    await mongoose_1.default.disconnect();
}
run().catch((err) => { console.error(err); process.exit(1); });
//# sourceMappingURL=assignStarterPlan.js.map