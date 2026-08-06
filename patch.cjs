const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Replace the apiKeys extraction part
  const newApiKeysLogic = `
    const targetKeys = ["G1", "G3", "G5", "G6", "G7", "GEMINI_API_KEY"];
    const apiKeys = [];
    
    // Verify each specified variable
    for (const k of targetKeys) {
      if (process.env[k] && process.env[k].trim().length > 0) {
        if (!apiKeys.includes(process.env[k].trim())) {
          apiKeys.push(process.env[k].trim());
        }
      } else {
        console.warn(\`[Gemini AI] Environment variable \${k} is missing or empty in production.\`);
      }
    }

    // Also dynamically collect any other matching keys just in case
    Object.entries(process.env).forEach(([key, value]) => {
      const k = key.toUpperCase();
      if (
        (k.includes("GEMINI") || k.match(/^G[0-9]+$/) || (k.includes("API_KEY") && !k.includes("RAZORPAY") && !k.includes("QIKINK"))) &&
        value && value.trim().length > 0
      ) {
        if (!apiKeys.includes(value.trim())) {
          apiKeys.push(value.trim());
        }
      }
    });

    if (apiKeys.length === 0) {
      console.error("[Gemini AI] FATAL: No Gemini API keys found in environment variables.");
      return res
        .status(500)
        .json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
    }
    
    console.log(\`[Gemini AI] Loaded \${apiKeys.length} API keys for rotation.\`);
`;

  // Use regex to replace the old apiKeys logic
  content = content.replace(/const apiKeys = Object\.entries\(process\.env\)[^]*?if \(apiKeys\.length === 0\) \{[^]*?\}/, newApiKeysLogic.trim());

  // Replace final error response
  content = content.replace(
    /if \(lastError \|\| !responseText\) \{[^]*?\}/,
    `if (lastError || !responseText) {
      console.error("[Gemini AI] FINAL REASON: All API keys exhausted or failed.");
      return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
    }`
  );
  
  // Replace generic error response
  content = content.replace(
    /return res\.status\(500\)\.json\(\{ error: "Our AI assistant encountered an unexpected error\. Please try again later\." \}\);/,
    `return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });`
  );

  fs.writeFileSync(filepath, content);
}

patchFile('api/gemini/chat.ts');
patchFile('server.ts');
console.log("Patched successfully!");
