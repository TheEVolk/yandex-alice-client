import { randomUUID } from "crypto";
import { setTimeout } from "timers/promises";
import { client as WebSocketClient, connection, Message } from "websocket";
import {
  ApiResDirective,
  ApiResDirectiveRoot,
  Streamcontrol,
  StreamcontrolRoot,
} from "./typings/api";
import log from "./utils/logger";
import tryParseJSON from "./utils/tryParseJSON";
import Store from "./store";
import type { IAliceActiveRequest, IAliceClientOptions } from "./types";

interface IAliceStream {
  messageId: string;
  buffers: Buffer[];
  streamId: number;
}

export default class Uniproxy {
  private streams = new Map<number, IAliceStream>();
  private conn?: connection;
  public store = new Store(this.opts);
  public client: WebSocketClient;

  constructor(public opts: IAliceClientOptions) {
    this.opts = opts;
    this.client = new WebSocketClient({
      closeTimeout: this.opts.connTimeout,
    });
  }

  /**
   * Connects to API server
   * @param server API url
   */
  public async connect(): Promise<void> {
    log.bind(this)("info", "CONNECTING");

    while (this.opts.autoReconnect === true) {
      await new Promise((resolve, reject) => {
        this.client.once("connect", async (connection) => {
          this.conn = connection;
          log.bind(this)("info", "CONNECTED");

          connection.on("error", async (error: Error) => {
            log.bind(this)("error", "CONNECT_ERROR", error.toString());
            if (this.opts.autoReconnect) resolve(true);
            else reject(error);
          });

          connection.on("close", async () => {
            log.bind(this)("info", "CONNECTION_CLOSED");
            resolve(true);
          });

          connection.on("message", this.onMessage.bind(this));

          // Send first packet for initial voice
          await this.sendFirstPacket();
        });

        this.client.connect(`${this.opts.server}`);
      });

      await setTimeout(1000);
    }
  }

  public close() {
    this.conn?.close();
  }

  private async sendFirstPacket() {
    this.store.request(() =>
      this.sendEvent("TTS", "Generate", {
        voice: "shitova.us",
        lang: "ru-RU",
        format: "audio/opus",
        emotion: "neutral",
        quality: "UltraHigh",
        text: "Привет",
      })
    );
  }

  private onMessage(data: Message) {
    let response: ApiResDirectiveRoot | StreamcontrolRoot;

    if (data.type === "utf8") {
      const dataJSON = tryParseJSON(data.utf8Data);
      if (dataJSON) {
        response = dataJSON;
      } else {
        return log.bind(this)("error", "INVALID_MESSAGE", data.utf8Data);
      }
    } else {
      log.bind(this)("info", "RESPONSE_AUDIO_FILE_RECEIVED");
      return this.onBuffer(data.binaryData);
    }

    const streamControlRes = (response as StreamcontrolRoot).streamcontrol;
    const streamDirective = (response as ApiResDirectiveRoot).directive;

    log.bind(this)("info", "RESPONSE_RECEIVED", JSON.stringify(response));

    if (streamDirective) this.onDirective(streamDirective);
    if (streamControlRes) this.onStreamcontrol(streamControlRes);
  }

  private onBuffer(data: Buffer) {
    const streamId = data.subarray(0, 4).readInt32BE();
    this.store.stream.push(`${streamId}`, "b", data.subarray(4));
  }

  private onStreamcontrol(streamcontrol: Streamcontrol) {
    const streamId = `${streamcontrol.streamId}`;
    const stream = this.store.stream.get(streamId);
    if (!stream) {
      log.bind(this)("error", `NO_STREAM: ${streamId}`);
    } else {
      const { i: reqId, b } = stream;
      const buffer = Buffer.concat(b);
      this.store.store.add(reqId, { audioData: buffer });
      this.store.stream.delete(streamId);
      this.store.store.resolve(reqId);
    }
  }

  private onDirective(directive: ApiResDirective) {
    const reqId = directive.header.refMessageId;
    const type = directive.header.name;

    if (type === "VinsResponse") {
      this.store.store.add(reqId, {
        text: directive.payload.response.card,
        suggest: directive?.payload?.response?.suggest?.items ?? [],
      });
      if (directive.payload.voice_response.should_listen === false)
        this.store.store.resolve(reqId);
    } else if (type === "Speak") {
      const streamId = `${directive.header.streamId}`;
      this.store.store.add(reqId, {
        audioFormat: directive.payload.format,
        streamId: streamId,
      });
      this.store.stream.set(`${directive.header.streamId}`, { i: reqId });
    } else if (type === "GoAway") {
      // it means what we should reconnect
      if (this.opts.app) {
        this.opts.app.uuid = randomUUID();
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
  public sendEvent(
    namespace: string,
    name: string,
    payload: any,
    header: any = {}
  ): string {
    const event = {
      header: {
        namespace,
        name,
        messageId: randomUUID(),
        ...header,
        // seqNumber
      },
      payload,
    };

    this.conn?.sendUTF(JSON.stringify({ event }));
    return event.header.messageId;
  }
}
