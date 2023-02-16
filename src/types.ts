import { Card, Item } from "./typings/api";

export interface IAliceClientOptions {
  /**
   * @description API address
   * @default 'wss://uniproxy.alice.ya.ru/uni.ws'
   */
  server?: string;
  log?: boolean;
  autoReconnect?: boolean;
  connTimeout?: number;
  reqTimeout?: number;
  app?: {
    app_id: string;
    app_version: string;
    os_version: string;
    platform: string;
    uuid: string;
    lang: string;
    client_time: string;
    timezone: string;
    timestamp: string;
  };
}

export interface IAliceSendTextOptions {
  isTTS: boolean;
}

export interface IAliceTTSOptions {
  voice: string;
  lang: string;
  format: string;
  emotion: string;
  quality: string;
}

export interface IAliceActiveRequest {
  text?: Card;
  suggest?: Item[];
  audioFormat?: string;
  audioData?: Buffer;
  streamId?: string;
}

export interface IAliceRequestEvent {}

// response

export interface IAliceResponsePayloadResponse {}

export interface IAliceResponsePayload {
  response: IAliceResponsePayloadResponse;
}

export interface IAliceResponseHeader {
  name: "Speak" | "VinsResponse";
  messageId: string;
  refMessageId: string;
  namespace: "Vins" | "TTS";
  streamId?: number;
}

export interface IAliceResponseDirective {
  header: IAliceResponseHeader;
  payload: IAliceResponsePayload;
}

export interface IAliceStreamcontrol {
  messageId: string;
  streamId: number;
}

export interface IAliceStreamcontrolResponse {
  streamcontrol: IAliceStreamcontrol;
}

export interface IAliceSendTextResponse {
  response: IAliceResponsePayloadResponse;
  audio?: Buffer;
}

export interface IAliceSynchronizeState {
  auth_token: string;
  uuid: string;
  lang: string;
  voice: string;
}
