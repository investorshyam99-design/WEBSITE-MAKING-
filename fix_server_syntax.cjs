const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Fix `););`
content = content.replace(/console\.log\(\`\[Gemini AI\] Loaded \$\{apiKeys\.length\} API keys for rotation\.\`\);\);\s*\}/g, 'console.log(`[Gemini AI] Loaded ${apiKeys.length} API keys for rotation.`);');

fs.writeFileSync('server.ts', content);
