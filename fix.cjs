const fs = require('fs');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(/console\.log\(\`\[Gemini AI\] Loaded \$\{apiKeys\.length\} API keys for rotation\.\`\);\);\s*\}/, 'console.log(`[Gemini AI] Loaded ${apiKeys.length} API keys for rotation.`);');
  fs.writeFileSync(filepath, content);
}

fixFile('api/gemini/chat.ts');
fixFile('server.ts');
console.log("Fixed!");
