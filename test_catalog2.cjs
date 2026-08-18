const fetch = require('node-fetch');

async function test() {
  const query = `
    query {
      products(first: 1) {
        edges {
          node {
            handle
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('http://localhost:3000/api/catalog', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Handle:", json.data.products.edges[0].node.handle);
    
    const query2 = `
      query($handle: String!) {
        product(handle: $handle) {
          id
          title
        }
      }
    `;
    const variables = { handle: json.data.products.edges[0].node.handle };
    const res2 = await fetch('http://localhost:3000/api/catalog', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query2, variables })
    });
    console.log("Status 2:", res2.status);
    const json2 = await res2.json();
    console.log("Response 2:", JSON.stringify(json2, null, 2));

  } catch (err) {
    console.error(err);
  }
}
test();
