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
    const response = await fetch('/api/shopify', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      cache: "no-cache",
    });

    const json = await response.json();
    return json.data.products.edges.map((edge: any) => edge.node);
  } catch (error) {
    console.error("Error fetching Shopify products:", error);
    return [];
  }
}
