const fs = require('fs');
let code = fs.readFileSync('functions/index.js', 'utf8');

// Replace the generateContent call to include tools and handle function calls
const newGenerateContent = `
      // Add store context if provided
      const storeContext = req.body.storeContext || "";
      if (storeContext) {
          prompt += "\\n\\nSTORE CONTEXT (For your reference to answer user queries about products):\\n" + storeContext;
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
                    
                    const res = await fetch(\`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=\${pincode}\`, {
                        headers: { "Authorization": \`Token \${apiKey}\`, "Content-Type": "application/json" }
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
                    const res = await fetch(\`https://track.delhivery.com/api/v1/packages/json/?waybill=\${awb}\`, {
                        headers: { "Authorization": \`Token \${apiKey}\`, "Content-Type": "application/json" }
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
`;

code = code.replace(/const response = await ai\.models\.generateContent\(\{[\s\S]*?return res\.status\(200\)\.json\(\{ text: responseText, audio: null \}\);/m, newGenerateContent);

fs.writeFileSync('functions/index.js', code, 'utf8');
