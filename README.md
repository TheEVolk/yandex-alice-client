# yandex-alice-client
![Downloads](https://img.shields.io/npm/dm/yandex-alice-client.svg)
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

## Contribute
Предлагайте свой функционал в issues или добавляйте свой код самостоятельно, после чего создайте PR, а мы её обязательно рассмотрим.

## RoadMap
Это не совсем план, скорее то, что мы хотели бы видеть:
* Привести код и репозиторий в порядок, добавить eslint и workflow
* Добавить функции умного устройства, убавить/прибавить громкость, включить что-то и т.д.
* Привязка к аккаунту и отправка запросов от настоящей колонки
* sendAudio или streamAudio чтобы отправлять голосовые команды

Пусть это будет некое виртуальное yandexio, точнее его часть, что общается с Алисой.