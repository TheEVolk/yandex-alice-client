import type { IAliceActiveRequest, IAliceClientOptions, IAliceSendTextOptions, IAliceSynchronizeState, IAliceTTSOptions } from "./types";
import Uniproxy from "./uniproxy";
export default class YandexAliceClient {
    private readonly options;
    readonly uniproxy: Uniproxy;
    constructor(options?: IAliceClientOptions);
    connect(): Promise<void>;
    initTTSVoice(): Promise<void>;
    close(): void;
    /**
     * Sign-in to Yandex account with auth_token
     * @param data
     */
    synchronizeState(data: IAliceSynchronizeState): {
        messageId: string;
    };
    sendText(text: string, options?: Partial<IAliceSendTextOptions>): Promise<IAliceActiveRequest>;
    tts(text: string, options?: Partial<IAliceTTSOptions>): Promise<IAliceActiveRequest>;
    sendRawEvent(namespace: string, name: string, payload?: {
        [key: string]: any;
    }, header?: {
        [key: string]: any;
    }): Promise<string>;
}
export * from "./types";
//# sourceMappingURL=index.d.ts.map