"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chatInquirySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    gymName: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('ChatInquiry', chatInquirySchema);
//# sourceMappingURL=ChatInquiry.js.map