const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const regex = /  };\s+if \(\!product\) return;/;
code = code.replace(regex, `  };\n\n  const shareTelegram = () => {\n    if (!product) return;`);

fs.writeFileSync('src/pages/ProductPage.tsx', code);
