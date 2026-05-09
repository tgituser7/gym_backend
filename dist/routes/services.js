"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Service_1 = __importDefault(require("../models/Service"));
const Member_1 = __importDefault(require("../models/Member"));
const auth_1 = __importDefault(require("../middleware/auth"));
const gymFilter_1 = require("../utils/gymFilter");
const router = (0, express_1.Router)();
router.use(auth_1.default);
router.get('/', async (req, res, next) => {
    try {
        const { search, status, category, page: pageQ, limit: limitQ } = req.query;
        const extra = {};
        if (status)
            extra.status = status;
        if (category)
            extra.category = category;
        const filter = (0, gymFilter_1.branchFilter)(req, extra);
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (pageQ !== undefined || limitQ !== undefined) {
            const page = Math.max(parseInt(pageQ || '1', 10), 1);
            const limit = Math.min(Math.max(parseInt(limitQ || '10', 10), 1), 500);
            const skip = (page - 1) * limit;
            const [services, total] = await Promise.all([
                Service_1.default.find(filter).populate('instructor', 'name role specialization').sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
                Service_1.default.countDocuments(filter),
            ]);
            res.json({ services, total, page, pages: Math.ceil(total / limit) });
        }
        else {
            const services = await Service_1.default.find(filter)
                .populate('instructor', 'name role specialization')
                .sort({ createdAt: -1 });
            res.json(services);
        }
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const service = await Service_1.default.findOne((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }))
            .populate('instructor', 'name role specialization email phone');
        if (!service) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        res.json(service);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const service = await Service_1.default.create({ ...req.body, branch: req.branch._id });
        await service.populate('instructor', 'name role specialization');
        res.status(201).json(service);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const service = await Service_1.default.findOneAndUpdate((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }), req.body, { new: true, runValidators: true }).populate('instructor', 'name role specialization');
        if (!service) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        res.json(service);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const service = await Service_1.default.findOneAndDelete((0, gymFilter_1.branchFilter)(req, { _id: req.params.id }));
        if (!service) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        await Member_1.default.updateMany({ branch: req.branch._id, services: service._id }, { $pull: { services: service._id } });
        res.json({ message: 'Service deleted successfully' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map