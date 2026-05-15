"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const auth_1 = __importDefault(require("./routes/auth"));
const branches_1 = __importDefault(require("./routes/branches"));
const members_1 = __importDefault(require("./routes/members"));
const staff_1 = __importDefault(require("./routes/staff"));
const services_1 = __importDefault(require("./routes/services"));
const fees_1 = __importDefault(require("./routes/fees"));
const stats_1 = __importDefault(require("./routes/stats"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const chat_1 = __importDefault(require("./routes/chat"));
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
    : true; // allow all origins when CLIENT_URL is not set
app.use((0, cors_1.default)({ origin: allowedOrigins, credentials: true }));
app.use(express_1.default.json());
app.get('/ping', (_, res) => res.json({ ok: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/branches', branches_1.default);
app.use('/api/members', members_1.default);
app.use('/api/staff', staff_1.default);
app.use('/api/services', services_1.default);
app.use('/api/fees', fees_1.default);
app.use('/api/stats', stats_1.default);
app.use('/api/subscription', subscription_1.default);
app.use('/api/chat', chat_1.default);
app.use(errorHandler_1.default);
const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT);
// Keep Render free-tier alive — ping self every 5 minutes
if (process.env.RENDER_EXTERNAL_URL) {
    const url = `${process.env.RENDER_EXTERNAL_URL}/ping`;
    setInterval(() => { fetch(url).catch(() => { }); }, 5 * 60 * 1000);
}
//# sourceMappingURL=server.js.map