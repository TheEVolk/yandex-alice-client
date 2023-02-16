"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("timers/promises");
function MapWatch(onSet) {
    const map = new Map();
    return {
        get: (key) => map.get(key),
        set: (key, value) => map.set(key, value),
        delete: (key) => map.delete(key),
        add: (key, value) => {
            let obj = map.get(key);
            if (!obj) {
                map.set(key, {});
                obj = {};
            }
            Object.assign(obj, value);
            map.set(key, obj);
        },
        push: (key, index, value) => {
            let obj = map.get(key);
            let objKeyVal = obj[index] ?? [];
            if (!obj) {
                map.set(key, {});
                obj = {};
            }
            objKeyVal.push(value);
            obj[index] = objKeyVal;
            map.set(key, obj);
        },
        resolve: (key) => {
            const obj = map.get(key);
            if (obj && onSet)
                onSet(key, obj);
        },
    };
}
class Store {
    constructor(opts) {
        this.opts = opts;
        this.store = MapWatch(this.onStoreChanged.bind(this));
        this.stream = MapWatch();
        this.resolvers = new Map();
        this.timeouters = new Map();
    }
    onStoreChanged(key, value) {
        const resolver = this.resolvers.get(key);
        if (resolver)
            resolver(value);
    }
    async request(request) {
        const execute = async () => {
            // Send a request
            const reqId = request();
            // Wait for response
            const response = await new Promise((resolve, reject) => {
                this.timeouters.set(reqId, setTimeout(() => {
                    this.store.delete(reqId);
                    this.resolvers.delete(reqId);
                    this.timeouters.delete(reqId);
                    reject(new Error("REQUEST_TIMEOUT"));
                }, this.opts.reqTimeout));
                this.resolvers.set(reqId, (result) => {
                    this.store.delete(reqId);
                    this.resolvers.delete(reqId);
                    this.timeouters.delete(reqId);
                    resolve(result);
                });
            });
            // Return response
            return response;
        };
        let tries = 0;
        while (tries < 3) {
            tries++;
            try {
                const result = await execute();
                tries = 3;
                return result;
            }
            catch (error) {
                await (0, promises_1.setTimeout)(3000);
            }
        }
        return { text: { type: "", text: "" } };
    }
}
exports.default = Store;
//# sourceMappingURL=store.js.map