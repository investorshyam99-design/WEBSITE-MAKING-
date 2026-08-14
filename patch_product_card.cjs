const fs = require('fs');

let file = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

// change h3 to h2
file = file.replace(/<h3 className="(.*?)">/g, '<h2 className="$1">');
file = file.replace(/<\/h3>/g, '</h2>');

// change alt text
file = file.replace(/alt=\{\`\$\{product.name\} - Oversized Graphic Tee \| Jersey Unicorn\`\}/g, 'alt={`${product.name} India`}');

// add width/height to img in product card to prevent layout shift (aspect-ratio is 3/4)
// width="300" height="400"
file = file.replace(/<img\s+src=\{product.image \|\| undefined\}\s+alt=\{\`\$\{product.name\} India\`\}/, '<img\n            src={product.image || undefined}\n            alt={`${product.name} India`}\n            width="300"\n            height="400"');

fs.writeFileSync('src/components/ProductCard.tsx', file);
