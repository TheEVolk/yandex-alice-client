# yandex-alice-client
![Downloads](https://img.shields.io/npm/dm/yandex-alice-client.svg)

Клиент для отправки запросов Яндекс Алисе и получения от неё ответов.

## Преимущества
* Минимальное количество зависимостей 💭
* Поддержка TypeScript типизации 🪑
* Удобный и простой API 🚀
* TTS 📣

## Как использовать
```js
import YandexAliceClient from 'yandex-alice-client';
import { writeFile } from 'node:fs/promises';

const client = new YandexAliceClient();
await client.connect();

const { response } = await client.sendText('hello world');
console.log(response.card.text);

// Alice with TTS
const { audio } = await client.sendText('hello world', { isTTS: true });
console.log(audio); // buffer (audio/opus)

await writeFile('response.opus', audio);

// TTS
const audio = await client.sendText('что за чудеса происходят?', { voice: 'levitan' });
console.log(audio); // buffer (audio/opus)
await writeFile('response.opus', audio);

// close client connection
await client.close();
```

## Contribute
Предлагайте свой функционал в issues или добавляйте свой код самостоятельно, после чего создайте PR, а мы её обязательно рассмотрим.

## RoadMap
Это не совсем план, скорее то, что мы хотели бы видеть:
* Привести код и репозиторий в порядок, добавить eslint и workflow
* Добавить функции умного устройства, убавить/прибавить громкость, включить что-то и т.д.
* Привязка к аккаунту и отправка запросов от настоящей колонки
* sendAudio или streamAudio чтобы отправлять голосовые команды

Пусть это будет некое виртуальное yandexio, точнее его часть, что общается с Алисой.

> С любовью к Яндекс ❤️