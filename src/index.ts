import { v4 } from 'uuid';
import type { IAliceClientOptions, IAliceSendTextResponse } from './types';
import Uniproxy from './uniproxy.js';

export default class YandexAliceClient {
  public readonly uniproxy = new Uniproxy();

  public constructor(private readonly options: IAliceClientOptions = {}) {
    this.options.server = options.server || 'wss://uniproxy.alice.ya.ru/uni.ws';
  }

  public async connect(): Promise<void> {
    await this.uniproxy.connect(this.options.server);
  }

  async sendText(text: string, isTTS = false): Promise<IAliceSendTextResponse> {
    const messageId = this.uniproxy.sendEvent('Vins', 'TextInput', {
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
    });

    const response = await this.uniproxy.receiveData(
      messageId,
      isTTS ? ['VinsResponse', 'audio'] : ['VinsResponse']
    );

    return {
      response: response.directives[0].payload.response,
      audio: response.audio
    };
  }

  private getApplication() {
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

  close() {
    this.uniproxy.close();
  }
}