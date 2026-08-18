const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors")({ origin: true });

// Read the secret configured via Firebase CLI
const geminiApiKey = defineSecret("GEMINI_API_KEY");

exports.geminiProxy = onRequest({ secrets: [geminiApiKey] }, (req, res) => {
  // Wrap with CORS middleware so frontend can call it from any domain
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      // Initialize Gemini using the secure secret from Firebase
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });

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

      const currentMessage = messages[messages.length - 1];
      const history = messages.slice(0, -1);
      
      let contextStr = history.map((m) => `${m.role === "assistant" ? "Jersey Unicorn AI" : "User"}: ${m.content}`).join('\n');
      
      let prompt = `Conversation History:\n${contextStr}\n\nUser: ${currentMessage.content}\n\nPlease reply as Jersey Unicorn AI.`;
      if (history.length === 0) {
        prompt = currentMessage.content;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "I'm sorry, I couldn't process your request.";
      return res.status(200).json({ text: responseText, audio: null });

    } catch (error) {
      console.error("[geminiProxy] Error processing request:", error);
      return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again later." });
    }
  });
});
