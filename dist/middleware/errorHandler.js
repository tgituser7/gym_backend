"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, _req, res, _next) => {
    console.error(err.stack);
    if (err.name === 'ValidationError' && err.errors) {
        const messages = Object.values(err.errors).map((e) => e.message);
        res.status(400).json({ error: messages.join(', ') });
        return;
    }
    if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        res.status(400).json({ error: `${field} already exists` });
        return;
    }
    if (err.name === 'CastError') {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
    }
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal server error' });
};
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map