import { GoogleGenAI } from "@google/genai";
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
  });
  const res = await chat.sendMessage({ message: "hello" });
  console.log(res.text);
}
test().catch(console.error);
