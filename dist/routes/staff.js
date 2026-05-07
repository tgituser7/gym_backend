"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Staff_1 = __importDefault(require("../models/Staff"));
const auth_1 = __importDefault(require("../middleware/auth"));
const gymFilter_1 = require("../utils/gymFilter");
const router = (0, express_1.Router)();
router.use(auth_1.default);
router.get('/', async (req, res, next) => {
    try {
        const { search, status, role } = req.query;
        const extra = {};
        if (status)
            extra.status = status;
        if (role)
            extra.role = role;
        const filter = (0, gymFilter_1.branchFilter)(req, extra);
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
            ];
        }
        const staff = await Staff_1.default.find(filter).sort({ createdAt: -1 });
        res.json(staff);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const staff = await Staff_1.default.findOne((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }));
        if (!staff) {
            res.status(404).json({ error: 'Staff member not found' });
            return;
        }
        res.json(staff);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const staff = await Staff_1.default.create({ ...req.body, branch: req.branch._id });
        res.status(201).json(staff);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const staff = await Staff_1.default.findOneAndUpdate((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }), req.body, { new: true, runValidators: true });
        if (!staff) {
            res.status(404).json({ error: 'Staff member not found' });
            return;
        }
        res.json(staff);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const staff = await Staff_1.default.findOneAndDelete((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }));
        if (!staff) {
            res.status(404).json({ error: 'Staff member not found' });
            return;
        }
        res.json({ message: 'Staff member deleted successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=staff.js.map