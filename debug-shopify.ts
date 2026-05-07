import { fetchShopifyProducts } from './src/services/shopify';

async function main() {
  const products = await fetchShopifyProducts();
  console.log(JSON.stringify(products.map(p => ({
    title: p.title,
    productType: p.productType,
    tags: p.tags
  })), null, 2));
}

main();
