import { randomUUID } from "crypto";
import type {
  IAliceActiveRequest,
  IAliceClientOptions,
  IAliceSendTextOptions,
  IAliceSendTextResponse,
  IAliceSynchronizeState,
  IAliceTTSOptions,
} from "./types";
import Uniproxy from "./uniproxy";

export default class YandexAliceClient {
  public readonly uniproxy: Uniproxy;

  public constructor(private readonly options: IAliceClientOptions = {}) {
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
      uuid: randomUUID(),
      lang: "ru-RU",
      client_time: new Date().toDateString(),
      timezone: "Europe/Moscow",
      timestamp: Math.floor(Date.now() / 1e3).toString(),
      ...options.app,
    };
    this.uniproxy = new Uniproxy(this.options);
  }

  public connect(): Promise<void> {
    return this.uniproxy.connect();
  }

  public async initTTSVoice(): Promise<void> {
    await this.tts("Hello");
  }

  public close() {
    this.uniproxy.close();
  }

  /**
   * Sign-in to Yandex account with auth_token
   * @param data
   */
  public synchronizeState(data: IAliceSynchronizeState) {
    const messageId = this.uniproxy.sendEvent(
      "System",
      "SynchronizeState",
      data
    );
    return { messageId };
  }

  async sendText(
    text: string,
    options?: Partial<IAliceSendTextOptions>
  ): Promise<IAliceActiveRequest> {
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

    const response = await this.uniproxy.store.request(() =>
      this.uniproxy.sendEvent("Vins", "TextInput", reqPayload)
    );

    return response;
  }

  async tts(text: string, options: Partial<IAliceTTSOptions> = {}) {
    const reqOpts = {
      voice: options.voice ?? "shitova.us",
      lang: options.lang ?? "ru-RU",
      format: options.format ?? "audio/opus",
      emotion: options.emotion ?? "neutral",
      quality: options.quality ?? "UltraHigh",
      text,
    };

    const response = await this.uniproxy.store.request(() =>
      this.uniproxy.sendEvent("TTS", "Generate", reqOpts)
    );

    return response;
  }

  async sendRawEvent(
    namespace: string,
    name: string,
    payload?: { [key: string]: any },
    header?: { [key: string]: any }
  ) {
    const messageId = this.uniproxy.sendEvent(
      "Vins",
      "TextInput",
      payload,
      header
    );
    return { messageId };
  }
}
