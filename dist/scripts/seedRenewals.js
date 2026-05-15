"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Idempotent seed script — safe to run multiple times, skips existing records.
 * Run: npx ts-node --transpile-only src/scripts/seedRenewals.ts
 */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const luxon_1 = require("luxon");
const Branch_1 = __importDefault(require("../models/Branch"));
const Service_1 = __importDefault(require("../models/Service"));
const Member_1 = __importDefault(require("../models/Member"));
const Fee_1 = __importDefault(require("../models/Fee"));
// ─── helpers ─────────────────────────────────────────────────────────────────
async function upsertService(data) {
    const exists = await Service_1.default.findOne({ branch: data.branch, name: data.name });
    if (exists)
        return exists;
    const doc = await Service_1.default.create(data);
    console.log(`  + service: ${data.name}`);
    return doc;
}
async function upsertMember(data) {
    const exists = await Member_1.default.findOne({ branch: data.branch, name: data.name });
    if (exists) {
        // keep renewal dates relative to today on each run
        await Member_1.default.updateOne({ _id: exists._id }, { membershipEndDate: data.membershipEndDate });
        return exists;
    }
    // Use native insert to avoid Mongoose applying the lowercase setter to
    // undefined email, which would store email:null and violate the sparse index.
    const now = luxon_1.DateTime.now().toUTC().toISO();
    const doc = {
        branch: data.branch, name: data.name,
        membershipStartDate: data.membershipStartDate,
        membershipEndDate: data.membershipEndDate,
        services: data.services, status: data.status,
        createdAt: now, updatedAt: now,
    };
    if (data.email)
        doc.email = data.email.toLowerCase().trim();
    if (data.phone)
        doc.phone = String(data.phone).trim();
    const result = await Member_1.default.collection.insertOne(doc);
    console.log(`  + member:  ${data.name}`);
    // Return a Mongoose document by fetching what was just inserted
    return Member_1.default.findById(result.insertedId);
}
async function upsertFee(data) {
    const exists = await Fee_1.default.findOne({ branch: data.branch, member: data.member, dueDate: data.dueDate });
    if (exists)
        return exists;
    const doc = await Fee_1.default.create(data);
    console.log(`  + fee:     ₹${data.amount} for member ${data.member} (${data.status})`);
    return doc;
}
// ─── main ─────────────────────────────────────────────────────────────────────
async function seed() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management');
    const branch = await Branch_1.default.findOne({ status: 'active' });
    if (!branch) {
        console.error('No active branch found.');
        process.exit(1);
    }
    console.log(`\nBranch: ${branch.name} (${branch._id})\n`);
    const b = branch._id;
    const now = luxon_1.DateTime.now().toUTC();
    // ── Services ──────────────────────────────────────────────────────────────
    console.log('Services:');
    const [yoga, cardio, strength, pilates, swimming, martialArts, dance, nutrition] = await Promise.all([
        upsertService({ branch: b, name: 'Yoga', category: 'Yoga', price: 1500, status: 'active', schedule: 'Mon/Wed/Fri 7:00 am', duration: 30 }),
        upsertService({ branch: b, name: 'Cardio Blast', category: 'Cardio', price: 1200, status: 'active', schedule: 'Daily 6:00 am & 7:00 pm', duration: 30 }),
        upsertService({ branch: b, name: 'Strength Training', category: 'Strength', price: 2000, status: 'active', schedule: 'Daily 6:00 am', duration: 30 }),
        upsertService({ branch: b, name: 'Pilates', category: 'Pilates', price: 1800, status: 'active', schedule: 'Tue/Thu/Sat 8:00 am', duration: 30 }),
        upsertService({ branch: b, name: 'Swimming', category: 'Swimming', price: 2200, status: 'active', schedule: 'Mon/Wed/Fri 6:00 am', duration: 30 }),
        upsertService({ branch: b, name: 'Martial Arts', category: 'Martial Arts', price: 1600, status: 'active', schedule: 'Tue/Thu 7:00 pm', duration: 30 }),
        upsertService({ branch: b, name: 'Dance Fitness', category: 'Dance', price: 1400, status: 'active', schedule: 'Mon/Wed/Fri 6:00 pm', duration: 30 }),
        upsertService({ branch: b, name: 'Nutrition Counseling', category: 'Nutrition', price: 3000, status: 'active', schedule: 'By appointment', duration: 30 }),
    ]);
    // ── Members ───────────────────────────────────────────────────────────────
    console.log('\nMembers:');
    const memberDefs = [
        // Expiring today / 1–2 days (urgent)
        { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '9876543210', endDays: 0, svcs: [yoga._id, cardio._id] },
        { name: 'Rohit Desai', email: 'rohit.desai@example.com', phone: '9812345678', endDays: 1, svcs: [strength._id] },
        { name: 'Meena Iyer', phone: '9823456789', endDays: 1, svcs: [yoga._id, pilates._id] },
        { name: 'Rahul Verma', phone: '8765432109', endDays: 2, svcs: [cardio._id, strength._id] },
        { name: 'Fatima Khan', email: 'fatima.k@example.com', phone: '8812345670', endDays: 2, svcs: [swimming._id] },
        // 3–7 days (warning)
        { name: 'Anjali Mehta', email: 'anjali.mehta@example.com', phone: '7654321098', endDays: 3, svcs: [strength._id, swimming._id] },
        { name: 'Suresh Kumar', email: 'suresh.k@example.com', phone: '7723456780', endDays: 4, svcs: [martialArts._id] },
        { name: 'Divya Nair', email: 'divya.nair@example.com', phone: '7634567891', endDays: 5, svcs: [dance._id, yoga._id] },
        { name: 'Vikram Singh', email: 'vikram.singh@example.com', endDays: 5, svcs: [swimming._id, cardio._id] },
        { name: 'Pooja Agarwal', phone: '7545678902', endDays: 7, svcs: [pilates._id, nutrition._id] },
        // 8–14 days (upcoming)
        { name: 'Sneha Patel', email: 'sneha.patel@example.com', phone: '6543210987', endDays: 9, svcs: [yoga._id, strength._id, swimming._id] },
        { name: 'Arjun Nair', phone: '5432109876', endDays: 10, svcs: [strength._id] },
        { name: 'Kavitha Menon', email: 'kavitha.m@example.com', phone: '6612345678', endDays: 12, svcs: [dance._id] },
        { name: 'Deepika Reddy', email: 'deepika.r@example.com', phone: '9123456780', endDays: 14, svcs: [yoga._id, pilates._id] },
        { name: 'Manoj Tiwari', email: 'manoj.t@example.com', phone: '6723456789', endDays: 14, svcs: [martialArts._id, cardio._id] },
        // 15–30 days (upcoming)
        { name: 'Lakshmi Rao', email: 'lakshmi.r@example.com', phone: '9234567801', endDays: 18, svcs: [nutrition._id] },
        { name: 'Karan Joshi', email: 'karan.j@example.com', endDays: 20, svcs: [strength._id] },
        { name: 'Ritu Gupta', email: 'ritu.g@example.com', phone: '9345678912', endDays: 22, svcs: [yoga._id, dance._id] },
        { name: 'Sanjay Bhatt', phone: '9456789023', endDays: 25, svcs: [swimming._id, martialArts._id] },
        { name: 'Nisha Sharma', email: 'nisha.s@example.com', phone: '9567890134', endDays: 30, svcs: [pilates._id, cardio._id] },
        // 31–60 days — won't appear in default view, visible at "Next 60 days" if added
        { name: 'Aditya Verma', email: 'aditya.v@example.com', phone: '9678901245', endDays: 45, svcs: [yoga._id] },
        { name: 'Chitra Pillai', email: 'chitra.p@example.com', phone: '9789012356', endDays: 60, svcs: [strength._id, nutrition._id] },
    ];
    const createdMembers = [];
    for (const def of memberDefs) {
        const doc = await upsertMember({
            branch: b,
            name: def.name,
            ...(def.email ? { email: def.email } : {}),
            ...(def.phone ? { phone: def.phone } : {}),
            membershipStartDate: now.minus({ months: 1 }).toISO(),
            membershipEndDate: now.plus({ days: def.endDays }).toISO(),
            services: def.svcs,
            status: 'active',
        });
        createdMembers.push({ id: doc._id, name: def.name, svcs: def.svcs });
    }
    // ── Fees ──────────────────────────────────────────────────────────────────
    console.log('\nFees:');
    // Pending fees for members expiring soon (no paid fee — should appear in renewals)
    const pendingTargets = createdMembers.filter((m) => ['Rohit Desai', 'Meena Iyer', 'Suresh Kumar', 'Vikram Singh', 'Pooja Agarwal',
        'Arjun Nair', 'Kavitha Menon', 'Manoj Tiwari', 'Lakshmi Rao', 'Karan Joshi',
        'Sanjay Bhatt', 'Nisha Sharma'].includes(m.name));
    for (const m of pendingTargets) {
        const amount = m.svcs.length * 1500;
        await upsertFee({
            branch: b, member: m.id,
            amount, description: 'Monthly membership renewal',
            dueDate: now.plus({ days: 3 }).toISO(),
            status: 'due', services: m.svcs,
        });
    }
    // Paid fees for Anjali (already paid — should NOT appear in renewals)
    const anjali = createdMembers.find((m) => m.name === 'Anjali Mehta');
    await upsertFee({
        branch: b, member: anjali.id,
        amount: 3800, description: 'Monthly membership renewal',
        dueDate: now.minus({ days: 2 }).toISO(),
        settledOn: now.minus({ days: 2 }).toISO(),
        status: 'settled', feesMethod: 'online', services: anjali.svcs,
    });
    // Overdue fees for a few members
    const overdueTargets = createdMembers.filter((m) => ['Rahul Verma', 'Fatima Khan', 'Divya Nair'].includes(m.name));
    for (const m of overdueTargets) {
        await upsertFee({
            branch: b, member: m.id,
            amount: m.svcs.length * 1500,
            description: 'Overdue membership fee',
            dueDate: now.minus({ days: 5 }).toISO(),
            status: 'overdue', services: m.svcs,
        });
    }
    // Paid fee for Priya (for a past period — still appears in renewals since > 60 days logic won't catch it)
    const priya = createdMembers.find((m) => m.name === 'Priya Sharma');
    await upsertFee({
        branch: b, member: priya.id,
        amount: 2700, description: 'Previous month fee',
        dueDate: now.minus({ days: 35 }).toISO(),
        settledOn: now.minus({ days: 35 }).toISO(),
        status: 'settled', feesMethod: 'cash', services: priya.svcs,
    });
    console.log('\nDone.\n');
    await mongoose_1.default.disconnect();
}
seed().catch((err) => { console.error(err); process.exit(1); });
//# sourceMappingURL=seedRenewals.js.map