import fetch from "node-fetch";

const SHOPIFY_DOMAIN = "https://0qtwuu-br.myshopify.com";
const SHOPIFY_STOREFRONT_TOKEN = "e711ef4603f75af0b8370a9b8ebeb2e5";

async function fetchShopifyProducts() {
    const query = `
      {
        products(first: 250, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              description
              descriptionHtml
              productType
              tags
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
              images(first: 50) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `;
    const response = await fetch(`${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
        console.error("Invalid response from Shopify:", await response.text());
        return [];
    }

    const json = await response.json();
    console.log("Response:", JSON.stringify(json).slice(0, 500));
}

fetchShopifyProducts();
