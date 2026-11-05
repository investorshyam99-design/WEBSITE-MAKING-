const fs = require('fs');
const path = 'src/data/products.ts';
let code = fs.readFileSync(path, 'utf8');

// Add tags to Product type
code = code.replace(
  /category: string;/g,
  'category: string;\n  tags?: string[];'
);

// Map tags in parseSingleShopifyProduct
code = code.replace(
  /slug: generateProductSlug\(node\.title, node\.id\),\n\s*\};\n/g,
  'slug: generateProductSlug(node.title, node.id),\n      tags: (node.tags || []).map((t: string) => t.toLowerCase()),\n    };\n'
);

fs.writeFileSync(path, code);
console.log("Success");
