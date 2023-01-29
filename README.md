# yandex-alice-client
Клиент для отправки запросов Яндекс Алисе и получения от неё ответов.

## Как использовать
```js
import YandexAliceClient from 'yandex-alice-client';
import { writeFile } from 'node:fs/promises';

const client = new YandexAliceClient();
await client.connect();

const { response } = await client.sendText('hello world');
console.log(response.card.text);

// Alice TTS
const { audio } = await client.sendText('hello world', true);
console.log(audio); // buffer (audio/opus)

await writeFile('response.opus', audio);

await client.close();
```