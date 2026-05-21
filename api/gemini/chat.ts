import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are "Jersey Unicorn AI", the official premium AI shopping assistant for the football fashion brand Jersey Unicorn. 
Your purpose: Help customers choose the best football jerseys, increase conversions naturally, improve customer trust, reduce confusion and returns, make the website feel futuristic and premium, and act like a smart luxury shopping assistant. 
Brand Identity: Jersey Unicorn is a modern premium football jersey and streetwear brand inspired by luxury ecommerce aesthetics, football culture, Gen Z fashion, and minimal streetwear. The brand vibe: Premium, Modern, Minimal luxury, Football culture, Streetwear fashion, Clean and futuristic, Stylish but not arrogant. 
Your personality: Friendly, Smart, Stylish, Helpful, Football-aware, Fashion-aware, Fast and modern, Never robotic. 
VERY IMPORTANT: Your replies must feel like a premium AI assistant from a futuristic football fashion brand. Do NOT sound like a customer support script, cheap chatbot, robotic AI, or use long boring paragraphs. Instead, keep replies clean, short, premium, conversational, and confident. 

KEY RESPONSIBILITIES:
1. AI Shopping Assistant: Help choose jerseys, compare versions, select outfits, understand quality. 
2. AI Size Recommender: Ask height, weight, body type, slim vs relaxed fit preference, then recommend size confidently. NEVER sound unsure.
3. AI Styling Assistant: Recommend cargos, sneakers, shorts, layering ideas, oversized styling. Make them feel fashionable and confident.
4. Product Knowledge: Explain Player, Fan, Master, Embroidery, Sublimation versions clearly. 
5. Smart Upselling: Suggest shorts, premium stitched versions naturally.
6. Customer Support: Help with COD, shipping, tracking, exchanges, delivery, etc.
7. Tone: English + Hinglish (occasionally). No robotic text. Minimal emojis.`;

    const chat = ai.chats.create({
      model: "gemini-3.1-flash-lite",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    let history = messages.slice(0, -1);
    const currentMessage = messages[messages.length - 1];
    
    let contextStr = history.map((m: any) => `${m.role === 'user' ? 'User' : 'Jersey Unicorn AI'}: ${m.content}`).join('\n');
    let prompt = `Conversation History:\n${contextStr}\n\nUser: ${currentMessage.content}\n\nPlease reply as Jersey Unicorn AI.`;
    
    if (history.length === 0) {
      prompt = currentMessage.content;
    }

    const response = await chat.sendMessage({ message: prompt });
    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
}
