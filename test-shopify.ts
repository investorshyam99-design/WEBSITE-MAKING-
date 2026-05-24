import fetch from 'node-fetch';

async function test() {
  const query = `
    {
      products(first: 250) {
        edges {
          node {
            title
          }
        }
      }
    }
  `;
  const res = await fetch("https://0qtwuu-br.myshopify.com/api/2024-01/graphql.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": "e711ef4603f75af0b8370a9b8ebeb2e5"
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const prods = data.data.products.edges.map((e: any) => e.node.title);
  console.log(prods.filter((t: string) => t.toLowerCase().includes("spain")));
}
test();
