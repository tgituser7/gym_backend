"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchFilter = branchFilter;
function branchFilter(req, extra = {}) {
    return { branch: req.branch._id, ...extra };
}
//# sourceMappingURL=gymFilter.js.map