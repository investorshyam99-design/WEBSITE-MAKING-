import { SHOPIFY_DOMAIN, SHOPIFY_STOREFRONT_TOKEN, fetchShopifyProducts } from "./src/services/shopify.ts";
fetchShopifyProducts().then(console.log).catch(console.error);
