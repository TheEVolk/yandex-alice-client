"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function log(t, ...args) {
    if (this.opts.log) {
        console[t]("[alice-client]", ...args);
    }
}
exports.default = log;
//# sourceMappingURL=logger.js.map