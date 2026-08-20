import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    
    // Key rotation logic (Matching server.ts)
    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.G1,
      process.env.G2,
      process.env.G3,
      process.env.G4,
      process.env.G5,
      process.env.G6,
      process.env.G7
    ].filter(Boolean);
    
    if (keys.length === 0) {
      console.error("[Gemini AI] FATAL: No Gemini API keys are configured (G1-G7).");
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }
    
    const systemInstruction = `You are the official AI Shopping Assistant for JERSEY UNICORN.
Your primary goal is to help customers confidently purchase the right product by answering questions accurately, recommending the correct size, explaining product differences, and providing excellent customer support.

GENERAL BEHAVIOUR
- Always reply in the same language the customer uses.
- Be friendly, professional, concise, and helpful.
- Never provide false information.
- Never guess information that you do not know.
- Never promise discounts, refunds, or delivery dates beyond the official policy.

PLAYER / MASTER / FAN DIFFERENCE
Player Version: Same style worn by professional players. Slim, athletic fit. Heat-pressed rubberized crests. Highly breathable performance fabric.
Master/Fan Version: Looser, more relaxed fit. Embroidered fabric crests. Standard breathable fabric. Designed for everyday wear.

WASHING INSTRUCTIONS
- Hand wash recommended.
- Do not machine wash.
- Wash inside out in cold water.
- Do not iron on prints or logos.`;

    // Convert messages to string context
    const currentMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1);
    
    let contextStr = history.map((m: any) => `${m.role === "assistant" ? "Jersey Unicorn AI" : "User"}: ${m.content}`).join('\n');
    let prompt = `Conversation History:\n${contextStr}\n\nUser: ${currentMessage.content}\n\nPlease reply as Jersey Unicorn AI.`;
    if (history.length === 0) {
      prompt = currentMessage.content;
    }

    let lastError: any = null;
    
    for (let i = 0; i < keys.length; i++) {
      try {
        const apiKey = keys[i] as string;
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash", // stable fast model
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        
        console.log(`[Gemini AI] Successfully used key index ${i}`);
        const responseText = response.text || "I'm sorry, I couldn't process your request.";
        return res.status(200).json({ text: responseText, audio: null });
      } catch (err: any) {
        console.error(`[Gemini AI] Error with key index ${i}: `, err.message || err);
        lastError = err;
      }
    }

    console.error("[Gemini AI] All keys failed. Last error: ", lastError);
    return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });

  } catch (error: any) {
    console.error("[Gemini AI] Unexpected Server Error: ", error);
    return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
  }
}
