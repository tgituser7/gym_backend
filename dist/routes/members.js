"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Member_1 = __importDefault(require("../models/Member"));
const auth_1 = __importDefault(require("../middleware/auth"));
const gymFilter_1 = require("../utils/gymFilter");
const router = (0, express_1.Router)();
router.use(auth_1.default);
router.get('/', async (req, res, next) => {
    try {
        const { search, status } = req.query;
        const filter = (0, gymFilter_1.branchFilter)(req, status ? { status } : {});
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }
        const members = await Member_1.default.find(filter)
            .populate('services', 'name price category')
            .sort({ createdAt: -1 });
        res.json(members);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const member = await Member_1.default.findOne((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }))
            .populate({ path: 'services', populate: { path: 'instructor', select: 'name role' } });
        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }
        res.json(member);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const member = await Member_1.default.create({ ...req.body, branch: req.branch._id });
        await member.populate('services', 'name price category');
        res.status(201).json(member);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const member = await Member_1.default.findOneAndUpdate((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }), req.body, { new: true, runValidators: true }).populate('services', 'name price category');
        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }
        res.json(member);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const member = await Member_1.default.findOneAndDelete((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }));
        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }
        res.json({ message: 'Member deleted successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=members.js.map