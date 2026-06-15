import { fetchShopifyProducts } from "./src/services/shopify.ts";

async function test() {
  const data = await fetchShopifyProducts();
  console.log(JSON.stringify(data[0].variants.edges.map(e => e.node), null, 2));
}

test();
