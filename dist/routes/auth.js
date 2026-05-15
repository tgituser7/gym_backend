"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Gym_1 = __importDefault(require("../models/Gym"));
const Branch_1 = __importDefault(require("../models/Branch"));
const auth_1 = __importDefault(require("../middleware/auth"));
const SubscriptionTier_1 = __importDefault(require("../models/SubscriptionTier"));
const router = (0, express_1.Router)();
const signToken = (branchId) => jsonwebtoken_1.default.sign({ id: branchId }, process.env.JWT_SECRET || 'gym-secret-dev-key', { expiresIn: '30d' });
const safeBranch = (b) => {
    const { password: _, ...rest } = b;
    void _;
    return rest;
};
// Register gym + auto-create first (Main) branch
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, phone, address, city, state, country, website, description, } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email and password are required' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }
        const emailExists = await Branch_1.default.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            res.status(400).json({ error: 'Email is already registered' });
            return;
        }
        const gym = await Gym_1.default.create({ name, email, phone, address, city, state, country, website, description });
        const hashed = await bcryptjs_1.default.hash(password, 12);
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
        const branch = await Branch_1.default.create({
            gym: gym._id,
            name: 'Main Branch',
            email,
            password: hashed,
            address,
            city,
            state,
            phone,
            status: 'active',
            subscription: {
                tierId: tier._id,
                additionalMembers: 0,
                additionalStaff: 0,
                additionalServices: 0,
                additionalAmount: 0,
                status: 'active',
                startDate: new Date(),
            },
        });
        const branchObj = branch.toObject();
        res.status(201).json({
            token: signToken(branch._id),
            branch: { ...safeBranch(branchObj), gym: gym.toObject() },
        });
    }
    catch (err) {
        next(err);
    }
});
// Branch login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const branch = await Branch_1.default.findOne({ email: email.toLowerCase() }).populate('gym', 'name status email');
        if (!branch || !(await bcryptjs_1.default.compare(password, branch.password))) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        if (branch.status !== 'active') {
            const msg = branch.status === 'blocked'
                ? 'This branch has been blocked. Contact support at hello.flexms@gmail.com.'
                : 'This branch is currently inactive. Contact your administrator.';
            res.status(403).json({ error: msg });
            return;
        }
        const gym = branch.get('gym');
        if (gym && gym.status !== 'active') {
            const msg = gym.status === 'blocked'
                ? 'This gym account has been blocked. Contact support at hello.flexms@gmail.com.'
                : gym.status === 'suspended'
                    ? 'This gym account has been suspended. Contact support at hello.flexms@gmail.com.'
                    : 'This gym account is currently inactive. Contact support at hello.flexms@gmail.com.';
            res.status(403).json({ error: msg });
            return;
        }
        const branchObj = branch.toObject();
        res.json({ token: signToken(branch._id), branch: safeBranch(branchObj) });
    }
    catch (err) {
        next(err);
    }
});
// Get current branch
router.get('/me', auth_1.default, (req, res) => {
    res.json(req.branch);
});
// Update current branch info
router.put('/me', auth_1.default, async (req, res, next) => {
    try {
        const { password: _pw, email: _em, gym: _gym, ...updates } = req.body;
        void _pw;
        void _em;
        void _gym;
        const branch = await Branch_1.default.findByIdAndUpdate(req.branch._id, updates, {
            new: true, runValidators: true,
        }).select('-password').populate('gym', 'name email');
        res.json(branch);
    }
    catch (err) {
        next(err);
    }
});
// Change branch password
router.put('/change-password', auth_1.default, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const branch = await Branch_1.default.findById(req.branch._id);
        if (!branch) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        if (!(await bcryptjs_1.default.compare(currentPassword, branch.password))) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }
        branch.password = await bcryptjs_1.default.hash(newPassword, 12);
        await branch.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map