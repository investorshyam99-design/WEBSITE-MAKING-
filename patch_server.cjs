const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const originalKeysRegex = /\/\/\s*Dynamically collect all possible Gemini API keys[^]*?if\s*\(apiKeys\.length === 0\)\s*\{[^]*?\}/;
const newKeysLogic = `
      // Dynamically collect all possible Gemini API keys from environment variables
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
          value && typeof value === 'string' && value.trim().length > 0
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

content = content.replace(originalKeysRegex, newKeysLogic.trim());

// Update error messages in server.ts
content = content.replace(
  /if \(lastError \|\| !responseText\) \{[^]*?\}/,
  `if (lastError || !responseText) {
        console.error("[Gemini AI] FINAL REASON: All API keys exhausted or failed.");
        return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
      }`
);

content = content.replace(
  /return res\.status\(500\)\.json\(\{ error: "Our AI assistant encountered an unexpected error\. Please try again later\." \}\);/,
  `return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });`
);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts successfully");
