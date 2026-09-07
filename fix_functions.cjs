const fs = require('fs');

const serverContent = fs.readFileSync('server.ts', 'utf8');

// Extract the systemInstruction from server.ts
const sysInstMatch = serverContent.match(/const systemInstruction = `([\s\S]+?)`;/);
const systemInstruction = sysInstMatch ? sysInstMatch[1] : '';

// Update functions/index.js
let functionsContent = fs.readFileSync('functions/index.js', 'utf8');

// Add defineSecret for DELHIVERY_API_TOKEN
if (!functionsContent.includes('DELHIVERY_API_TOKEN')) {
  functionsContent = functionsContent.replace(
    /const geminiApiKey = defineSecret\("GEMINI_API_KEY"\);/,
    `const geminiApiKey = defineSecret("GEMINI_API_KEY");\nconst delhiveryApiToken = defineSecret("DELHIVERY_API_TOKEN");`
  );
  
  functionsContent = functionsContent.replace(
    /onRequest\(\{ secrets: \[geminiApiKey\] \}/,
    `onRequest({ secrets: [geminiApiKey, delhiveryApiToken] }`
  );
}

// Replace the old systemInstruction with the new one
functionsContent = functionsContent.replace(/const systemInstruction = `[\s\S]+?`;/, `const systemInstruction = \`${systemInstruction}\`;`);

// Also add the Type import if missing
if (!functionsContent.includes('Type')) {
  functionsContent = functionsContent.replace(
    /const \{ GoogleGenAI \} = require\("@google\/genai"\);/,
    `const { GoogleGenAI, Type } = require("@google/genai");`
  );
}

fs.writeFileSync('functions/index.js', functionsContent, 'utf8');
console.log("Updated functions/index.js system instructions and secrets");
