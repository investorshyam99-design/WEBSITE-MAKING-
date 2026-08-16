const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// Also inject the Gemini API back to server.ts for local development
const geminiCode = fs.readFileSync('api/gemini.ts', 'utf8')
  .replace(/import { GoogleGenAI, Modality } from "@google\/genai";/, '')
  .replace(/export default async function handler\(req: any, res: any\) \{/, 'app.post("/api/gemini", async (req, res) => {')
  .replace(/}$/, '});');

const search = '  // Unified Delhivery Endpoint for local dev';
server = server.replace(search, geminiCode + '\n' + search);

// Add import if missing
if (!server.includes('GoogleGenAI')) {
  server = 'import { GoogleGenAI } from "@google/genai";\n' + server;
}

fs.writeFileSync('server.ts', server);
console.log('patched server.ts with gemini');
