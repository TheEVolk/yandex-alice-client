import YandexAliceClient from '../lib/index.mjs';

const client = new YandexAliceClient();
await client.connect();

const { response } = await client.sendText('hello world');
console.log(response.card.text);

await client.close();
