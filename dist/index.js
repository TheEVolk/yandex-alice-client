"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const uniproxy_1 = __importDefault(require("./uniproxy"));
class YandexAliceClient {
    constructor(options = {}) {
        this.options = options;
        this.options.log = options.log ?? false;
        this.options.autoReconnect = options.autoReconnect ?? true;
        this.options.connTimeout = options.connTimeout || 3 * 1000;
        this.options.reqTimeout = options.reqTimeout || 20 * 1000;
        this.options.server = options.server || "wss://uniproxy.alice.ya.ru/uni.ws";
        this.options.app = {
            app_id: "aliced",
            app_version: "1.2.3",
            os_version: "5.0",
            platform: "android",
            uuid: (0, crypto_1.randomUUID)(),
            lang: "ru-RU",
            client_time: new Date().toDateString(),
            timezone: "Europe/Moscow",
            timestamp: Math.floor(Date.now() / 1e3).toString(),
            ...options.app,
        };
        this.uniproxy = new uniproxy_1.default(this.options);
    }
    connect() {
        return this.uniproxy.connect();
    }
    async initTTSVoice() {
        await this.tts("Hello");
    }
    close() {
        this.uniproxy.close();
    }
    /**
     * Sign-in to Yandex account with auth_token
     * @param data
     */
    synchronizeState(data) {
        const messageId = this.uniproxy.sendEvent("System", "SynchronizeState", data);
        return { messageId };
    }
    async sendText(text, options) {
        options = { ...options, isTTS: options?.isTTS ?? false };
        const reqPayload = {
            request: {
                voice_session: options.isTTS,
                event: {
                    type: "text_input",
                    text,
                },
            },
            application: this.options.app,
        };
        const response = await this.uniproxy.store.request(() => this.uniproxy.sendEvent("Vins", "TextInput", reqPayload));
        return response;
    }
    async tts(text, options = {}) {
        const reqOpts = {
            voice: options.voice ?? "shitova.us",
            lang: options.lang ?? "ru-RU",
            format: options.format ?? "audio/opus",
            emotion: options.emotion ?? "neutral",
            quality: options.quality ?? "UltraHigh",
            text,
        };
        const response = await this.uniproxy.store.request(() => this.uniproxy.sendEvent("TTS", "Generate", reqOpts));
        return response;
    }
    async sendRawEvent(namespace, name, payload, header) {
        return this.uniproxy.sendEvent(namespace, name, payload, header);
    }
}
exports.default = YandexAliceClient;
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map