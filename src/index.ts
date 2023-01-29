import { v4 } from 'uuid';
import WebSocket from 'ws';
import type { IAliceActiveRequest, IAliceClientOptions, IAliceResponse, IAliceResponseDirective, IAliceSendTextResponse, IAliceStreamcontrol, IAliceStreamcontrolResponse } from './types';

export default class YandexAliceClient {
  private ws: WebSocket;
  private readonly requests = new Map<string, IAliceActiveRequest>();
  private buffers = [];
  private stream: string;

  public constructor(private readonly options: IAliceClientOptions = {}) {
    this.options.server = options.server || 'wss://uniproxy.alice.ya.ru/uni.ws';
  }

  public connect(): Promise<void> {
    this.ws = new WebSocket(this.options.server);
    this.ws.on('message', this.onMessage.bind(this));

    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
    });
  }

  private onBuffer(data: Buffer) {
    this.buffers.push(data.subarray(4));
  }

  private onMessage(data: Buffer) {
    let response: { directive: IAliceResponseDirective } | IAliceStreamcontrolResponse;
    try {
      response = JSON.parse(data.toString());
    } catch (_) {
      this.onBuffer(data);
      return;
    }

    const streamcontrol = response['streamcontrol'] as IAliceStreamcontrol;
    const directive = response['directive'] as IAliceResponseDirective;

    const messageId = directive?.header.refMessageId || this.stream;
    const request = this.requests.get(messageId);
    if (!request) {
      console.warn('no request');
      return;
    }

    if (directive) {
      request.directives.push(directive);
      request.needs.delete(directive.header.name);

      if (directive.header.name === 'Speak') {
        this.stream = directive.header.refMessageId;
      }
    }

    if (streamcontrol) {
      const buffer = Buffer.concat(this.buffers);
      request.audio = buffer;
      request.needs.delete('audio');
      this.buffers = [];
    }

    if (request.needs.size > 0) {
      return;
    }

    this.requests.delete(messageId);
    request.resolve({
      directives: request.directives,
      audio: request.audio
    });
  }

  async sendText(text: string, isTTS = false): Promise<IAliceSendTextResponse> {
    const response = await this.send({
      header: {
        namespace: 'Vins',
        name: 'TextInput',
        messageId: v4()
      },
      payload: {
        request: {
          voice_session: !!isTTS,
          event: {
            type: 'text_input',
            text
          }
        },
        application: this.getApplication(),
        header: {
          request_id: v4()
        }
      }
    });

    return {
      response: response.directives[0].payload.response,
      audio: response.audio
    };
  }

  getApplication() {
    return {
      app_id: "aliced",
      app_version: "1.2.3",
      os_version: "5.0",
      platform: "android",
      uuid: v4(),
      lang: "ru-RU",
      client_time: new Date().toDateString(),
      timezone: "Europe/Moscow",
      timestamp: Math.floor(Date.now() / 1e3).toString(),
    };
  }

  public send(event): Promise<IAliceResponse> {
    return new Promise((resolve, reject) => {
      const requestId = event.header.messageId;
      const needs = new Set(['VinsResponse']);
      if (event.payload.request.voice_session) {
        needs.add('audio');
      }

      this.requests.set(requestId, {
        at: new Date(),
        needs,
        directives: [],
        resolve,
        reject
      });
  
      this.ws.send(JSON.stringify({ event }));
    });
  }

  close() {
    this.ws.close();
  }
}