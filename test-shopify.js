const SHOPIFY_DOMAIN = "https://0qtwuu-br.myshopify.com";
const SHOPIFY_STOREFRONT_TOKEN = "e711ef4603f75af0b8370a9b8ebeb2e5";
const query = `
  {
    products(first: 250) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;
fetch(`${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
  },
  body: JSON.stringify({ query }),
})
.then(res => res.json())
.then(data => {
  console.log(data);
  console.log(data.data?.products?.edges?.length);
});
