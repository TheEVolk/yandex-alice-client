import { v4 } from 'uuid';
import WebSocket from 'ws';

export default class YandexAliceClient {
  /** @type WebSocket */
  ws;

  requests = new Map();

  constructor(options = {}) {
    this.options = options;

    this.options.server = options.server || 'wss://uniproxy.alice.ya.ru/uni.ws';
  }

  connect() {
    this.ws = new WebSocket('wss://uniproxy.alice.ya.ru/uni.ws');
    this.ws.on('message', this.onMessage.bind(this));

    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
    });
  }

  onMessage(data) {
    let response;
    try {
      response = JSON.parse(data);
    } catch (error) {
      console.error(error);
      return;
    }

    const request = this.requests.get(response.directive.payload.header.request_id);
    if (!request) {
      return;
    }

    this.requests.delete(response.directive.payload.header.request_id);
    request.resolve(response.directive);
  }

  async sendText(text) {
    const response = await this.send({
      header: {
        namespace: 'Vins',
        name: 'TextInput',
        messageId: v4()
      },
      payload: {
        request: {
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

    return response.payload.response;
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

  send(event) {
    return new Promise((resolve, reject) => {
      const requestId = event.payload.header.request_id;
      this.requests.set(requestId, {
        at: new Date(),
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