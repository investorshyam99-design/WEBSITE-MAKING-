const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenAI, Type } = require("@google/genai");
const cors = require("cors")({ origin: true });

// Read the secret configured via Firebase CLI
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const delhiveryApiToken = defineSecret("DELHIVERY_API_TOKEN");

exports.geminiProxy = onRequest({ secrets: [geminiApiKey, delhiveryApiToken] }, (req, res) => {
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
- Customer Care Number: 9930234467
- Keep answers short, clear, conversational, and conversion-friendly.

BUSINESS KNOWLEDGE & POLICIES

1. COD (Cash on Delivery)
- COD is AVAILABLE.
- ₹50 ADVANCE PAYMENT IS REQUIRED PER JERSEY for COD orders. (Example: 1 jersey = ₹50 advance, 2 jerseys = ₹100 advance, 3 jerseys = ₹150 advance).
- The remaining amount is collected as COD.
- CUSTOMIZED JERSEYS ARE NOT ELIGIBLE FOR COD. Always mention this if a user asks about COD.

2. CUSTOMIZATION
- Customization is available (Name and Number).
- CUSTOMIZED JERSEYS ARE NOT ELIGIBLE FOR COD. Customized orders require online/prepaid payment.
- Original-style font options are available where supported by our customization service.

3. EXCHANGE POLICY
- SIZE EXCHANGE: Size exchange is available, but the customer must pay the applicable delivery/shipping charges.
- DEFECTIVE/DAMAGED PRODUCT: If the product arrives defective or damaged, Jersey Unicorn will pay the applicable delivery charges for the replacement/exchange.
- DO NOT invent refund policies. We offer exchanges based on these rules.

4. SHIPPING INFORMATION
- Delivery charges and options (Fast/Normal) are shown at checkout.
- Customers can check pincode serviceability and ETA using the tracking API. Do NOT invent delivery dates.

5. TRACKING ORDERS
- Track orders using the AWB Number ONLY. DO NOT ask for the internal order number.
- If a customer says "Track my order" or "Where is my order?", respond: "Sure. Please enter your AWB / tracking number and I'll help you track your shipment."
- HOW TO GET TRACKING: "We will send your order tracking number through WhatsApp. You can also view your order and tracking information by going to My Orders on the website."

6. PRODUCTS
- Use the STORE CONTEXT to answer questions about products, prices, availability, and sizes.
- Player Version: Same style worn by professional players. Slim, athletic fit. Heat-pressed rubberized crests. Highly breathable performance fabric.
- Master/Fan Version: Looser, more relaxed fit. Embroidered fabric crests. Standard breathable fabric. Designed for everyday wear.
- If a product is not available in the actual catalog, say so. Do NOT hallucinate product availability.

7. WASHING INSTRUCTIONS
- Hand wash recommended. Do not machine wash.
- Wash inside out in cold water. Do not iron on prints or logos.`;

      const currentMessage = messages[messages.length - 1];
      const history = messages.slice(0, -1);
      
      let contextStr = history.map((m) => `${m.role === "assistant" ? "Jersey Unicorn AI" : "User"}: ${m.content}`).join('\n');
      
      let prompt = `Conversation History:\n${contextStr}\n\nUser: ${currentMessage.content}\n\nPlease reply as Jersey Unicorn AI.`;
      if (history.length === 0) {
        prompt = currentMessage.content;
      }

      
      // Add store context if provided
      const storeContext = req.body.storeContext || "";
      if (storeContext) {
          prompt += "\n\nSTORE CONTEXT (For your reference to answer user queries about products):\n" + storeContext;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
          tools: [{
              functionDeclarations: [
                {
                  name: "checkPincodeServiceability",
                  description: "Check if a pincode is serviceable for delivery and get ETA.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      pincode: { type: Type.STRING, description: "The 6-digit postal code to check." }
                    },
                    required: ["pincode"]
                  }
                },
                {
                  name: "trackShipmentByAWB",
                  description: "Track the status of a shipment using its AWB number.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      awb: { type: Type.STRING, description: "The AWB or tracking number." }
                    },
                    required: ["awb"]
                  }
                }
              ]
          }]
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            let functionResult = {};
            
            try {
                if (call.name === 'checkPincodeServiceability') {
                    const pincode = call.args.pincode;
                    const apiKey = delhiveryApiToken.value();
                    if (!apiKey) throw new Error("Delhivery API token missing");
                    
                    const res = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`, {
                        headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" }
                    });
                    const data = await res.json();
                    
                    if (data?.delivery_codes?.length > 0) {
                        const center = data.delivery_codes[0].postal_code;
                        functionResult = {
                            isServiceable: true,
                            city: center.city,
                            state: center.state,
                            codAvailable: center.cod === "Y",
                            eta: "5-7 business days normally, 3-5 days for Express delivery."
                        };
                    } else {
                        functionResult = { isServiceable: false, error: "Pincode valid but not serviceable." };
                    }
                } else if (call.name === 'trackShipmentByAWB') {
                    const awb = call.args.awb;
                    const apiKey = delhiveryApiToken.value();
                    const res = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${awb}`, {
                        headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" }
                    });
                    const data = await res.json();
                    
                    if (data && data.ShipmentData && data.ShipmentData.length > 0) {
                        const shipment = data.ShipmentData[0].Shipment;
                        functionResult = {
                            awb: shipment.AWB,
                            status: shipment.Status?.Status || "Pending",
                            statusType: shipment.Status?.StatusType || "Info",
                            statusDateTime: shipment.Status?.StatusDateTime || "",
                            destination: shipment.Destination || "",
                            expectedDelivery: shipment.ExpectedDeliveryDate || "Not available yet"
                        };
                    } else {
                        functionResult = { error: "Shipment not found or tracking unavailable for this AWB." };
                    }
                }
            } catch (error) {
                console.error("Tool execution error:", error);
                functionResult = { error: "Failed to execute function." };
            }
            
            const followUpResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    { role: "user", parts: [{ text: prompt }] },
                    { role: "model", parts: [{ functionCall: call }] },
                    { role: "user", parts: [{ functionResponse: { name: call.name, response: functionResult } }] }
                ],
                config: {
                    systemInstruction,
                    temperature: 0.7
                }
            });
            
            const finalResponseText = followUpResponse.text || "I processed your request but have no response.";
            return res.status(200).json({ text: finalResponseText, audio: null });
      }

      const responseText = response.text || "I'm sorry, I couldn't process your request.";
      return res.status(200).json({ text: responseText, audio: null });


    } catch (error) {
      console.error("[geminiProxy] Error processing request:", error);
      return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again later." });
    }
  });
});
