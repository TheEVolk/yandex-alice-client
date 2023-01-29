import YandexAliceClient from '../lib/index.js';

const client = new YandexAliceClient();
await client.connect();

const response = await client.sendText('hello world', true);
console.log(response);

await client.close();
