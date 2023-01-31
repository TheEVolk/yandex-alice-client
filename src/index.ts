import { v4 } from 'uuid';
import type { IAliceClientOptions, IAliceSendTextOptions, IAliceSendTextResponse, IAliceTTSOptions } from './types';
import Uniproxy from './uniproxy.js';

export default class YandexAliceClient {
  public readonly uniproxy = new Uniproxy();

  public constructor(private readonly options: IAliceClientOptions = {}) {
    this.options.server = options.server || 'wss://uniproxy.alice.ya.ru/uni.ws';
  }

  public async connect(): Promise<void> {
    await this.uniproxy.connect(this.options.server);
  }

  public async synchronizeState(data) {
    this.uniproxy.sendEvent('System', 'SynchronizeState', data);
  }

  async sendText(text: string, options: Partial<IAliceSendTextOptions> = {}): Promise<IAliceSendTextResponse> {
    if (typeof options === 'boolean') {
      options = {};
    }

    options = this.normalizeSendTextOptions(options);

    const messageId = this.uniproxy.sendEvent('Vins', 'TextInput', {
      request: {
        voice_session: options.isTTS,
        event: {
          type: 'text_input',
          text
        }
      },
      application: this.getApplication()
    });

    const response = await this.uniproxy.receiveData(
      messageId,
      options.isTTS ? ['VinsResponse', 'audio'] : ['VinsResponse']
    );

    return {
      response: response.directives[0].payload.response,
      audio: response.audio
    };
  }

  async tts(text: string, options: Partial<IAliceTTSOptions> = {}) {
    const messageId = this.uniproxy.sendEvent('TTS', 'Generate', {
      voice: options.voice || 'shitova.us',
      lang: options.voice || 'ru-RU',
      format: options.voice || 'audio/opus',
      emotion: options.voice || 'neutral',
      quality: options.voice || 'UltraHigh',
      text
    });

    const response = await this.uniproxy.receiveData(
      messageId,
      ['audio']
    );

    return response.audio;
  }

  public getApplication() {
    return {
      app_id: 'aliced',
      app_version: '1.2.3',
      os_version: '5.0',
      platform: 'android',
      uuid: v4(),
      lang: 'ru-RU',
      client_time: new Date().toDateString(),
      timezone: 'Europe/Moscow',
      timestamp: Math.floor(Date.now() / 1e3).toString(),
    };
  }

  public close() {
    this.uniproxy.close();
  }

  private normalizeSendTextOptions(rawOptions: Partial<IAliceSendTextOptions>) {
    const options = { ...rawOptions };
    options.isTTS = options.isTTS ?? false;

    return options;
  }
}