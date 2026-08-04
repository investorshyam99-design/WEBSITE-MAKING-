import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});
const chat = ai.chats.create({ model: "gemini-2.5-flash" });
chat.sendMessage({ message: "Hello" }).then(res => console.log(res.text)).catch(console.error);
