import { writeFile } from "fs/promises";
import YandexAliceClient from "../src/index";

const client = new YandexAliceClient({
  log: false,
  autoReconnect: false,
});

(async () => {
  // Connect to API
  await client.connect();

  // Initialize voices
  await client.initTTSVoice();
  // Send text to API
  const data = await client.tts("Привет, расскажи причу", {
    // options
    voice: "shitova.us",
  });

  console.log(data);
  if (!data.audioData) return;

  // Write audio to file
  await writeFile("response.opus", data.audioData);

  setInterval(async () => {
    // Send text to API
    const data = await client.tts(
      "Привет, расскажи причу, " + Math.round(Math.random() * 10000000),
      {
        // options
        voice: "shitova.us",
      }
    );

    console.log(data);
    if (!data.audioData) return;

    // Write audio to file
    await writeFile("response.opus", data.audioData);
  }, 8 * 1000);

  // Close connection
  // client.close();
})();
