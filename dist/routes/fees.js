"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const luxon_1 = require("luxon");
const Fee_1 = __importDefault(require("../models/Fee"));
const auth_1 = __importDefault(require("../middleware/auth"));
const gymFilter_1 = require("../utils/gymFilter");
const router = (0, express_1.Router)();
router.use(auth_1.default);
function withOverdue(statusQuery) {
    if (!statusQuery || statusQuery === 'overdue') {
        const now = luxon_1.DateTime.now().toUTC().toJSDate();
        return statusQuery === 'overdue'
            ? { $or: [{ status: 'overdue' }, { status: 'pending', dueDate: { $lt: now } }] }
            : {};
    }
    return { status: statusQuery };
}
router.get('/', async (req, res, next) => {
    try {
        const { status, memberId } = req.query;
        const filter = (0, gymFilter_1.branchFilter)(req, { ...withOverdue(status), ...(memberId ? { member: memberId } : {}) });
        const fees = await Fee_1.default.find(filter)
            .populate('member', 'name email phone')
            .populate('services', 'name price')
            .sort({ dueDate: -1 });
        res.json(fees);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const fee = await Fee_1.default.findOne((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }))
            .populate('member', 'name email phone')
            .populate('services', 'name price');
        if (!fee) {
            res.status(404).json({ error: 'Fee not found' });
            return;
        }
        res.json(fee);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const fee = await Fee_1.default.create({ ...req.body, branch: req.branch._id });
        await fee.populate('member', 'name email phone');
        res.status(201).json(fee);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const fee = await Fee_1.default.findOneAndUpdate((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }), req.body, { new: true, runValidators: true }).populate('member', 'name email phone').populate('services', 'name price');
        if (!fee) {
            res.status(404).json({ error: 'Fee not found' });
            return;
        }
        res.json(fee);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const fee = await Fee_1.default.findOneAndDelete((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }));
        if (!fee) {
            res.status(404).json({ error: 'Fee not found' });
            return;
        }
        res.json({ message: 'Fee deleted successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=fees.js.map