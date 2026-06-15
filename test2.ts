import { fetchShopifyProducts } from "./src/services/shopify.ts";
import fs from "fs";

async function test() {
  const data = await fetchShopifyProducts();
  const allVariants = data.slice(0, 10).map(p => ({
    title: p.title,
    variants: p.variants.edges.map(e => e.node)
  }));
  fs.writeFileSync("test-all-variants.json", JSON.stringify(allVariants, null, 2));
}

test();
