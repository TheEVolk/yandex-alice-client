"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const promises_1 = require("timers/promises");
const websocket_1 = require("websocket");
const logger_1 = __importDefault(require("./utils/logger"));
const tryParseJSON_1 = __importDefault(require("./utils/tryParseJSON"));
const store_1 = __importDefault(require("./store"));
class Uniproxy {
    constructor(opts) {
        this.opts = opts;
        this.streams = new Map();
        this.store = new store_1.default(this.opts);
        this.opts = opts;
        this.client = new websocket_1.client({
            closeTimeout: this.opts.connTimeout,
        });
    }
    /**
     * Connects to API server
     * @param server API url
     */
    async connect() {
        logger_1.default.bind(this)("info", "CONNECTING");
        while (this.opts.autoReconnect === true) {
            await new Promise((resolve, reject) => {
                this.client.once("connect", async (connection) => {
                    this.conn = connection;
                    logger_1.default.bind(this)("info", "CONNECTED");
                    connection.on("error", async (error) => {
                        logger_1.default.bind(this)("error", "CONNECT_ERROR", error.toString());
                        if (this.opts.autoReconnect)
                            resolve(true);
                        else
                            reject(error);
                    });
                    connection.on("close", async () => {
                        logger_1.default.bind(this)("info", "CONNECTION_CLOSED");
                        resolve(true);
                    });
                    connection.on("message", this.onMessage.bind(this));
                    // Send first packet for initial voice
                    await this.sendFirstPacket();
                });
                this.client.connect(`${this.opts.server}`);
            });
            await (0, promises_1.setTimeout)(1000);
        }
    }
    close() {
        this.conn?.close();
    }
    async sendFirstPacket() {
        this.store.request(() => this.sendEvent("TTS", "Generate", {
            voice: "shitova.us",
            lang: "ru-RU",
            format: "audio/opus",
            emotion: "neutral",
            quality: "UltraHigh",
            text: "Привет",
        }));
    }
    onMessage(data) {
        let response;
        if (data.type === "utf8") {
            const dataJSON = (0, tryParseJSON_1.default)(data.utf8Data);
            if (dataJSON) {
                response = dataJSON;
            }
            else {
                return logger_1.default.bind(this)("error", "INVALID_MESSAGE", data.utf8Data);
            }
        }
        else {
            logger_1.default.bind(this)("info", "RESPONSE_AUDIO_FILE_RECEIVED");
            return this.onBuffer(data.binaryData);
        }
        const streamControlRes = response.streamcontrol;
        const streamDirective = response.directive;
        logger_1.default.bind(this)("info", "RESPONSE_RECEIVED", JSON.stringify(response));
        if (streamDirective)
            this.onDirective(streamDirective);
        if (streamControlRes)
            this.onStreamcontrol(streamControlRes);
    }
    onBuffer(data) {
        const streamId = data.subarray(0, 4).readInt32BE();
        this.store.stream.push(`${streamId}`, "b", data.subarray(4));
    }
    onStreamcontrol(streamcontrol) {
        const streamId = `${streamcontrol.streamId}`;
        const stream = this.store.stream.get(streamId);
        if (!stream) {
            logger_1.default.bind(this)("error", `NO_STREAM: ${streamId}`);
        }
        else {
            const { i: reqId, b } = stream;
            const buffer = Buffer.concat(b);
            this.store.store.add(reqId, { audioData: buffer });
            this.store.stream.delete(streamId);
            this.store.store.resolve(reqId);
        }
    }
    onDirective(directive) {
        const reqId = directive.header.refMessageId;
        const type = directive.header.name;
        if (type === "VinsResponse") {
            this.store.store.add(reqId, {
                text: directive.payload.response.card,
                suggest: directive?.payload?.response?.suggest?.items ?? [],
            });
            if (directive.payload.voice_response.should_listen === false)
                this.store.store.resolve(reqId);
        }
        else if (type === "Speak") {
            const streamId = `${directive.header.streamId}`;
            this.store.store.add(reqId, {
                audioFormat: directive.payload.format,
                streamId: streamId,
            });
            this.store.stream.set(`${directive.header.streamId}`, { i: reqId });
        }
        else if (type === "GoAway") {
            // it means what we should reconnect
            if (this.opts.app) {
                this.opts.app.uuid = (0, crypto_1.randomUUID)();
                this.opts.app.client_time = new Date().toDateString();
                this.opts.app.timestamp = Math.floor(Date.now() / 1e3).toString();
                this.close();
            }
        }
    }
    /**
     * Sends data to API server
     * @param namespace
     * @param name
     * @param payload
     * @param header
     */
    sendEvent(namespace, name, payload, header = {}) {
        const event = {
            header: {
                namespace,
                name,
                messageId: (0, crypto_1.randomUUID)(),
                ...header,
                // seqNumber
            },
            payload,
        };
        this.conn?.sendUTF(JSON.stringify({ event }));
        return event.header.messageId;
    }
}
exports.default = Uniproxy;
//# sourceMappingURL=uniproxy.js.map