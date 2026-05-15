"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * One-time migration: renames paymentDate → settledOn and paymentMethod → feesMethod
 * on all existing documents in the fees collection.
 *
 * Run: npx ts-node --transpile-only src/scripts/migrateFeesFields.ts
 * Safe to run multiple times — documents without the old fields are unaffected.
 */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
async function migrate() {
    const uri = process.env.MONGODB_URI;
    if (!uri)
        throw new Error('MONGODB_URI is not set in environment');
    await mongoose_1.default.connect(uri);
    console.log('Connected to MongoDB');
    const collection = mongoose_1.default.connection.collection('fees');
    // Step 1: rename field names
    const renameResult = await collection.updateMany({ $or: [{ paymentDate: { $exists: true } }, { paymentMethod: { $exists: true } }] }, { $rename: { paymentDate: 'settledOn', paymentMethod: 'feesMethod' } });
    console.log(`Fields renamed: ${renameResult.modifiedCount} document(s) updated.`);
    // Step 2: rename status values
    const paidResult = await collection.updateMany({ status: 'paid' }, { $set: { status: 'settled' } });
    console.log(`'paid' → 'settled': ${paidResult.modifiedCount} document(s) updated.`);
    const pendingResult = await collection.updateMany({ status: 'pending' }, { $set: { status: 'due' } });
    console.log(`'pending' → 'due': ${pendingResult.modifiedCount} document(s) updated.`);
    console.log('Migration complete.');
    await mongoose_1.default.disconnect();
}
migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrateFeesFields.js.map