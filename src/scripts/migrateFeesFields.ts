/**
 * One-time migration: renames paymentDate → settledOn and paymentMethod → feesMethod
 * on all existing documents in the fees collection.
 *
 * Run: npx ts-node --transpile-only src/scripts/migrateFeesFields.ts
 * Safe to run multiple times — documents without the old fields are unaffected.
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in environment');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.collection('fees');

  // Step 1: rename field names
  const renameResult = await collection.updateMany(
    { $or: [{ paymentDate: { $exists: true } }, { paymentMethod: { $exists: true } }] },
    { $rename: { paymentDate: 'settledOn', paymentMethod: 'feesMethod' } }
  );
  console.log(`Fields renamed: ${renameResult.modifiedCount} document(s) updated.`);

  // Step 2: rename status values
  const paidResult = await collection.updateMany({ status: 'paid' }, { $set: { status: 'settled' } });
  console.log(`'paid' → 'settled': ${paidResult.modifiedCount} document(s) updated.`);

  const pendingResult = await collection.updateMany({ status: 'pending' }, { $set: { status: 'due' } });
  console.log(`'pending' → 'due': ${pendingResult.modifiedCount} document(s) updated.`);

  console.log('Migration complete.');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
