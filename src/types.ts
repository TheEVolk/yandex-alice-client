export interface IAliceClientOptions {
  /** @default 'wss://uniproxy.alice.ya.ru/uni.ws' */
  server?: string;
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
  id: string;
  at: Date;
  needs: Set<string>;
  directives: IAliceResponseDirective[];
  audio?: Buffer;
  resolve: (data) => void;
  reject: (reason) => void;
}

export interface IAliceRequestEvent {

}

// response

export interface IAliceResponsePayloadResponse {

}

export interface IAliceResponsePayload {
  response: IAliceResponsePayloadResponse;
}

export interface IAliceResponseHeader {
  name: 'Speak' | 'VinsResponse';
  messageId: string;
  refMessageId: string;
  namespace: 'Vins' | 'TTS';
  streamId?: number;
}

export interface IAliceResponseDirective {
  header: IAliceResponseHeader;
  payload: IAliceResponsePayload;
}

export interface IAliceResponse {
  directives: IAliceResponseDirective[];
  audio?: Buffer;
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
