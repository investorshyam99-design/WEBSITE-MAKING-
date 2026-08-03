import { GoogleGenAI } from "@google/genai";

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: "DUMMY_KEY" });
    const chat = ai.chats.create({
      model: "gemini-3.1-flash-lite",
      config: {
        systemInstruction: "You are a test assistant.",
        temperature: 0.7,
      },
    });
    console.log("Chat created");
    await chat.sendMessage({ message: "Hello" });
  } catch (err) {
    console.log("Error:", err.message);
  }
}
test();
