const fetch = require('node-fetch');

async function test() {
  const query = `
    query($handle: String!) {
      product(handle: $handle) {
        id
        title
      }
    }
  `;
  const variables = { handle: "barcelona-away-jersey" };

  try {
    const res = await fetch('http://localhost:3000/api/catalog', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables })
    });
    
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Response:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
