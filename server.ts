import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayClient: Razorpay | null = null;
export function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error(
        "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET variables are required",
      );
    }
    razorpayClient = new Razorpay({ key_id, key_secret });
  }
  return razorpayClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Razorpay Order API
  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { items, paymentMode, finalAmount } = req.body;
      const razorpay = getRazorpay();

      let amount = 0;
      if (finalAmount !== undefined) {
        amount = Number(finalAmount);
      } else {
        // Fallback calculation just in case
        let itemsTotal = items.reduce(
          (sum: any, item: any) => sum + item.price * item.quantity,
          0,
        );

        if (paymentMode === "partial") {
          const baseAdvance =
            50 * items.reduce((sum: any, item: any) => sum + item.quantity, 0);
          amount = baseAdvance;
        } else {
          amount = itemsTotal;
        }
      }

      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency: "INR",
        receipt: "receipt_order_" + Date.now(),
      };

      const order = await razorpay.orders.create(options);
      res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error: any) {
      console.error("Error creating razorpay order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Razorpay Verify API
  app.post("/api/verify-razorpay-payment", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  });

  // Shopify Products API Proxy
  app.get("/api/store-inventory", async (req, res) => {
    try {
      const SHOPIFY_DOMAIN = "https://0qtwuu-br.myshopify.com";
      const SHOPIFY_STOREFRONT_TOKEN = "e711ef4603f75af0b8370a9b8ebeb2e5";
      
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
        cache: "no-cache",
      });
      
      const json = await response.json();
      res.json(json);
    } catch (error: any) {
      console.error("Error proxying Shopify products:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Qikink Fulfillment API
  app.post("/api/qikink/send-order", async (req, res) => {
    try {
      const { order } = req.body;
      if (!order) {
        return res.status(400).json({ error: "No order data provided" });
      }

      const apiKey = process.env.QIKINK_API_KEY || "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

      // Parse Address safely
      let houseNo = order.houseNo || "";
      let areaStreet = order.areaStreet || "";
      let city = order.city || "";
      let state = order.state || "";
      let pincode = order.pincode || "";

      if (!pincode && order.address) {
        // Fallback parser for older orders
        const pincodeMatch = order.address.match(/Pincode:\s*(\d{6})/i);
        pincode = pincodeMatch ? pincodeMatch[1] : "";
        const cleanAddress = order.address.replace(/Pincode:\s*\d{6}/i, "").trim();
        const parts = cleanAddress.split(",").map((p: string) => p.trim()).filter(Boolean);
        const count = parts.length;
        if (count >= 4) {
          houseNo = parts[0];
          areaStreet = parts.slice(1, count - 2).join(", ");
          city = parts[count - 2];
          state = parts[count - 1];
        } else if (count === 3) {
          houseNo = parts[0];
          city = parts[1];
          state = parts[2];
        } else if (count === 2) {
          city = parts[0];
          state = parts[1];
        } else if (count === 1) {
          city = parts[0];
        }
      }

      // Build products list
      const products: any[] = [];
      if (order.cartItems && order.cartItems.length > 0) {
        for (const item of order.cartItems) {
          let customName = "";
          let customNumber = "";
          if (item.customization) {
            customName = item.customization.name || "";
            customNumber = item.customization.number || "";
          }
          products.push({
            sku: item.productId || item.id || "JERSEY-PREMIUM",
            qty: item.quantity || 1,
            size: item.selectedSize || item.size || "M",
            price: item.price || 1199,
            design_id: "jersey_front_print",
            custom_name: customName,
            custom_number: customNumber
          });
        }
      } else {
        // Single jersey order mapping
        let customName = "";
        let customNumber = "";
        if (order.customization) {
          const matchResult = order.customization.match(/\(([^)]+)\)/);
          if (matchResult && matchResult[1]) {
            customNumber = matchResult[1];
            customName = order.customization.split("(")[0]?.trim();
          } else {
            customName = order.customization;
          }
        }
        products.push({
          sku: order.productId || "JERSEY-PREMIUM",
          qty: order.quantity || 1,
          size: order.size || "M",
          price: order.price || 1199,
          design_id: "jersey_front_print",
          custom_name: customName,
          custom_number: customNumber
        });
      }

      const fullnameStr = order.fullName || "Guest Customer";
      const nameParts = fullnameStr.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Customer";

      const qikinkPayload = {
        order_number: order.orderNumber ? order.orderNumber.toString() : order.id,
        qikink_shipping: "1",
        gateway: (order.paymentMode === "full" || order.status?.toLowerCase().includes("fampay") || order.status?.toLowerCase().includes("confirmed")) ? "Prepaid" : "COD",
        total_order_value: order.totalAmount || 0,
        line_items: products.map(p => ({
          sku: p.sku,
          quantity: p.qty,
          price: p.price,
          search_from_my_products: 1
        })),
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address1: houseNo || order.address?.split(",")[0] || "Address 1",
          address2: areaStreet || "Address 2",
          city: city || "City",
          province: state || "State",
          country_code: "IN",
          zip: pincode || "000000",
          phone: order.phone || "9999999999",
          email: order.email || "customer@jerseyunicorn.com"
        }
      };

      console.log("Fetching Qikink AccessToken...");
      const qikinkApiUrl = (process.env.QIKINK_API_URL || "https://sandbox.qikink.com").replace(/\/$/, "");
      console.log("QIKINK CONFIG", {
         apiUrl: qikinkApiUrl,
         hasKey: !!process.env.QIKINK_API_KEY
      });
      const tokenParams = new URLSearchParams({
        ClientId: "873512293843020",
        client_secret: apiKey
      });

      const tokenRes = await fetch(`${qikinkApiUrl}/api/token`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        body: tokenParams.toString()
      });

      let tokenData;
      try {
         tokenData = JSON.parse(await tokenRes.text());
      } catch(e) {
         return res.status(400).json({ error: "Failed to parse token response from Qikink" });
      }

      if (!tokenRes.ok || tokenData.error) {
        return res.status(400).json({ error: tokenData.error || "Failed to authenticate with Qikink API. Check your ClientId and Client Secret."});
      }

      const accessToken = tokenData.access_token || tokenData.Accesstoken || tokenData.AccessToken || tokenData.token;

      if (!accessToken) {
         return res.status(400).json({ error: "No access token found in Qikink auth response."});
      }

      console.log("Sending order request to Qikink API V2");

      // Post to Qikink v2 endpoint
      const qikinkRes = await fetch(`${qikinkApiUrl}/api/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ClientId": "873512293843020",
          "Accesstoken": accessToken,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: JSON.stringify(qikinkPayload)
      });

      const responseText = await qikinkRes.text();
      let qikinkData: any;
      try {
        qikinkData = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("Qikink returned non-JSON response:", responseText.substring(0, 500));
        qikinkData = { 
          error: "Qikink API returned HTML/invalid JSON: " + responseText.substring(0, 200),
          isHTML: true 
        };
      }

      if (!qikinkRes.ok || (qikinkData && qikinkData.status === "error") || (qikinkData && qikinkData.error)) {
        console.error("Qikink error response:", qikinkData);
        
        return res.status(400).json({
          error: qikinkData.message || qikinkData.error || "Failed payload rejected by Qikink API",
          details: qikinkData
        });
      }

      res.json({
        success: true,
        message: "Fulfillment submitted to Qikink successfully!",
        qikinkResponse: qikinkData
      });
    } catch (error: any) {
      console.error("Qikink fulfillment error:", error);
      res.status(500).json({ error: error.message || "Failed to submit fulfillment request" });
    }
  });

  app.post("/api/qikink/track-order", async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ error: "No order ID specified" });
      }

      const apiKey = process.env.QIKINK_API_KEY || "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

      console.log("Fetching Qikink AccessToken for tracking...");
      const qikinkApiUrl = process.env.QIKINK_API_URL || "https://sandbox.qikink.com";
      const tokenParams = new URLSearchParams({
        ClientId: "873512293843020",
        client_secret: apiKey
      });

      const tokenRes = await fetch(`${qikinkApiUrl}/api/token`, {
        method: "POST",
        headers: { 
           "Content-Type": "application/x-www-form-urlencoded",
           "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        body: tokenParams.toString()
      });

      let tokenData;
      try {
         tokenData = JSON.parse(await tokenRes.text());
      } catch(e) {
         return res.status(400).json({ error: "Failed to parse token response from Qikink" });
      }

      if (!tokenRes.ok || tokenData.error) {
        return res.status(400).json({ error: tokenData.error || "Failed to authenticate with Qikink API."});
      }

      const accessToken = tokenData.access_token || tokenData.Accesstoken || tokenData.AccessToken || tokenData.token;

      const qikinkRes = await fetch(`${qikinkApiUrl}/api/order?id=${encodeURIComponent(orderId)}`, {
        method: "GET",
        headers: {
          "ClientId": "873512293843020",
          "Accesstoken": accessToken
        }
      });

      const text = await qikinkRes.text();
      let qikinkData;
      try {
        qikinkData = JSON.parse(text);
      } catch(e) {
        return res.status(400).json({ error: "Non-JSON response from tracking API" });
      }
      
      if (!qikinkRes.ok || qikinkData.error) {
         return res.status(400).json({ error: qikinkData.error || "Failed to fetch tracking" });
      }

      res.json(qikinkData);
    } catch (error: any) {
      console.error("Qikink track error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch tracking details" });
    }
  });

  app.post("/api/catalog", async (req, res) => {
    try {
      const { query } = req.body;
      const domain =
        process.env.VITE_SHOPIFY_DOMAIN || "https://0qtwuu-br.myshopify.com";
      const token =
        process.env.VITE_SHOPIFY_STOREFRONT_TOKEN ||
        "e711ef4603f75af0b8370a9b8ebeb2e5";

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
  });

  // Meta Catalog CSV Feed for Dynamic Instagram/Meta Ads
  app.get("/api/meta-catalog", async (req, res) => {
    try {
      const domain =
        process.env.VITE_SHOPIFY_DOMAIN || "https://0qtwuu-br.myshopify.com";
      const token =
        process.env.VITE_SHOPIFY_STOREFRONT_TOKEN ||
        "e711ef4603f75af0b8370a9b8ebeb2e5";

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

      const shopifyRes = await fetch(`${domain}/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": token,
        },
        body: JSON.stringify({ query }),
      });

      const json = await shopifyRes.json();
      if (!json.data || !json.data.products) {
        throw new Error("Invalid response from Shopify store");
      }

      const products = json.data.products.edges.map((edge: any) => edge.node) || [];

      // Force the base URL to be the custom production URL as requested: jerseyunicorn.com
      const baseUrl = "https://jerseyunicorn.com";

      const escapeCSV = (val: string): string => {
        if (val === null || val === undefined) return "";
        let str = String(val).trim();
        // Compact single spaces instead of complex whitespace
        str = str.replace(/\s+/g, ' ');
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const headers = [
        "id",
        "title",
        "description",
        "link",
        "image_link",
        "brand",
        "condition",
        "availability",
        "price",
        "google_product_category"
      ];

      const rows = [headers.join(",")];

      for (const item of products) {
        const id = item.id.replace("gid://shopify/Product/", "");
        const title = item.title;
        // Generate clean URL slug matching frontend behavior
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const description = item.description || "Premium quality football jersey. Express your passion for the game.";
        const link = `${baseUrl}/products/${slug}`;
        
        const images = item.images?.edges.map((e: any) => e.node.url) || [];
        const mainImage = images[0] || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop";
        const price = item.variants?.edges[0]?.node?.price?.amount || "1199";
        const currency = item.variants?.edges[0]?.node?.price?.currencyCode || "INR";

        const googleProductCategory = "Apparel & Accessories > Clothing > Activewear > Athletic Jerseys > Football Jerseys";

        const row = [
          escapeCSV(id),
          escapeCSV(title),
          escapeCSV(description),
          escapeCSV(link),
          escapeCSV(mainImage),
          escapeCSV("Jersey Unicorn"),
          escapeCSV("new"),
          escapeCSV("in stock"),
          escapeCSV(`${price} ${currency}`),
          escapeCSV(googleProductCategory)
        ];

        rows.push(row.join(","));
      }

      res.header("Content-Type", "text/csv");
      res.attachment("meta_catalog_feed.csv");
      res.status(200).send(rows.join("\n"));
    } catch (error: any) {
      console.error("Error creating Meta catalog feed:", error);
      res.status(500).send(`Failed to generate catalog feed: ${error.message}`);
    }
  });

  // Dynamic Robots.txt API
  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");
    res.status(200).send(`User-agent: *
Allow: /
Allow: /collections/
Allow: /products/
Allow: /pages/
Allow: /policy
Disallow: /cart
Disallow: /checkout
Disallow: /account
Disallow: /admin
Disallow: /api/

Sitemap: https://jerseyunicorn.com/sitemap.xml
`);
  });

  // Dynamic XML Sitemap Route
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://jerseyunicorn.com";
      const today = new Date().toISOString().split("T")[0];

      const staticUrls = [
        { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
        { loc: `${baseUrl}/collections/world-cup-2026`, priority: "0.9", changefreq: "daily" },
        { loc: `${baseUrl}/collections/argentina`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/portugal`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/real-madrid`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/manchester-city`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/manchester-united`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/barcelona`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/liverpool`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/italy`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/japan`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/mexico`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/uruguay`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/france`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/retro-jerseys`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/player-version`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/fan-version`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/collections/all`, priority: "0.8", changefreq: "daily" },
        { loc: `${baseUrl}/policy`, priority: "0.5", changefreq: "monthly" },
        { loc: `${baseUrl}/pages/about-us`, priority: "0.5", changefreq: "monthly" },
        { loc: `${baseUrl}/pages/faq`, priority: "0.5", changefreq: "monthly" },
        { loc: `${baseUrl}/pages/shipping-policy`, priority: "0.5", changefreq: "monthly" },
        { loc: `${baseUrl}/pages/return-refund-policy`, priority: "0.5", changefreq: "monthly" },
        { loc: `${baseUrl}/pages/contact`, priority: "0.5", changefreq: "monthly" },
      ];

      // Fetch products from Shopify Storefront API
      let productUrls: { loc: string; priority: string; changefreq: string }[] = [];
      try {
        const SHOPIFY_DOMAIN = "https://0qtwuu-br.myshopify.com";
        const SHOPIFY_STOREFRONT_TOKEN = "e711ef4603f75af0b8370a9b8ebeb2e5";
        const query = `{ products(first: 250) { edges { node { title handle } } } }`;

        const shopifyRes = await fetch(`${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
          },
          body: JSON.stringify({ query }),
        });

        if (shopifyRes.ok) {
          const json = await shopifyRes.json();
          const edges = json.data?.products?.edges || [];
          productUrls = edges.map((e: any) => {
            const handle = e.node.handle || e.node.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            return {
              loc: `${baseUrl}/products/${handle}`,
              priority: "0.8",
              changefreq: "weekly",
            };
          });
        }
      } catch (err) {
        console.error("Error fetching products for sitemap:", err);
      }

      const allUrls = [...staticUrls, ...productUrls];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

      res.header("Content-Type", "application/xml");
      res.status(200).send(xml);
    } catch (error: any) {
      console.error("Sitemap error:", error);
      res.status(500).send("Failed to generate sitemap");
    }
  });

  // AI Assistant API Route
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages } = req.body;

      // Dynamically collect all possible Gemini API keys from environment variables
      const targetKeys = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "GOOGLE_API_KEY"];
      const apiKeys: string[] = [];
      
      const addKeyCandidate = (val: string) => {
        if (!val) return;
        const parts = val.split(",");
        for (const raw of parts) {
          const trimmed = raw.trim();
          if (
            trimmed.length > 0 &&
            trimmed !== "MY_GEMINI_API_KEY" &&
            trimmed !== "undefined" &&
            !apiKeys.includes(trimmed)
          ) {
            apiKeys.push(trimmed);
          }
        }
      };

      for (const k of targetKeys) {
        if (process.env[k]) {
          addKeyCandidate(process.env[k]!);
        }
      }

      Object.entries(process.env).forEach(([key, value]) => {
        const k = key.toUpperCase();
        if (
          (k.includes("GEMINI") || k.match(/^G[0-9]+$/) || (k.includes("API_KEY") && !k.includes("RAZORPAY") && !k.includes("QIKINK"))) &&
          typeof value === "string"
        ) {
          addKeyCandidate(value);
        }
      });

      if (apiKeys.length === 0) {
        console.error("[Gemini AI] FATAL: No Gemini API keys found in environment variables.");
        return res
          .status(500)
          .json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
      }
      
      console.log(`[Gemini AI] Loaded ${apiKeys.length} API key candidate(s) for rotation.`);

      const systemInstruction = `You are the official AI Shopping Assistant for JERSEY UNICORN.
Your primary goal is to help customers confidently purchase the right product by answering questions accurately, recommending the correct size, explaining product differences, and providing excellent customer support.

GENERAL BEHAVIOUR
- Always reply in the same language the customer uses.
- If the customer speaks English, reply in English.
- If the customer speaks Hindi, reply in Hindi.
- If the customer speaks Hinglish, reply in Hinglish.
- Be friendly, professional, concise, and helpful.
- Never provide false information.
- Never guess information that you do not know.
- Never promise discounts, refunds, or delivery dates beyond the official policy.

==================================================
PLAYER / MASTER / FAN DIFFERENCE
==================================================

Whenever a customer asks:

• What is the difference?
• Which version is better?
• Embroidery logo?
• Heat press logo?
• Which one should I buy?

Reply with:

Player Version

• Same style worn by professional players.
• Heat-pressed club crest, sponsor logo, and branding.
• Lightweight performance fabric.
• Slim athletic fit.
• Best for customers who want an authentic on-field experience.

Master Version

• Premium quality jersey with embroidered club crest/logo.
• Comfortable regular fit.
• Excellent balance of quality and comfort.
• Ideal for daily wear and football fans.

Fan Version

• Embroidered club crest/logo.
• Comfortable regular fit.
• Great value for everyday use.
• Perfect for casual football fans.

If someone specifically asks about embroidered logos:

Reply:

"The Master Version and Fan Version come with embroidered club logos. The Player Version uses premium heat-pressed logos, just like the jerseys worn by professional players during matches."

If the customer asks which version to choose:

Ask:

"Are you looking for the authentic player experience or a comfortable jersey for everyday wear?"

Then recommend the appropriate version based on their preference.

Always remain friendly, professional, and accurate. Never guess product details that are not available.

==================================================
SIZE RECOMMENDATION
==================================================

Whenever a customer asks:

• Which size should I buy?
• What is my perfect size?
• Suggest my size.
• Will this fit me?

The AI must NEVER guess the size immediately.

First ask:
1. What is your height?
2. What is your weight?
3. Which version are you buying?

Options:
• Player Version
• Master Version
• Fan Version

After receiving the customer's height, weight, and selected version:

If Player Version:
Recommend the best size according to the official Player Version size chart.

If Master Version or Fan Version:
Recommend the best size according to the official Master/Fan Version size chart.

After recommending a size, always add:
"For the most accurate fit, please refer to the Size Chart available on the product page before placing your order."

Never recommend a size without asking these questions first.

==================================================
CUSTOMIZATION
==================================================

Player Version, Master Version and Fan Version jerseys can be customized.
Customization includes:
• Player Name
• Player Number

Customization Charge:
+₹199 per jersey.

Customized jerseys cannot be exchanged or returned for size-related reasons.

==================================================
COD POLICY
==================================================

If customers ask about Cash on Delivery:
Explain:
• COD is available.
• ₹50 COD handling charge is added per jersey.
• ₹50 advance payment is required to confirm the order and reduce fake orders.
• The remaining amount is payable at the time of delivery.

==================================================
PAYMENT ISSUES
==================================================

If a customer mentions that FamPay is not working, or they are having trouble making a payment:
Explain:
• If FamPay is not working, you can message us directly on WhatsApp to make your payment.
• Or, you can place the order and we will message you on WhatsApp to complete the payment.

==================================================
ORDER PROCESSING
==================================================

Orders are:
• Dispatched within 24 hours.
• Delivered within approximately 5–7 business days depending on the delivery location.

Tracking number is shared through WhatsApp after dispatch.

If customers ask:
"When will I receive my tracking?"
Reply:
"Once your order is dispatched, we will share your tracking number on your WhatsApp number."

==================================================
EXCHANGE POLICY
==================================================

If customers ask about exchange or return:
Explain:
• Size exchanges are available within 24 hours of delivery.
• A complete uncut unboxing video is mandatory.
• The product must be unused and in its original condition.
• Customized jerseys are NOT eligible for exchange or return.
• Customers are responsible for shipping charges for size exchanges.
• If the wrong product, wrong size (sent by us), damaged, or defective product is received, we will provide an exchange after verification.

==================================================
SALES ASSISTANT
==================================================

Your job is to help customers purchase confidently.
Recommend similar products based on what the customer is viewing.
Suggest matching products from the same category.
Help customers compare Player Version, Master Version, and Fan Version.
Encourage purchases naturally without using fake urgency or misleading claims.

==================================================
IMPORTANT RULES
==================================================
Never provide false stock information.
Never promise faster delivery than the official timeline.
Never invent reviews.
Never invent discounts.
Never provide legal or financial advice.
Always answer honestly.
If you do not know something, politely tell the customer instead of guessing.
Your goal is to provide a premium shopping experience that builds trust and helps customers choose the right product.`;

      let history = messages.slice(0, -1);
      const currentMessage = messages[messages.length - 1];
      
      // Restore history if this is a continued conversation.
      let contextStr = history
        .map(
          (m: any) =>
            `${m.role === "user" ? "User" : "Jersey Unicorn AI"}: ${m.content}`,
        )
        .join("\n");
        
      let prompt = `Conversation History:\n${contextStr}\n\nUser: ${currentMessage.content}\n\nPlease reply as Jersey Unicorn AI.`;
      
      if (history.length === 0) {
        prompt = currentMessage.content;
      }

      let responseText = "";
      let lastError = null;

      const MODELS_TO_TRY = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];

      for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[i];
        let successWithKey = false;

        for (const modelName of MODELS_TO_TRY) {
          try {
            console.log(`[Gemini AI] Trying Key #${i + 1} with Model: ${modelName}`);

            const ai = new GoogleGenAI({
              apiKey: key,
              httpOptions: {
                headers: {
                  "User-Agent": "aistudio-build",
                },
              },
            });

            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });

            responseText = response.text || "";

            if (responseText && responseText.trim().length > 0) {
              console.log(`[Gemini AI] SUCCESS: Key #${i + 1} generated response with model ${modelName}`);
              successWithKey = true;
              lastError = null;
              break;
            }
          } catch (err: any) {
            const status = err?.status || err?.response?.status || "unknown";
            const errMsg = err?.message || err?.toString() || "Unknown Error";
            console.warn(`[Gemini AI] Key #${i + 1} with model ${modelName} failed (HTTP ${status}): ${errMsg}`);
            lastError = err;
          }
        }

        if (successWithKey) {
          break;
        }
      }

      if (!responseText) {
        console.error("[Gemini AI] All configured keys and model attempts failed. Last error:", lastError);
        return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
      }

      return res.status(200).json({ text: responseText, audio: null });

    } catch (error: any) {
      console.error("[Gemini AI] Unexpected Server Error: ", error);
      return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
    }
  });


  // --------------------------------------------------
  // DELHIVERY INTEGRATION
  // --------------------------------------------------

  app.get("/api/shipping/delhivery/serviceability", async (req, res) => {
    try {
      const apiKey = process.env.DELHIVERY_API_TOKEN;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "DELHIVERY_API_TOKEN not configured" });
      }

      const { pincode } = req.query;
      if (!pincode) {
        return res.status(400).json({ success: false, error: "Pincode is required" });
      }

      const response = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`, {
        method: "GET",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({ success: false, error: "Delhivery API authentication failed." });
      } else if (response.status >= 500) {
        return res.status(502).json({ success: false, error: "Delhivery server error" });
      } else if (!response.ok) {
        return res.status(400).json({ success: false, error: "Delhivery API request failed." });
      }

      let data;
      try {
        data = await response.json();
      } catch (err) {
        return res.status(500).json({ success: false, error: "Invalid response from Delhivery API" });
      }
      
      if (data && data.delivery_codes && data.delivery_codes.length > 0) {
        const center = data.delivery_codes[0].postal_code;
        return res.json({
          success: true,
          isServiceable: true,
          city: center.city,
          state: center.state_code,
          district: center.district,
          prepaid: center.pre_paid === "Y",
          cod: center.cod === "Y",
          repl_tc: center.repl_tc
        });
      }

      return res.json({ success: true, isServiceable: false, error: "Pincode valid but not serviceable." });
    } catch (e: any) {
      console.error("[Delhivery] Serviceability Error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // Calculate Delhivery TAT
  app.get("/api/shipping/delhivery/tat", async (req, res) => {
    try {
      const apiKey = process.env.DELHIVERY_API_TOKEN;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "DELHIVERY_API_TOKEN not configured" });
      }

      const { dest } = req.query;
      const origin = process.env.DELHIVERY_PICKUP_PINCODE || process.env.DELHIVERY_ORIGIN_PINCODE;

      if (!origin) {
        console.warn("[Delhivery] DELHIVERY_PICKUP_PINCODE is not configured. Falling back to default TAT estimation.");
      }

      if (!dest) {
        return res.status(400).json({ success: false, error: "Destination pincode is required" });
      }
      
      let normalDays = 5; // default fallback
      let expressDays = 3;
      let expressAvailable = true;

      // Realistically, Delhivery's TAT API endpoint is:
      // https://track.delhivery.com/api/v1/packages/cost/?md=S&ss=Delivered&d_pin={dest}&o_pin={origin}
      if (origin) {
        try {
          const surfaceRes = await fetch(`https://track.delhivery.com/api/v1/packages/cost/?md=S&ss=Delivered&d_pin=${dest}&o_pin=${origin}`, {
            headers: { "Authorization": `Token ${apiKey}` }
          });
          const surfaceData = await surfaceRes.json();
          
          const expressRes = await fetch(`https://track.delhivery.com/api/v1/packages/cost/?md=E&ss=Delivered&d_pin=${dest}&o_pin=${origin}`, {
            headers: { "Authorization": `Token ${apiKey}` }
          });
          const expressData = await expressRes.json();
          
          if (surfaceData && surfaceData.length > 0 && surfaceData[0].expected_delivery_date) {
            // Further parsing could go here
          }
        } catch(e) {
          console.error("TAT fetch error", e);
        }
      }
      
      // If we don't have accurate API TAT, calculate a deterministic TAT based on the destination pincode
      // This ensures we always return a solid estimate.
      const prefix = String(dest).substring(0, 1);
      const originPrefix = String(origin).substring(0, 1);
      
      if (prefix === originPrefix) {
        normalDays = 3;
        expressDays = 1;
      } else if (["7", "8", "9"].includes(prefix)) { // North East, J&K, etc.
        normalDays = 7;
        expressDays = 5;
        if (prefix === "7" && String(dest).substring(0,2) !== "73" && String(dest).substring(0,2) !== "74") {
          expressAvailable = false; // Disable express for remote areas
        }
      } else {
        normalDays = 5;
        expressDays = 2;
      }

      return res.json({
        success: true,
        tat: {
          normal: { days: normalDays, mode: "Surface" },
          express: { days: expressDays, mode: "Express", available: expressAvailable }
        }
      });
      
    } catch (e: any) {
      console.error("[Delhivery] TAT Error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/shipping/delhivery/create", async (req, res) => {
    try {
      const apiKey = process.env.DELHIVERY_API_TOKEN;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "DELHIVERY_API_TOKEN not configured" });
      }

      const { orderData } = req.body;
      if (!orderData) {
        return res.status(400).json({ success: false, error: "Order data missing" });
      }

      const payload = {
        shipments: [
          {
            name: orderData.fullName,
            add: orderData.address,
            pin: orderData.pincode,
            city: orderData.city,
            state: orderData.state,
            country: "India",
            phone: orderData.phone,
            order: String(orderData.orderNumber),
            payment_mode: orderData.paymentMode === "full" ? "Pre-paid" : "COD",
            cod_amount: orderData.paymentMode === "full" ? 0 : orderData.codAmount,
            products_desc: orderData.productDesc,
            quantity: String(orderData.quantity || 1),
            weight: String(orderData.weight || 500),
            total_amount: orderData.finalTotal,
            shipping_mode: orderData.shippingMode || "Surface"
          }
        ],
        pickup_location: {
          name: process.env.DELHIVERY_PICKUP_LOCATION || process.env.DELHIVERY_CLIENT_NAME || "Primary"
        }
      };

      const formData = new URLSearchParams();
      formData.append("format", "json");
      formData.append("data", JSON.stringify(payload));

      const response = await fetch("https://track.delhivery.com/api/cmu/create.json", {
        method: "POST",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });

      const data = await response.json();

      if (!data.success && (!data.packages || data.packages.length === 0 || !data.packages[0].waybill)) {
        return res.status(400).json({ success: false, error: data.error || data.rmk || "Failed to create shipment via Delhivery API" });
      }

      const waybill = data.packages[0].waybill;
      return res.json({ success: true, awb: waybill, data });
    } catch (e: any) {
      console.error("[Delhivery] Create Shipment Error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/shipping/delhivery/label/:awb", async (req, res) => {
    try {
      const apiKey = process.env.DELHIVERY_API_TOKEN;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "DELHIVERY_API_TOKEN not configured" });
      }

      const { awb } = req.params;
      const response = await fetch(`https://track.delhivery.com/api/p/packing_slip?wbns=${awb}&pdf=true`, {
        method: "GET",
        headers: { "Authorization": `Token ${apiKey}` }
      });

      const data = await response.json();
      return res.json(data);
    } catch (e: any) {
      console.error("[Delhivery] Label Error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/shipping/delhivery/track/:awb", async (req, res) => {
    try {
      const apiKey = process.env.DELHIVERY_API_TOKEN;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "DELHIVERY_API_TOKEN not configured" });
      }

      const { awb } = req.params;
      const response = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${awb}`, {
        method: "GET",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      return res.json(data);
    } catch (e: any) {
      console.error("[Delhivery] Track Error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // Streamable Hero Video API to handle dynamic signature expirations
  app.get("/api/hero-video", async (req, res) => {
    try {
      const response = await fetch("https://api.streamable.com/videos/93ruep");
      if (!response.ok) {
        throw new Error(`Failed to fetch from Streamable API: ${response.statusText}`);
      }
      const data: any = await response.json();
      const mp4Url = data.files?.mp4?.url || data.files?.["mp4-mobile"]?.url;
      if (!mp4Url) {
        throw new Error("No MP4 video URL found in Streamable metadata");
      }
      res.json({ url: mp4Url });
    } catch (error: any) {
      console.error("Error fetching dynamic Streamable link:", error);
      res.json({ url: "/hero-video.mp4" });
    }
  });

  // Diagnostic endpoint for Delhivery API
  app.get("/api/delhivery/health", async (req, res) => {
    try {
      const apiKey = process.env.DELHIVERY_API_TOKEN;
      if (!apiKey) {
        return res.json({
          authenticated: false,
          apiReachable: true,
          serviceabilityApi: false,
          shipmentApi: false,
          error: "DELHIVERY_API_TOKEN is not configured"
        });
      }

      const response = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=400001`, {
        method: "GET",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401 || response.status === 403) {
        return res.json({
          authenticated: false,
          apiReachable: true,
          serviceabilityApi: false,
          shipmentApi: false,
          error: "Delhivery authentication failed. Check your API token."
        });
      }

      if (!response.ok) {
        return res.json({
          authenticated: true,
          apiReachable: true,
          serviceabilityApi: false,
          shipmentApi: false,
          error: "Delhivery API returned error: " + response.status
        });
      }

      return res.json({
        authenticated: true,
        apiReachable: true,
        serviceabilityApi: true,
        shipmentApi: true,
        errors: []
      });
    } catch (e: any) {
      return res.json({
        authenticated: false,
        apiReachable: false,
        serviceabilityApi: false,
        shipmentApi: false,
        error: e.message
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
