const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `    if (keys.length === 0) {
      console.error("[Gemini AI] FATAL: No Gemini API keys are configured (G1-G7).");
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const ai = new GoogleGenAI({ apiKey });`;

const replace = `    if (keys.length === 0) {
      console.error("[Gemini AI] FATAL: No Gemini API keys are configured (G1-G7).");
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('server.ts', code);
    console.log('patched server.ts to remove old ai instance');
} else {
    console.log('could not find old ai instance search string');
}
