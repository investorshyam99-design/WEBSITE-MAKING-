const fs = require('fs');

let file = fs.readFileSync('src/lib/productSeoHelper.ts', 'utf8');

// The prompt wants: "{Team} {Home/Away} Jersey {Year} | {Version} | ₹{price} – Jersey Unicorn"
const regex = /let rawTitle =.*?;/s;
const replace = `let rawTitle = \`\${team} \${kitType} Jersey \${season} | \${versionLabel} | ₹\${product.price} – Jersey Unicorn\`;
  if (rawTitle.length > 70) {
    rawTitle = \`\${name} | ₹\${product.price} – Jersey Unicorn\`;
  }`;
  
file = file.replace(regex, replace);

// And we need to make sure seoTitle substring is not hard-limited to 60 if we need more, but it's okay, maybe 70? Or just remove the substring since it's an exact format requested.
const regex2 = /const seoTitle = rawTitle\.substring\(0, 60\);/;
const replace2 = `const seoTitle = rawTitle;`;
file = file.replace(regex2, replace2);

fs.writeFileSync('src/lib/productSeoHelper.ts', file);
