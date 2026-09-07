const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Insert tools into the genai config
const toolsDeclaration = `
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
            }],
`;

code = code.replace(/config: \{[\s\S]*?temperature: 0.7\n\s*\}/, (match) => {
    return match.replace('temperature: 0.7', 'temperature: 0.7,' + toolsDeclaration);
});

// We need to import Type from @google/genai. Wait, it's already imported at line 5:
// import { GoogleGenAI, Type, Modality } from "@google/genai";

fs.writeFileSync('server.ts', code, 'utf8');
