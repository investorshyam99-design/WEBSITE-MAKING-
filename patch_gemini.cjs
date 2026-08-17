const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `    const { messages } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("[Gemini AI] FATAL: GEMINI_API_KEY is missing.");
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const ai = new GoogleGenAI({ apiKey });`;

const replace = `    const { messages } = req.body;
    
    // Key rotation logic
    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.G1,
      process.env.G2,
      process.env.G3,
      process.env.G4,
      process.env.G5,
      process.env.G6,
      process.env.G7
    ].filter(Boolean);
    
    if (keys.length === 0) {
      console.error("[Gemini AI] FATAL: No Gemini API keys are configured (G1-G7).");
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('server.ts', code);
    console.log('patched server.ts with key rotation array');
} else {
    console.log('could not find search string in server.ts');
}
