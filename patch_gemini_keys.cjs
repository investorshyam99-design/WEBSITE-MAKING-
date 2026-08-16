const fs = require('fs');

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace the crazy dynamic key fetching logic with just one API key
  const searchRegex = /const targetKeys = \["G1"[\s\S]*?console\.log\(`\[Gemini AI\] Loaded \$\{apiKeys\.length\} API key candidate\(s\) for rotation\.`\);/g;

  const replacement = `const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.error("[Gemini AI] FATAL: GEMINI_API_KEY is missing or invalid.");
      return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again later." });
    }
    const apiKeys = [apiKey];`;

  code = code.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, code);
  console.log('patched ' + filePath);
}

patchFile('api/gemini/chat.ts');
