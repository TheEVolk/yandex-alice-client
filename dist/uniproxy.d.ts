import { client as WebSocketClient } from "websocket";
import Store from "./store";
import type { IAliceClientOptions } from "./types";
export default class Uniproxy {
    opts: IAliceClientOptions;
    private streams;
    private conn?;
    store: Store;
    client: WebSocketClient;
    constructor(opts: IAliceClientOptions);
    /**
     * Connects to API server
     * @param server API url
     */
    connect(): Promise<void>;
    close(): void;
    private sendFirstPacket;
    private onMessage;
    private onBuffer;
    private onStreamcontrol;
    private onDirective;
    /**
     * Sends data to API server
     * @param namespace
     * @param name
     * @param payload
     * @param header
     */
    sendEvent(namespace: string, name: string, payload: any, header?: any): string;
}
//# sourceMappingURL=uniproxy.d.ts.map