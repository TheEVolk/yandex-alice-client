import WebSocket from 'ws';
import { v4 } from 'uuid';
import type { IAliceActiveRequest, IAliceResponseDirective, IAliceStreamcontrolResponse, IAliceStreamcontrol, IAliceResponse } from './types';

interface IAliceStream {
  messageId: string;
  buffers: Buffer[];
  streamId: number;
}

export default class Uniproxy {
  private ws: WebSocket;
  private readonly requests = new Map<string, IAliceActiveRequest>();
  private streams = new Map<number, IAliceStream>();

  public connect(server: string): Promise<void> {
    this.ws = new WebSocket(server);
    this.ws.on('message', this.onMessage.bind(this));

    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
    });
  }

  private onBuffer(data: Buffer) {
    const streamId = data.subarray(0, 4).readInt32BE();
    const stream = this.streams.get(streamId);
    if (!stream) {
      console.warn(`No stream with id ${streamId}`);
      return;
    }

    stream.buffers.push(data.subarray(4));
  }

  private onMessage(data: Buffer) {
    let response: { directive: IAliceResponseDirective } | IAliceStreamcontrolResponse;
    try {
      response = JSON.parse(data.toString());
    } catch (_) {
      this.onBuffer(data);
      return;
    }

    let request: IAliceActiveRequest;
    if (response['streamcontrol']) {
      request = this.onStreamcontrol(response['streamcontrol']);
    }

    if (response['directive']) {
      request = this.onDirective(response['directive']);
    }

    if (request.needs.size > 0) {
      return;
    }

    this.requests.delete(request.id);
    request.resolve({
      directives: request.directives,
      audio: request.audio
    });
  }

  public receiveData(messageId: string, needs: string[] = []): Promise<IAliceResponse> {
    let timeoutId;
    const promise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => reject(`Message ${messageId} timeout.`), 5e3);
      this.requests.set(messageId, {
        id: messageId,
        at: new Date(),
        needs: new Set(needs),
        directives: [],
        resolve,
        reject
      });
    })
    
    promise.finally(() => {
      this.requests.delete(messageId);
      clearTimeout(timeoutId);
    });

    return promise as Promise<IAliceResponse>;
  }

  public sendEvent(namespace: string, name: string, payload: any, header: any = {}) {
    const event = {
      header: {
        namespace,
        name,
        messageId: v4(),
        ...header
        // seqNumber
      },
      payload
    } as any;

    this.ws.send(JSON.stringify({ event }));
    return event.header.messageId;
  }

  public close() {
    this.ws.close();
  }

  private onStreamcontrol(streamcontrol: IAliceStreamcontrol) {
    const stream = this.streams.get(streamcontrol.streamId);
    if (!stream) {
      throw new Error(`no stream ${streamcontrol.streamId}`);
    }

    this.streams.delete(streamcontrol.streamId);

    const request = this.requests.get(stream.messageId);
    if (!request) {
      throw new Error(`no request ${stream.messageId}`);
    }

    request.audio = Buffer.concat(stream.buffers);
    request.needs.delete('audio');

    return request;
  }

  private onDirective(directive: IAliceResponseDirective) {
    const request = this.requests.get(directive.header.refMessageId);
    if (!request) {
      throw new Error(`no request ${directive.header.refMessageId}`);
    }

    request.directives.push(directive);
    request.needs.delete(directive.header.name);

    if (directive.header.name === 'Speak') {
      this.streams.set(directive.header.streamId, {
        messageId: directive.header.refMessageId,
        buffers: [],
        streamId: directive.header.streamId
      });
    }

    return request;
  }
}