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

  // Qikink Fulfillment API
  app.post("/api/qikink/send-order", async (req, res) => {
    try {
      const { order } = req.body;
      if (!order) {
        return res.status(400).json({ error: "No order data provided" });
      }

      const apiKey = process.env.QIKINK_API_KEY || "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

      // Parse Address safely
      let houseNo = order.houseNo || "";
      let areaStreet = order.areaStreet || "";
      let city = order.city || "";
      let state = order.state || "";
      let pincode = order.pincode || "";

      if (!pincode && order.address) {
        // Fallback parser for older orders
        const pincodeMatch = order.address.match(/Pincode:\s*(\d{6})/i);
        pincode = pincodeMatch ? pincodeMatch[1] : "";
        const cleanAddress = order.address.replace(/Pincode:\s*\d{6}/i, "").trim();
        const parts = cleanAddress.split(",").map((p: string) => p.trim()).filter(Boolean);
        const count = parts.length;
        if (count >= 4) {
          houseNo = parts[0];
          areaStreet = parts.slice(1, count - 2).join(", ");
          city = parts[count - 2];
          state = parts[count - 1];
        } else if (count === 3) {
          houseNo = parts[0];
          city = parts[1];
          state = parts[2];
        } else if (count === 2) {
          city = parts[0];
          state = parts[1];
        } else if (count === 1) {
          city = parts[0];
        }
      }

      // Build products list
      const products: any[] = [];
      if (order.cartItems && order.cartItems.length > 0) {
        for (const item of order.cartItems) {
          let customName = "";
          let customNumber = "";
          if (item.customization) {
            customName = item.customization.name || "";
            customNumber = item.customization.number || "";
          }
          products.push({
            sku: item.productId || item.id || "JERSEY-PREMIUM",
            qty: item.quantity || 1,
            size: item.selectedSize || item.size || "M",
            price: item.price || 1199,
            design_id: "jersey_front_print",
            custom_name: customName,
            custom_number: customNumber
          });
        }
      } else {
        // Single jersey order mapping
        let customName = "";
        let customNumber = "";
        if (order.customization) {
          const matchResult = order.customization.match(/\(([^)]+)\)/);
          if (matchResult && matchResult[1]) {
            customNumber = matchResult[1];
            customName = order.customization.split("(")[0]?.trim();
          } else {
            customName = order.customization;
          }
        }
        products.push({
          sku: order.productId || "JERSEY-PREMIUM",
          qty: order.quantity || 1,
          size: order.size || "M",
          price: order.price || 1199,
          design_id: "jersey_front_print",
          custom_name: customName,
          custom_number: customNumber
        });
      }

      const fullnameStr = order.fullName || "Guest Customer";
      const nameParts = fullnameStr.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Customer";

      const qikinkPayload = {
        apikey: apiKey,
        order_id: order.id,
        shipping_firstname: firstName,
        shipping_lastname: lastName,
        shipping_address_1: houseNo || order.address?.split(",")[0] || "Address 1",
        shipping_address_2: areaStreet || "Address 2",
        shipping_city: city || "City",
        shipping_state: state || "State",
        shipping_pincode: pincode || "000000",
        shipping_phone: order.phone || "",
        shipping_email: order.email || "customer@jerseyunicorn.com",
        payment_method: (order.paymentMode === "full" || order.status?.toLowerCase().includes("fampay") || order.status?.toLowerCase().includes("confirmed")) ? "prepaid" : "cod",
        cod_value: (order.paymentMode === "full" || order.status?.toLowerCase().includes("fampay") || order.status?.toLowerCase().includes("confirmed")) ? 0 : (order.remainingCodAmount || 0),
        products: products
      };

      console.log("Sending order request to Qikink:", JSON.stringify(qikinkPayload, null, 2));

      // Post to Qikink endpoint
      const qikinkRes = await fetch("https://qikink.com/index.php/api/api/create_order/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(qikinkPayload)
      });

      const responseText = await qikinkRes.text();
      let qikinkData: any;
      try {
        qikinkData = JSON.parse(responseText);
      } catch (parseErr) {
        qikinkData = { message: responseText };
      }

      if (!qikinkRes.ok || (qikinkData && qikinkData.status === "error") || (qikinkData && qikinkData.error)) {
        console.error("Qikink error response:", qikinkData);
        return res.status(400).json({
          error: qikinkData.message || qikinkData.error || "Failed payload rejected by Qikink API",
          details: qikinkData
        });
      }

      res.json({
        success: true,
        message: "Fulfillment submitted to Qikink successfully!",
        qikinkResponse: qikinkData
      });
    } catch (error: any) {
      console.error("Qikink fulfillment error:", error);
      res.status(500).json({ error: error.message || "Failed to submit fulfillment request" });
    }
  });

  app.post("/api/qikink/track-order", async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ error: "No order ID specified" });
      }

      const apiKey = process.env.QIKINK_API_KEY || "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

      const trackPayload = {
        apikey: apiKey,
        order_id: orderId
      };

      const qikinkRes = await fetch("https://qikink.com/index.php/api/api/order_status/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(trackPayload)
      });

      const qikinkData = await qikinkRes.json();
      res.json(qikinkData);
    } catch (error: any) {
      console.error("Qikink track error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch tracking details" });
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

  // Meta Catalog CSV Feed for Dynamic Instagram/Meta Ads
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

      // Force the base URL to be the custom production URL as requested: jerseyunicorn.com
      const baseUrl = "https://jerseyunicorn.com";

      const escapeCSV = (val: string): string => {
        if (val === null || val === undefined) return "";
        let str = String(val).trim();
        // Compact single spaces instead of complex whitespace
        str = str.replace(/\s+/g, ' ');
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const headers = [
        "id",
        "title",
        "description",
        "link",
        "image_link",
        "brand",
        "condition",
        "availability",
        "price",
        "google_product_category"
      ];

      const rows = [headers.join(",")];

      for (const item of products) {
        const id = item.id.replace("gid://shopify/Product/", "");
        const title = item.title;
        // Generate clean URL slug matching frontend behavior
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const description = item.description || "Premium quality football jersey. Express your passion for the game.";
        const link = `${baseUrl}/products/${slug}`;
        
        const images = item.images?.edges.map((e: any) => e.node.url) || [];
        const mainImage = images[0] || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop";
        const price = item.variants?.edges[0]?.node?.price?.amount || "1199";
        const currency = item.variants?.edges[0]?.node?.price?.currencyCode || "INR";

        const googleProductCategory = "Apparel & Accessories > Clothing > Activewear > Athletic Jerseys > Football Jerseys";

        const row = [
          escapeCSV(id),
          escapeCSV(title),
          escapeCSV(description),
          escapeCSV(link),
          escapeCSV(mainImage),
          escapeCSV("Jersey Unicorn"),
          escapeCSV("new"),
          escapeCSV("in stock"),
          escapeCSV(`${price} ${currency}`),
          escapeCSV(googleProductCategory)
        ];

        rows.push(row.join(","));
      }

      res.header("Content-Type", "text/csv");
      res.attachment("meta_catalog_feed.csv");
      res.status(200).send(rows.join("\n"));
    } catch (error: any) {
      console.error("Error creating Meta catalog feed:", error);
      res.status(500).send(`Failed to generate catalog feed: ${error.message}`);
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

  // Streamable Hero Video API to handle dynamic signature expirations
  app.get("/api/hero-video", async (req, res) => {
    try {
      const response = await fetch("https://api.streamable.com/videos/th7p5y");
      if (!response.ok) {
        throw new Error(`Failed to fetch from Streamable API: ${response.statusText}`);
      }
      const data: any = await response.json();
      const mp4Url = data.files?.mp4?.url || data.files?.["mp4-mobile"]?.url;
      if (!mp4Url) {
        throw new Error("No MP4 video URL found in Streamable metadata");
      }
      res.json({ url: mp4Url });
    } catch (error: any) {
      console.error("Error fetching dynamic Streamable link:", error);
      res.json({ url: "/hero-video.mp4" });
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
