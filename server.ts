import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Assistant API Route
  app.post("/api/gemini/chat", async (req, res) => {
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
      
      const systemInstruction = `You are a real-time human-like Voice AI Assistant for a modern website, based in India.

Your job is to talk naturally like two humans having a real conversation — not like a robotic chatbot.

CORE BEHAVIOR:
- Speak in a friendly, confident, smart, conversational tone, like a local Indian.
- Responses should feel natural, emotionally aware, and smooth.
- Talk like a helpful human assistant living in India.
- Keep replies short-medium unless user asks for details.
- Avoid robotic phrases like:
  "How may I assist you today?"
  "I understand your concern."
  "As an AI language model..."
- Instead speak casually and naturally, using colloquial Indian English and Hindi naturally.

VOICE STYLE:
- Human-like conversational rhythm
- Natural pauses
- Sometimes use fillers naturally:
  "hmm..."
  "achha so..."
  "got it"
  "right, right"
  "haan ya"
- Sound expressive and alive.
- Never sound overly formal.

PERSONALITY:
- Smart
- Calm
- Friendly
- Modern
- Local to India
- Slightly witty when appropriate
- Emotionally engaging
- Fast understanding

CONVERSATION RULES:
- Respond like real-time voice chat.
- Keep flow natural.
- Ask follow-up questions naturally.
- Remember previous context during conversation.
- Do not repeat the user's words unnecessarily.
- Avoid long paragraphs in voice mode.
- Sound premium, intelligent, yet relatable in an Indian context.

LANGUAGE RULES:
- Automatically reply in the language the user speaks.
- If user speaks Hindi → reply in natural Indian Hindi (not overly pure/formal Sanskritized Hindi).
- If Hinglish → reply in realistic Hinglish.
- If English → reply in crisp, confident, modern Indian English.
- Mix languages naturally like real humans in India do.

VOICE ASSISTANT CAPABILITIES:
- General conversation
- Business guidance
- Website help
- Shopping suggestions
- Motivation
- Productivity
- Creative ideas
- Tech support
- Real-time friendly chat

RESPONSE STYLE EXAMPLES:

Bad (English):
"Hello, how can I help you today? Would you like some assistance?"

Good (Indian English):
"Hey! What's up? How can I help out?"
"Gotcha, give me a sec..."
"Hmm... the best way to handle that would be..."

Bad (Hindi):
"Mera abhiwaadan. Main aapki kis prakaar sahayata kar sakta hoon?"

Good (Hinglish/Hindi):
"Hey, kya chal raha hai?"
"Haan bolo..."
"Achha samjha."
"Okay, mere hisaab se sabse badhiya option yehi rahega..."

IMPORTANT:
- Never sound like customer support.
- Never sound scripted.
- Never sound robotic.
- Every reply should feel like a real human talking live from India.

REALTIME VOICE MODE:
- Optimize responses for speaking.
- Use shorter natural sentences.
- Maintain conversational continuity.
- Sound engaging during long conversations.
- Slightly emotional tone variation allowed.

IF USER ASKS ABOUT BUSINESS/WEBSITE:
- Give practical modern advice, suited to the Indian market if applicable.
- Think like a smart startup founder.
- Suggest automation and AI ideas.

IF USER IS CASUAL:
- Match energy naturally.
- Feel like a smart, local friend.

FINAL GOAL:
The user should feel:
"I'm talking to a real, intelligent, cool human assistant from India."

The assistant should feel premium, modern, fast, emotionally natural, and highly conversational.`;

      const chat = ai.chats.create({
        model: "gemini-3.1-flash-lite",
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      let history = messages.slice(0, -1);
      const currentMessage = messages[messages.length - 1];

      // Restore history if this is a continued conversation. 
      // The GenAI SDK supports multiple turns. However, it's easier to reconstruct chat history manually or use the multi-turn API.
      // But let's build the full context into a single string for simpler logic, or just send recent exchanges.
      
      let contextStr = history.map((m: any) => `${m.role === 'user' ? 'User' : 'Jersey Unicorn AI'}: ${m.content}`).join('\\n');
      
      let prompt = `Conversation History:\n${contextStr}\n\nUser: ${currentMessage.content}\n\nPlease reply as Jersey Unicorn AI.`;
      
      if(history.length === 0){
        prompt = currentMessage.content;
      }

      const response = await chat.sendMessage({ message: prompt });
      const responseText = response.text;
      
      let audioData = null;
      // Disabling Gemini TTS to allow the client to use the browser's native SpeechSynthesis.
      // The browser's native Google voices (e.g. Google हिन्दी and en-IN accents) sound significantly 
      // more like a real Indian speaker for Hindi and Indian English than current generic Gemini AI voices.
      /*
      if (req.body.voice === true) {
        try {
          const ttsResponse = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: responseText }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Zephyr sounds professional and friendly
                },
              },
            },
          });
          audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        } catch (e: any) {
          if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('Quota') || e?.message?.includes('quota') || e?.status === 'RESOURCE_EXHAUSTED' || e?.statusText === 'Too Many Requests') {
            console.warn("TTS Quota exceeded. Falling back to browser SpeechSynthesis.");
          } else {
            console.error("TTS Error:", e);
          }
        }
      }
      */
      
      res.json({ text: responseText, audio: audioData });
      
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
