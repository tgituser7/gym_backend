"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Branch_1 = __importDefault(require("../models/Branch"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.use(auth_1.default);
function gymId(req) {
    return req.branch.gym._id;
}
router.get('/', async (req, res, next) => {
    try {
        const filter = { gym: gymId(req) };
        if (req.query.status)
            filter.status = req.query.status;
        const branches = await Branch_1.default.find(filter)
            .select('-password')
            .populate('manager', 'name role')
            .sort({ createdAt: -1 });
        res.json(branches);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const branch = await Branch_1.default.findOne({ _id: req.params.id, gym: gymId(req) })
            .select('-password')
            .populate('manager', 'name role email phone');
        if (!branch) {
            res.status(404).json({ error: 'Branch not found' });
            return;
        }
        res.json(branch);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { password, ...rest } = req.body;
        if (!password) {
            res.status(400).json({ error: 'Password is required for a new branch' });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 12);
        const branch = await Branch_1.default.create({ ...rest, gym: gymId(req), password: hashed });
        const { password: _pw, ...safe } = branch.toObject();
        void _pw;
        res.status(201).json(safe);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { password, ...rest } = req.body;
        const update = { ...rest };
        if (password)
            update.password = await bcryptjs_1.default.hash(password, 12);
        const branch = await Branch_1.default.findOneAndUpdate({ _id: req.params.id, gym: gymId(req) }, update, { new: true, runValidators: true }).select('-password').populate('manager', 'name role');
        if (!branch) {
            res.status(404).json({ error: 'Branch not found' });
            return;
        }
        res.json(branch);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id === String(req.branch._id)) {
            res.status(400).json({ error: 'Cannot delete the branch you are currently logged in to' });
            return;
        }
        const branch = await Branch_1.default.findOneAndDelete({ _id: req.params.id, gym: gymId(req) });
        if (!branch) {
            res.status(404).json({ error: 'Branch not found' });
            return;
        }
        res.json({ message: 'Branch deleted successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=branches.js.map