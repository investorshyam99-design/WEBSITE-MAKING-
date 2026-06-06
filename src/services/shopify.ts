export const SHOPIFY_DOMAIN = "https://0qtwuu-br.myshopify.com";
export const SHOPIFY_STOREFRONT_TOKEN = "e711ef4603f75af0b8370a9b8ebeb2e5"; // Provided by user

export async function fetchShopifyProducts() {
  const query = `
    {
      products(first: 250, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            description
            productType
            tags
            variants(first: 1) {
              edges {
                node {
                  id
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
            images(first: 5) {
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

  try {
    const response = await fetch(`${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query }),
      cache: "no-cache",
    });

    const json = await response.json();
    if (!json.data || !json.data.products) {
      console.error("Invalid response from Shopify:", json);
      return [];
    }
    return json.data.products.edges.map((edge: any) => edge.node);
  } catch (error) {
    console.error("Error fetching Shopify products:", error);
    return [];
  }
}
