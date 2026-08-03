const fs = require('fs');
let content = fs.readFileSync('src/services/shopify.ts', 'utf8');
content = content.replace(
    'const response = await fetch(`${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {',
    'const response = await fetch(`/api/shopify`, {'
);
content = content.replace(
    '"X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,',
    ''
);
fs.writeFileSync('src/services/shopify.ts', content);
