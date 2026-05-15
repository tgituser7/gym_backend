"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Clears all Members, Fees, Services and Staff for the gym@gmail.com branch,
 * then reseeds fresh demo data.
 *
 * Run: npx ts-node --transpile-only src/scripts/resetAndSeed.ts
 */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const luxon_1 = require("luxon");
const Branch_1 = __importDefault(require("../models/Branch"));
const Service_1 = __importDefault(require("../models/Service"));
const Member_1 = __importDefault(require("../models/Member"));
const Fee_1 = __importDefault(require("../models/Fee"));
const Staff_1 = __importDefault(require("../models/Staff"));
const TARGET_EMAIL = 'gym@gmail.com';
async function run() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management');
    const branch = await Branch_1.default.findOne({ email: TARGET_EMAIL });
    if (!branch) {
        console.error(`No branch found with email: ${TARGET_EMAIL}`);
        process.exit(1);
    }
    const b = branch._id;
    console.log(`\nBranch: ${branch.name} (${b})\n`);
    // ── Clear old data ──────────────────────────────────────────────────────────
    console.log('Clearing old data...');
    const [fees, members, services, staff] = await Promise.all([
        Fee_1.default.deleteMany({ branch: b }),
        Member_1.default.deleteMany({ branch: b }),
        Service_1.default.deleteMany({ branch: b }),
        Staff_1.default.deleteMany({ branch: b }),
    ]);
    console.log(`  Deleted ${fees.deletedCount} fees`);
    console.log(`  Deleted ${members.deletedCount} members`);
    console.log(`  Deleted ${services.deletedCount} services`);
    console.log(`  Deleted ${staff.deletedCount} staff`);
    const now = luxon_1.DateTime.now().toUTC();
    // ── Seed Services ───────────────────────────────────────────────────────────
    console.log('\nSeeding services...');
    const [yoga, cardio, strength, pilates, swimming, martialArts, dance, nutrition] = await Service_1.default.insertMany([
        { branch: b, name: 'Yoga', category: 'Yoga', price: 1500, status: 'active', schedule: 'Mon/Wed/Fri 7:00 am', duration: 60 },
        { branch: b, name: 'Cardio Blast', category: 'Cardio', price: 1200, status: 'active', schedule: 'Daily 6:00 am & 7:00 pm', duration: 45 },
        { branch: b, name: 'Strength Training', category: 'Strength', price: 2000, status: 'active', schedule: 'Daily 6:00 am', duration: 60 },
        { branch: b, name: 'Pilates', category: 'Pilates', price: 1800, status: 'active', schedule: 'Tue/Thu/Sat 8:00 am', duration: 60 },
        { branch: b, name: 'Swimming', category: 'Swimming', price: 2200, status: 'active', schedule: 'Mon/Wed/Fri 6:00 am', duration: 45 },
        { branch: b, name: 'Martial Arts', category: 'Martial Arts', price: 1600, status: 'active', schedule: 'Tue/Thu 7:00 pm', duration: 60 },
        { branch: b, name: 'Dance Fitness', category: 'Dance', price: 1400, status: 'active', schedule: 'Mon/Wed/Fri 6:00 pm', duration: 45 },
        { branch: b, name: 'Nutrition Counseling', category: 'Nutrition', price: 3000, status: 'active', schedule: 'By appointment', duration: 30 },
    ]);
    console.log(`  Created 8 services`);
    // ── Seed Members ────────────────────────────────────────────────────────────
    console.log('\nSeeding members...');
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
        // 15–30 days
        { name: 'Lakshmi Rao', email: 'lakshmi.r@example.com', phone: '9234567801', endDays: 18, svcs: [nutrition._id] },
        { name: 'Karan Joshi', email: 'karan.j@example.com', endDays: 20, svcs: [strength._id] },
        { name: 'Ritu Gupta', email: 'ritu.g@example.com', phone: '9345678912', endDays: 22, svcs: [yoga._id, dance._id] },
        { name: 'Sanjay Bhatt', phone: '9456789023', endDays: 25, svcs: [swimming._id, martialArts._id] },
        { name: 'Nisha Sharma', email: 'nisha.s@example.com', phone: '9567890134', endDays: 30, svcs: [pilates._id, cardio._id] },
        // 31–60 days
        { name: 'Aditya Verma', email: 'aditya.v@example.com', phone: '9678901245', endDays: 45, svcs: [yoga._id] },
        { name: 'Chitra Pillai', email: 'chitra.p@example.com', phone: '9789012356', endDays: 60, svcs: [strength._id, nutrition._id] },
    ];
    const createdMembers = [];
    for (const def of memberDefs) {
        const doc = {
            branch: b,
            name: def.name,
            membershipStartDate: now.minus({ months: 1 }).toISO(),
            membershipEndDate: now.plus({ days: def.endDays }).toISO(),
            services: def.svcs,
            status: 'active',
            createdAt: luxon_1.DateTime.now().toUTC().toISO(),
            updatedAt: luxon_1.DateTime.now().toUTC().toISO(),
        };
        if ('email' in def)
            doc.email = def.email.toLowerCase().trim();
        if ('phone' in def)
            doc.phone = def.phone;
        const result = await Member_1.default.collection.insertOne(doc);
        const inserted = await Member_1.default.findById(result.insertedId);
        createdMembers.push({ id: inserted._id, name: def.name, svcs: def.svcs });
        console.log(`  + ${def.name}`);
    }
    // ── Seed Fees ───────────────────────────────────────────────────────────────
    console.log('\nSeeding fees...');
    // Due fees for members expiring soon
    const dueTargets = createdMembers.filter((m) => ['Rohit Desai', 'Meena Iyer', 'Suresh Kumar', 'Vikram Singh', 'Pooja Agarwal',
        'Arjun Nair', 'Kavitha Menon', 'Manoj Tiwari', 'Lakshmi Rao', 'Karan Joshi',
        'Sanjay Bhatt', 'Nisha Sharma'].includes(m.name));
    const dueFees = dueTargets.map((m) => ({
        branch: b, member: m.id,
        amount: m.svcs.length * 1500,
        description: 'Monthly membership renewal',
        dueDate: now.plus({ days: 3 }).toISO(),
        status: 'due', services: m.svcs,
    }));
    await Fee_1.default.insertMany(dueFees);
    console.log(`  Created ${dueFees.length} due fees`);
    // Settled fee for Anjali
    const anjali = createdMembers.find((m) => m.name === 'Anjali Mehta');
    await Fee_1.default.create({
        branch: b, member: anjali.id,
        amount: 3800, description: 'Monthly membership renewal',
        dueDate: now.minus({ days: 2 }).toISO(),
        settledOn: now.minus({ days: 2 }).toISO(),
        status: 'settled', feesMethod: 'online', services: anjali.svcs,
    });
    console.log(`  Created 1 settled fee (Anjali Mehta)`);
    // Overdue fees
    const overdueTargets = createdMembers.filter((m) => ['Rahul Verma', 'Fatima Khan', 'Divya Nair'].includes(m.name));
    const overdueFees = overdueTargets.map((m) => ({
        branch: b, member: m.id,
        amount: m.svcs.length * 1500,
        description: 'Overdue membership fee',
        dueDate: now.minus({ days: 5 }).toISO(),
        status: 'overdue', services: m.svcs,
    }));
    await Fee_1.default.insertMany(overdueFees);
    console.log(`  Created ${overdueFees.length} overdue fees`);
    // Settled fee for Priya (past period)
    const priya = createdMembers.find((m) => m.name === 'Priya Sharma');
    await Fee_1.default.create({
        branch: b, member: priya.id,
        amount: 2700, description: 'Previous month fee',
        dueDate: now.minus({ days: 35 }).toISO(),
        settledOn: now.minus({ days: 35 }).toISO(),
        status: 'settled', feesMethod: 'cash', services: priya.svcs,
    });
    console.log(`  Created 1 settled fee (Priya Sharma)`);
    console.log('\nDone. Database reset and reseeded.\n');
    await mongoose_1.default.disconnect();
}
run().catch((err) => { console.error(err); process.exit(1); });
//# sourceMappingURL=resetAndSeed.js.map