import { GoogleGenAI } from "@google/genai";

async function run() {
  const apiKeys = ["bad_key_1", "bad_key_2"];
  let responseText = "";
  let lastError = null;

  for (const key of apiKeys) {
    try {
      console.log("Trying key:", key);
      const ai = new GoogleGenAI({ apiKey: key });
      const chat = ai.chats.create({ model: "gemini-2.5-flash" });
      const response = await chat.sendMessage({ message: "Hello" });
      responseText = response.text || "";
      if (responseText) {
        lastError = null;
        break;
      }
    } catch (err) {
      console.error("Key failed:", err.message);
      lastError = err;
    }
  }
}
run();
