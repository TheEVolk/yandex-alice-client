"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tryParseJSON(buf) {
    try {
        return JSON.parse(buf.toString());
    }
    catch (e) {
        return null;
    }
}
exports.default = tryParseJSON;
//# sourceMappingURL=tryParseJSON.js.map