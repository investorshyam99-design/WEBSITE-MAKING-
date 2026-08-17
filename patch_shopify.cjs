const fs = require('fs');
let code = fs.readFileSync('src/services/shopify.ts', 'utf8');
code = code.replace(/await fetch\(\`\$\{domain\}\/api/g, "await fetch(`https://${domain.replace(/^https?:\\/\\//, '')}/api");
fs.writeFileSync('src/services/shopify.ts', code);
console.log("Patched shopify.ts");
