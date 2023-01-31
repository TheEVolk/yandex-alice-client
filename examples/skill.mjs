import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import YandexAliceClient from '../lib/index.mjs';
import { v4 } from 'uuid';

const rl = readline.createInterface({ input, output });

const client = new YandexAliceClient();
await client.connect();

console.log(
  'sync',
  await client.synchronizeState({
    auth_token: await rl.question('Введите auth_token (ya.ru > Сеть > WS)'),
    uuid: v4(),
    lang: 'ru-RU',
    voice: 'levitan'
  }).catch(() => {})
);

await client.sendText('запусти навык занимательные истории')
  .then(v => console.log('[A]', v.response.card.text));

await client.sendText('да')
  .then(v => console.log('[A]', v.response.card.text));

rl.on('line', async (line) => {
  const { response } = await client.sendText(line.toString());
  console.log('[A]', response.card.text);
});
