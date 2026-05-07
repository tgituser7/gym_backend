"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Branch_1 = __importDefault(require("../models/Branch"));
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Not authorized — token missing' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'gym-secret-dev-key');
        const branch = await Branch_1.default.findById(decoded.id)
            .select('-password')
            .populate('gym', 'name status email');
        if (!branch) {
            res.status(401).json({ error: 'Branch not found' });
            return;
        }
        if (branch.status === 'inactive') {
            res.status(403).json({ error: 'This branch is inactive' });
            return;
        }
        req.branch = branch;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.default = protect;
//# sourceMappingURL=auth.js.map