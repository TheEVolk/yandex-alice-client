import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import YandexAliceClient from '../lib/index.mjs';

const rl = readline.createInterface({ input, output });

const client = new YandexAliceClient();
await client.connect();

rl.on('line', async (line) => {
  const { response } = await client.sendText(line.toString());
  console.log('[A]', response.card.text);
});
