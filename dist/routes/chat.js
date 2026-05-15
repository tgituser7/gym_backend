"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ChatInquiry_1 = __importDefault(require("../models/ChatInquiry"));
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const { name, mobile, email, gymName, city, message } = req.body;
    if (!name || !mobile || !gymName || !message) {
        res.status(400).json({ error: 'name, mobile, gymName and message are required' });
        return;
    }
    const inquiry = await ChatInquiry_1.default.create({ name, mobile, email, gymName, city, message });
    res.status(201).json({ ok: true, id: inquiry._id });
});
exports.default = router;
//# sourceMappingURL=chat.js.map