export const SHOPIFY_DOMAIN = "https://0qtwuu-br.myshopify.com";
export const SHOPIFY_STOREFRONT_TOKEN = "e711ef4603f75af0b8370a9b8ebeb2e5"; // Provided by user

export async function fetchShopifyProducts() {
  try {
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

    const response = await fetch(`/api/catalog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify({ query }),
      cache: "no-cache",
    });

    if (!response.ok) {
        console.error("Invalid response from Shopify:", await response.text());
        return [];
    }

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
