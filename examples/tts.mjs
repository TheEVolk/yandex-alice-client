import { writeFile } from 'node:fs/promises';
import YandexAliceClient from '../lib/index.mjs';

const client = new YandexAliceClient();
await client.connect();

const audio = await client.tts('Привет, меня зовут Алиса');
await writeFile('response.opus', audio);

await client.close();