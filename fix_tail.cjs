const fs = require('fs');

function fixTail(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(/\}\);\s*\}/g, '}');
  fs.writeFileSync(filepath, content);
}

fixTail('api/gemini/chat.ts');
fixTail('server.ts');
console.log("Fixed tail!");
