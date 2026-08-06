const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Fix the dangling `});\n      }`
content = content.replace(/error: "Our AI Assistant is temporarily unavailable\. Please try again in a few minutes\." \}\);\n      \}\);\n      \}/g, 'error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });\n      }');

fs.writeFileSync('server.ts', content);
