import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    const domain = process.env.VITE_SHOPIFY_DOMAIN || "https://0qtwuu-br.myshopify.com";
    const token = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN || "e711ef4603f75af0b8370a9b8ebeb2e5";
    
    // Node 18+ has built in fetch
    const response = await fetch(`${domain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query }),
    });

    const json = await response.json();
    res.json(json);
  } catch (error: any) {
    console.error("Error fetching Shopify products proxy:", error);
    res.status(500).json({ error: "Failed to fetch from Shopify" });
  }
}
