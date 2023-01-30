import { writeFile } from 'node:fs/promises';
import YandexAliceClient from '../lib/index.mjs';

const client = new YandexAliceClient();
await client.connect();

const response = await client.sendText('hello world', true);
console.log(response);

await writeFile('response.opus', response.audio);
await client.close();
