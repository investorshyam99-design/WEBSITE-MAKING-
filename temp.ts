import { GoogleGenAI } from "@google/genai";
console.log("Testing GenAI generate.");
async function run() {
  try {
    const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
    });

    const chat = ai.chats.create({
      model: "gemini-3.1-flash-lite",
      config: {
        temperature: 0.7,
      },
    });

    console.log("Sending msg...");
    const response = await chat.sendMessage({ message: "Hello" });
    console.log("Response:", response.text);
  } catch(e: any) {
    console.log("Error Init: ", e.message);
  }
}
run();
