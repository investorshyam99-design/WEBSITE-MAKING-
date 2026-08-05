import { GoogleGenAI, Modality } from "@google/genai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    // Dynamically collect all possible Gemini API keys from environment variables
    const apiKeys = Object.entries(process.env)
      .filter(([key, value]) => {
        const k = key.toUpperCase();
        // Include GEMINI_API_KEY, GEMINI_API_KEY_1, G1, API_KEY_1 (but exclude known other APIs)
        return (
          k.includes("GEMINI") || 
          k.match(/^G[0-9]+$/) || 
          (k.includes("API_KEY") && !k.includes("RAZORPAY") && !k.includes("QIKINK"))
        ) && value && value.trim().length > 0;
      })
      .map(([_, value]) => value?.trim())
      .filter(Boolean) as string[];

    // Fallback to GEMINI_API_KEY if dynamic collection misses it
    if (process.env.GEMINI_API_KEY && !apiKeys.includes(process.env.GEMINI_API_KEY.trim())) {
      apiKeys.push(process.env.GEMINI_API_KEY.trim());
    }

    if (apiKeys.length === 0) {
      return res
        .status(500)
        .json({ error: "Missing GEMINI_API_KEY on the server." });
    }

    const systemInstruction = `You are the official AI Shopping Assistant for JERSEY UNICORN.
Your primary goal is to help customers confidently purchase the right product by answering questions accurately, recommending the correct size, explaining product differences, and providing excellent customer support.

GENERAL BEHAVIOUR
- Always reply in the same language the customer uses.
- If the customer speaks English, reply in English.
- If the customer speaks Hindi, reply in Hindi.
- If the customer speaks Hinglish, reply in Hinglish.
- Be friendly, professional, concise, and helpful.
- Never provide false information.
- Never guess information that you do not know.
- Never promise discounts, refunds, or delivery dates beyond the official policy.

==================================================
PLAYER / MASTER / FAN DIFFERENCE
==================================================

Whenever a customer asks:

• What is the difference?
• Which version is better?
• Embroidery logo?
• Heat press logo?
• Which one should I buy?

Reply with:

Player Version

• Same style worn by professional players.
• Heat-pressed club crest, sponsor logo, and branding.
• Lightweight performance fabric.
• Slim athletic fit.
• Best for customers who want an authentic on-field experience.

Master Version

• Premium quality jersey with embroidered club crest/logo.
• Comfortable regular fit.
• Excellent balance of quality and comfort.
• Ideal for daily wear and football fans.

Fan Version

• Embroidered club crest/logo.
• Comfortable regular fit.
• Great value for everyday use.
• Perfect for casual football fans.

If someone specifically asks about embroidered logos:

Reply:

"The Master Version and Fan Version come with embroidered club logos. The Player Version uses premium heat-pressed logos, just like the jerseys worn by professional players during matches."

If the customer asks which version to choose:

Ask:

"Are you looking for the authentic player experience or a comfortable jersey for everyday wear?"

Then recommend the appropriate version based on their preference.

Always remain friendly, professional, and accurate. Never guess product details that are not available.

==================================================
SIZE RECOMMENDATION
==================================================

Whenever a customer asks:

• Which size should I buy?
• What is my perfect size?
• Suggest my size.
• Will this fit me?

The AI must NEVER guess the size immediately.

First ask:

1. What is your height?
2. What is your weight?
3. Which version are you buying?

Options:

• Player Version
• Master Version
• Fan Version

After receiving the customer's height, weight, and selected version:

If Player Version:

Recommend the best size according to the official Player Version size chart.

If Master Version or Fan Version:

Recommend the best size according to the official Master/Fan Version size chart.

After recommending a size, always add:

"For the most accurate fit, please refer to the Size Chart available on the product page before placing your order."

Never recommend a size without asking these questions first.

==================================================
CUSTOMIZATION
==================================================

Player Version, Master Version and Fan Version jerseys can be customized.

Customization includes:
• Player Name
• Player Number

Customization Charge:
+₹199 per jersey.

Customized jerseys cannot be exchanged or returned for size-related reasons.

==================================================
COD POLICY
==================================================

If customers ask about Cash on Delivery:

Explain:
• COD is available.
• ₹50 COD handling charge is added per jersey.
• ₹50 advance payment is required to confirm the order and reduce fake orders.
• The remaining amount is payable at the time of delivery.

==================================================
PAYMENT ISSUES
==================================================

If a customer mentions that FamPay is not working, or they are having trouble making a payment:

Explain:
• If FamPay is not working, you can message us directly on WhatsApp to make your payment.
• Or, you can place the order and we will message you on WhatsApp to complete the payment.

==================================================
ORDER PROCESSING
==================================================

Orders are:
• Dispatched within 24 hours.
• Delivered within approximately 5–7 business days depending on the delivery location.

Tracking number is shared through WhatsApp after dispatch.

If customers ask:
"When will I receive my tracking?"

Reply:
"Once your order is dispatched, we will share your tracking number on your WhatsApp number."

==================================================
EXCHANGE POLICY
==================================================

If customers ask about exchange or return:

Explain:
• Size exchanges are available within 24 hours of delivery.
• A complete uncut unboxing video is mandatory.
• The product must be unused and in its original condition.
• Customized jerseys are NOT eligible for exchange or return.
• Customers are responsible for shipping charges for size exchanges.
• If the wrong product, wrong size (sent by us), damaged, or defective product is received, we will provide an exchange after verification.

==================================================
SALES ASSISTANT
==================================================

Your job is to help customers purchase confidently.
Recommend similar products based on what the customer is viewing.
Suggest matching products from the same category.
Help customers compare Player Version, Master Version, and Fan Version.
Encourage purchases naturally without using fake urgency or misleading claims.

==================================================
IMPORTANT RULES
==================================================
Never provide false stock information.
Never promise faster delivery than the official timeline.
Never invent reviews.
Never invent discounts.
Never provide legal or financial advice.
Always answer honestly.
If you do not know something, politely tell the customer instead of guessing.

Your goal is to provide a premium shopping experience that builds trust and helps customers choose the right product.`;

    let history = messages.slice(0, -1);
    const currentMessage = messages[messages.length - 1];
    
    // Restore history if this is a continued conversation.
    let contextStr = history
      .map(
        (m: any) =>
          `${m.role === "user" ? "User" : "Jersey Unicorn AI"}: ${m.content}`,
      )
      .join("\n");
      
    let prompt = `Conversation History:\n${contextStr}\n\nUser: ${currentMessage.content}\n\nPlease reply as Jersey Unicorn AI.`;
    
    if (history.length === 0) {
      prompt = currentMessage.content;
    }

    let responseText = "";
    let lastError = null;

    // Strategy: We will attempt to use each key.
    // If a key fails with a retryable error (like a transient network issue or temporary 503),
    // we do one exponential backoff retry for that specific key. 
    // If it still fails, or if it's a hard error (401, 403, 429 quota exceeded), 
    // we move to the next key.

    for (let i = 0; i < apiKeys.length; i++) {
      const key = apiKeys[i];
      let maxRetriesPerKey = 1;
      let attempt = 0;
      let successWithKey = false;
      
      while (attempt <= maxRetriesPerKey) {
        attempt++;
        try {
          console.log(`[Gemini AI] Attempting API key index ${i}, Retry attempt ${attempt}`);
          
          const ai = new GoogleGenAI({
            apiKey: key,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const chat = ai.chats.create({
            model: "gemini-2.0-flash",
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          const response = await chat.sendMessage({ message: prompt });
          responseText = response.text || "";
          
          if (responseText) {
            successWithKey = true;
            break; // Break the retry loop for this key
          }
        } catch (err: any) {
          const status = err?.status || err?.response?.status || 'unknown';
          const errMsg = err?.message || err?.toString() || 'Unknown Error';
          
          console.error(`[Gemini AI] API key index ${i} failed on attempt ${attempt}. HTTP Status: ${status}. Error: ${errMsg}`);
          lastError = err;
          
          // Determine if we should retry the SAME key, or move to the next key.
          // Hard errors where retrying the same key won't help immediately:
          // 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Quota Exceeded
          if (
            status === 400 || 
            status === 401 || 
            status === 403 || 
            status === 404 || 
            status === 429
          ) {
            console.log(`[Gemini AI] Fatal or Quota error (${status}). Skipping to next key.`);
            break; // Break the retry loop for this key, move to next key
          }

          // If we haven't exhausted retries for this key, wait and retry.
          if (attempt <= maxRetriesPerKey) {
            const backoffMs = Math.pow(2, attempt) * 500; // 1s, 2s, etc.
            console.log(`[Gemini AI] Temporary failure. Waiting ${backoffMs}ms before retrying same key...`);
            await sleep(backoffMs);
          }
        }
      }

      if (successWithKey) {
        console.log(`[Gemini AI] Successfully generated response using API key index ${i}.`);
        lastError = null;
        break; // Success! Break the main key loop
      }
    }

    if (lastError || !responseText) {
      console.error("[Gemini AI] FINAL REASON: All API keys exhausted or failed.");
      return res.status(500).json({ error: "Our AI assistant is currently unavailable due to high demand. Please try again later, or contact us on WhatsApp for support." });
    }

    return res.status(200).json({ text: responseText, audio: null });

  } catch (error: any) {
    console.error("[Gemini AI] Unexpected Server Error: ", error);
    return res.status(500).json({ error: "Our AI assistant encountered an unexpected error. Please try again later." });
  }
}
