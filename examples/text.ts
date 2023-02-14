import { writeFile } from "fs/promises";
import YandexAliceClient from "../src/index";

const client = new YandexAliceClient({
  log: false,
  autoReconnect: false,
});

(async () => {
  await client.connect();
  const data = await client.sendText("Привет Алиса, чем занимаешься?", {
    isTTS: true, // with or without voice?
  });
  console.log(data);
  if (data.audioData) await writeFile("response.opus", data.audioData);
  client.close();
})();
