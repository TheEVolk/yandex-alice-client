import { randomUUID } from "crypto";
import { client as WebSocketClient, connection, Message } from "websocket";
import {
  ApiResDirective,
  ApiResDirectiveRoot,
  Streamcontrol,
  StreamcontrolRoot,
} from "../typings/api";
import log from "../utils/logger";
import tryParseJSON from "../utils/tryParseJSON";
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

  constructor(
    public opts: IAliceClientOptions,
    public store = new Store(opts),
    public client = new WebSocketClient()
  ) {
    this.opts = opts;
  }

  /**
   * Connects to API server
   * @param server API url
   */
  public async connect(): Promise<void> {
    log.bind(this)("info", "CONNECTING");

    await new Promise((resolve, reject) => {
      const connTimeout = setTimeout(() => {
        this.client.abort();
        reject(new Error("CONNECTION_TIMEOUT"));
      }, this.opts.connTimeout);

      this.client.once("connect", async (connection) => {
        log.bind(this)("info", "CONNECTED");
        this.conn = connection;
        clearTimeout(connTimeout);

        connection.on("error", async (error: Error) => {
          log.bind(this)("error", "CONNECT_ERROR", error.toString());
          if (this.opts.autoReconnect) await this.connect();
          else reject(error);
        });
        connection.on("close", async () => {
          log.bind(this)("info", "CONNECTION_CLOSED");
          if (this.opts.autoReconnect) await this.connect();
        });
        connection.on("message", this.onMessage.bind(this));

        resolve(void 0);
      });

      this.client.connect(`${this.opts.server}`);
    });
  }

  public close() {
    this.conn?.close();
  }

  private onMessage(data: Message) {
    let request: Partial<IAliceActiveRequest> = {};
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
