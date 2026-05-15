/**
 * One-time migration: assigns the Starter tier to every branch that has no subscription.
 * Run: npx ts-node --transpile-only src/scripts/assignStarterPlan.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Branch from '../models/Branch';
import SubscriptionTier from '../models/SubscriptionTier';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management');

  let tier = await SubscriptionTier.findOne({ isActive: true });
  if (!tier) {
    tier = await SubscriptionTier.create({
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

  const branches = await Branch.find({ 'subscription.tierId': { $exists: false } });
  console.log(`Found ${branches.length} branch(es) without a subscription`);

  for (const branch of branches) {
    await Branch.updateOne(
      { _id: branch._id },
      {
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
      }
    );
    console.log(`  Assigned Starter to: ${branch.name} (${branch.email})`);
  }

  console.log('\nDone.\n');
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
