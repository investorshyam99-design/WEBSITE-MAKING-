import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayClient: Razorpay | null = null;
export function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error(
        "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET variables are required",
      );
    }
    razorpayClient = new Razorpay({ key_id, key_secret });
  }
  return razorpayClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Razorpay Order API
  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { items, paymentMode, finalAmount } = req.body;
      const razorpay = getRazorpay();

      let amount = 0;
      if (finalAmount !== undefined) {
        amount = Number(finalAmount);
      } else {
        // Fallback calculation just in case
        let itemsTotal = items.reduce(
          (sum: any, item: any) => sum + item.price * item.quantity,
          0,
        );

        if (paymentMode === "partial") {
          const baseAdvance =
            150 * items.reduce((sum: any, item: any) => sum + item.quantity, 0);
          amount = baseAdvance;
        } else {
          amount = itemsTotal;
        }
      }

      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency: "INR",
        receipt: "receipt_order_" + Date.now(),
      };

      const order = await razorpay.orders.create(options);
      res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error: any) {
      console.error("Error creating razorpay order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Razorpay Verify API
  app.post("/api/verify-razorpay-payment", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  });

  app.post("/api/shopify", async (req, res) => {
    try {
      const { query } = req.body;
      const domain =
        process.env.VITE_SHOPIFY_DOMAIN || "https://0qtwuu-br.myshopify.com";
      const token =
        process.env.VITE_SHOPIFY_STOREFRONT_TOKEN ||
        "e711ef4603f75af0b8370a9b8ebeb2e5";

      const response = await fetch(`${domain}/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": token,
        },
        body: JSON.stringify({ query }),
      });

      const json = await response.json();
      res.json(json);
    } catch (error: any) {
      console.error("Error fetching Shopify products proxy:", error);
      res.status(500).json({ error: "Failed to fetch from Shopify" });
    }
  });

  // Meta Catalog RSS/XML Feed for Dynamic Instagram Ads
  app.get("/api/meta-catalog", async (req, res) => {
    try {
      const domain =
        process.env.VITE_SHOPIFY_DOMAIN || "https://0qtwuu-br.myshopify.com";
      const token =
        process.env.VITE_SHOPIFY_STOREFRONT_TOKEN ||
        "e711ef4603f75af0b8370a9b8ebeb2e5";

      const query = `
        {
          products(first: 250, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id
                title
                description
                productType
                tags
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
                images(first: 5) {
                  edges {
                    node {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const shopifyRes = await fetch(`${domain}/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": token,
        },
        body: JSON.stringify({ query }),
      });

      const json = await shopifyRes.json();
      if (!json.data || !json.data.products) {
        throw new Error("Invalid response from Shopify store");
      }

      const products = json.data.products.edges.map((edge: any) => edge.node) || [];

      // Reconstruct dynamic store base URL
      const host = req.get("host") || "jerseyunicorn.com";
      const protocol = req.secure ? "https" : "http";
      const baseUrl = `${protocol}://${host}`;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
      xml += `  <channel>\n`;
      xml += `    <title>Jersey Unicorn Products</title>\n`;
      xml += `    <link>${baseUrl}</link>\n`;
      xml += `    <description>Premium quality football jerseys from Jersey Unicorn</description>\n`;

      for (const item of products) {
        const id = item.id.replace("gid://shopify/Product/", "");
        const title = item.title;
        // Escape special XML characters for safety
        const descEscaped = (item.description || "Premium quality football jersey. Express your passion for the game.")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        const link = `${baseUrl}/product/${id}`;
        
        const images = item.images?.edges.map((e: any) => e.node.url) || [];
        const mainImage = images[0] || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop";
        const price = item.variants?.edges[0]?.node?.price?.amount || "1199";
        const currency = item.variants?.edges[0]?.node?.price?.currencyCode || "INR";

        xml += `    <item>\n`;
        xml += `      <g:id>${id}</g:id>\n`;
        xml += `      <g:title><![CDATA[${title}]]></g:title>\n`;
        xml += `      <g:description><![CDATA[${descEscaped}]]></g:description>\n`;
        xml += `      <g:link>${link}</g:link>\n`;
        xml += `      <g:image_link>${mainImage}</g:image_link>\n`;
        xml += `      <g:brand>Jersey Unicorn</g:brand>\n`;
        xml += `      <g:condition>new</g:condition>\n`;
        xml += `      <g:availability>in stock</g:availability>\n`;
        xml += `      <g:price>${price} ${currency}</g:price>\n`;
        xml += `      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Activewear &gt; Athletic Jerseys &gt; Football Jerseys</g:google_product_category>\n`;
        xml += `    </item>\n`;
      }

      xml += `  </channel>\n`;
      xml += `</rss>\n`;

      res.header("Content-Type", "application/xml");
      res.status(200).send(xml);
    } catch (error: any) {
      console.error("Error creating Meta catalog feed:", error);
      res.status(500).send(`<error>Failed to generate catalog feed: ${error.message}</error>`);
    }
  });

  // AI Assistant API Route
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "Missing GEMINI_API_KEY on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
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

VOICE ASSISTANT CAPABILITIES & STORE CONTEXT:
- General conversation
- Business guidance
- Website & Shopping help
- Motivation & Productivity
- Real-time friendly chat

IMPORTANT STORE INFO:
- We deliver between 5 to 10 days across India.
- We sell premium Thailand quality football jerseys (Fan versions).
- Cash on Delivery (COD) is available with a ₹150 advance to confirm.

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

      let contextStr = history
        .map(
          (m: any) =>
            `${m.role === "user" ? "User" : "Jersey Unicorn AI"}: ${m.content}`,
        )
        .join("\\n");

      let prompt = `Conversation History:\n${contextStr}\n\nUser: ${currentMessage.content}\n\nPlease reply as Jersey Unicorn AI.`;

      if (history.length === 0) {
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
      console.error("AI Error: ", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to generate AI response" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
