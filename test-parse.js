const { parseShopifyProducts } = require('./dist/server.cjs');
const fetch = require('node-fetch');
const SHOPIFY_DOMAIN = "https://0qtwuu-br.myshopify.com";
const SHOPIFY_STOREFRONT_TOKEN = "e711ef4603f75af0b8370a9b8ebeb2e5";
fetch(`${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
  },
  body: JSON.stringify({ query: '{ products(first: 250) { edges { node { id title tags images(first: 1) { edges { node { url } } } variants(first: 10) { edges { node { id title price { amount } availableForSale } } } } } } }' }),
}).then(res => res.json()).then(data => {
  const nodes = data.data.products.edges.map(e => e.node);
  const parsed = parseShopifyProducts(nodes);
  parsed.forEach(p => console.log(p.name, '=>', p.category));
});
