import { randomUUID } from "crypto";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import YandexAliceClient from "../src/index";

const rl = readline.createInterface({ input, output });

(async () => {
  const client = new YandexAliceClient({
    log: true,
    autoReconnect: false,
  });
  await client.connect();

  console.log(
    "sync",
    client.synchronizeState({
      auth_token: await rl.question("Введите auth_token (ya.ru > Сеть > WS)"),
      uuid: randomUUID(),
      lang: "ru-RU",
      voice: "levitan",
    })
  );

  setTimeout(async () => {
    await client
      .sendText("запусти навык занимательные истории")
      .then((v) => console.log("[A]", v.text?.text));

    await client.sendText("да").then((v) => console.log("[A]", v.text?.text));

    rl.on("line", async (line) => {
      const response = await client.sendText(line.toString());
      console.log("[A]", response.text?.text);
    });
  }, 1000);
})();
