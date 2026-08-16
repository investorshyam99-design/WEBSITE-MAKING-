const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const geminiCode = fs.readFileSync('api/gemini.ts', 'utf8')
  .replace(/import type \{ VercelRequest, VercelResponse \} from '@vercel\/node';/, '')
  .replace(/import \{ GoogleGenAI \} from "@google\/genai";/, '')
  .replace(/export default async function handler\(req: VercelRequest, res: VercelResponse\) \{/, 'app.post("/api/gemini", async (req, res) => {')
  .replace(/}$/, '});');

// Remove old gemini handler from server.ts
server = server.replace(/app\.post\("\/api\/gemini", async \(req, res\) => \{[\s\S]*?\}\);\n/, '');

const search = '  // Unified Delhivery Endpoint for local dev';
server = server.replace(search, geminiCode + '\n' + search);

fs.writeFileSync('server.ts', server);
console.log('patched server.ts with simple gemini');
