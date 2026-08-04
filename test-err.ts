import { GoogleGenAI } from "@google/genai";
async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: "bad_key" });
    await ai.chats.create({ model: "gemini-2.5-flash" }).sendMessage({ message: "Hello" });
  } catch (err: any) {
    console.log("err is:", typeof err);
    console.log("err.message is:", err.message);
    console.log("err stringified:", JSON.stringify(err));
  }
}
run();
