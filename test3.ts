import { parseShopifyProducts } from "./src/data/products.ts";
import fs from "fs";

const rawData = [
  {
    "title": "Portugal Ronaldo 7 Maroon Acidwash Unisex Oversized Tshirt (Football)",
    "variants": {
      "edges": [
        {
          "node": {
            "id": "gid://shopify/ProductVariant/45183215337542",
            "title": "Maroon / S",
            "availableForSale": true,
            "selectedOptions": [
              {
                "name": "color",
                "value": "Maroon"
              },
              {
                "name": "size",
                "value": "S"
              }
            ]
          }
        }
      ]
    }
  }
];

const parsed = parseShopifyProducts(rawData);
console.log(JSON.stringify(parsed[0].variants, null, 2));
