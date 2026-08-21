import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import Razorpay from "razorpay";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

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

      // Trust only backend calculation
      const { deliveryMethod } = req.body;
      const itemsTotal = items.reduce((sum: any, item: any) => sum + (item.price * item.quantity), 0);
      const isFastDelivery = deliveryMethod === "FAST";
      const fastDeliveryFee = isFastDelivery ? 50 : 0;
      
      let amount = 0;
      if (paymentMode === 'partial') {
        amount = isFastDelivery ? 100 : 50;
      } else {
        amount = itemsTotal + fastDeliveryFee;
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

  // Shopify Fulfillment API

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
        body: JSON.stringify(req.body),
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


  // --------------------------------------------------
  // DELHIVERY INTEGRATION
  // --------------------------------------------------



app.post("/api/gemini", async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    
    // Key rotation logic
    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.G1,
      process.env.G2,
      process.env.G3,
      process.env.G4,
      process.env.G5,
      process.env.G6,
      process.env.G7
    ].filter(Boolean);
    
    if (keys.length === 0) {
      console.error("[Gemini AI] FATAL: No Gemini API keys are configured (G1-G7).");
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }
    
    const systemInstruction = `You are the official AI Shopping Assistant for JERSEY UNICORN.
Your primary goal is to help customers confidently purchase the right product by answering questions accurately, recommending the correct size, explaining product differences, and providing excellent customer support.

GENERAL BEHAVIOUR
- Always reply in the same language the customer uses.
- Be friendly, professional, concise, and helpful.
- Never provide false information.
- Never guess information that you do not know.
- Never promise discounts, refunds, or delivery dates beyond the official policy.

PLAYER / MASTER / FAN DIFFERENCE
Player Version: Same style worn by professional players. Slim, athletic fit. Heat-pressed rubberized crests. Highly breathable performance fabric.
Master/Fan Version: Looser, more relaxed fit. Embroidered fabric crests. Standard breathable fabric. Designed for everyday wear.

WASHING INSTRUCTIONS
- Hand wash recommended.
- Do not machine wash.
- Wash inside out in cold water.
- Do not iron on prints or logos.`;

    // Convert messages to string context
    const currentMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1);
    
    let contextStr = history.map((m: any) => `${m.role === "assistant" ? "Jersey Unicorn AI" : "User"}: ${m.content}`).join('\n');
    let prompt = `Conversation History:\n${contextStr}\n\nUser: ${currentMessage.content}\n\nPlease reply as Jersey Unicorn AI.`;
    if (history.length === 0) {
      prompt = currentMessage.content;
    }

    let lastError: any = null;
    
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];
      try {
        const ai = new GoogleGenAI({ apiKey: currentKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash", // stable fast model
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        
        console.log(`[Gemini AI] Successfully used key index ${i}`);
        const responseText = response.text || "I'm sorry, I couldn't process your request.";
        return res.status(200).json({ text: responseText, audio: null });
      } catch (err: any) {
        console.error(`[Gemini AI] Error with key index ${i}: `, err.message || err);
        lastError = err;
      }
    }

    console.error("[Gemini AI] All keys failed. Last error: ", lastError);
    return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
  } catch (error: any) {
    console.error("[Gemini AI] Unexpected Server Error: ", error);
    return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
  }
});

  // Unified Delhivery Endpoint for local dev
  app.all("/api/delhivery", async (req, res) => {
    const { action, awb, dest, pincode, orderData } = req.method === 'POST' ? req.body : req.query;

    const apiKey = process.env.DELHIVERY_API_TOKEN;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "DELHIVERY_API_TOKEN not configured" });
    }

    try {
      if (action === 'health') {
        const response = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=400001`, {
          method: "GET",
          headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" }
        });
        if (!response.ok) return res.json({ authenticated: false, apiReachable: true, error: "Delhivery authentication failed" });
        return res.json({ authenticated: true, apiReachable: true, serviceabilityApi: true, shipmentApi: true });
      }

      if (action === 'serviceability') {
        if (!pincode) return res.status(400).json({ success: false, error: "Pincode is required" });
        const response = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`, {
          method: "GET", headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (data?.delivery_codes?.length > 0) {
          const center = data.delivery_codes[0].postal_code;
          return res.json({
            success: true, isServiceable: true, city: center.city, state: center.state_code,
            district: center.district, prepaid: center.pre_paid === "Y", cod: center.cod === "Y"
          });
        }
        return res.json({ success: true, isServiceable: false, error: "Pincode valid but not serviceable." });
      }

      if (action === 'tat') {
        const origin = process.env.DELHIVERY_PICKUP_PINCODE || "410206";
        if (!dest) return res.status(400).json({ success: false, error: "Destination pincode is required" });
        
        let normalDays = 5, expressDays = 3, expressAvailable = true;
        
        // 1. Check Serviceability API first
        const servRes = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${dest}`, {
          headers: { "Authorization": `Token ${apiKey}` }
        });
        if (servRes.ok) {
          const servData: any = await servRes.json();
          if (servData?.delivery_codes?.length > 0) {
            const pinInfo = servData.delivery_codes[0].postal_code;
            if (pinInfo.pre_paid === "N" && pinInfo.cod === "N") {
              return res.json({ success: true, serviceable: false });
            }
          } else {
             // invalid pincode
             return res.json({ success: true, serviceable: false });
          }
        } else {
          return res.status(400).json({ success: false, error: "Delhivery Serviceability check failed" });
        }

        // 2. Zone lookup for fallback TAT
        const zoneRes = await fetch(`https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${dest}&o_pin=${origin}&cgm=500`, {
          headers: { "Authorization": `Token ${apiKey}` }
        });
        
        if (zoneRes.ok) {
          const zoneData: any = await zoneRes.json();
          if (zoneData?.[0]?.zone) {
            const zone = String(zoneData[0].zone).toUpperCase();
            if (zone.startsWith("A")) { normalDays = 2; expressDays = 1; }
            else if (zone.startsWith("B")) { normalDays = 3; expressDays = 2; }
            else if (zone.startsWith("C")) { normalDays = 4; expressDays = 2; }
            else if (zone.startsWith("D")) { normalDays = 5; expressDays = 3; }
            else if (zone.startsWith("E")) { normalDays = 7; expressDays = 5; expressAvailable = false; }
          }
        }
        
        return res.json({ 
          success: true, 
          serviceable: true,
          tat: { 
            normal: { days: normalDays, mode: "Surface" }, 
            express: { days: expressDays, mode: "Express", available: expressAvailable } 
          } 
        });
      }

      
      if (action === 'diagnostic') {
        if (!req.body.orderId) return res.status(400).json({ success: false, error: "Missing orderId" });
        const orderSnap = await getDoc(doc(db, 'orders', req.body.orderId));
        if (!orderSnap.exists()) return res.status(404).json({ success: false, error: "Order not found" });
        const order = orderSnap.data();
        const isCod = order.paymentMode === "partial";
        
        let productDesc = order.productName || "Jersey";
        if (order.category) productDesc += ` - ${order.category.replace("-", " ")}`;
        if (order.size) productDesc += ` - Size ${order.size}`;
        
        return res.json({
           success: true,
           diagnostic: {
              orderId: req.body.orderId,
              pickupLocation: (process.env.DELHIVERY_PICKUP_LOCATION || "").trim(),
              destinationPincode: order.pincode,
              paymentMode: isCod ? "COD" : "Prepaid",
              
              codAmount: isCod ? (order.codAmount || 0) : 0,
              product: productDesc,
              quantity: order.quantity || 1,
              weight: 500,
              shipping_mode: (String(order.deliveryType || "NORMAL").toUpperCase() === "FAST") ? "Express" : "Surface",
              endpointUsed: "https://track.delhivery.com/api/cmu/create.json"

           }
        });
      }

            if (action === 'create') {
        if (!req.body.orderId) return res.status(400).json({ success: false, error: "Missing orderId" });
        const orderId = req.body.orderId;
        
        // Fetch authoritative order record from database
        const orderSnap = await getDoc(doc(db, 'orders', orderId));
        if (!orderSnap.exists()) return res.status(404).json({ success: false, error: "Order Data Error: Order not found in database" });
        
        const order = orderSnap.data();
        
        // DUPLICATE SHIPMENT PROTECTION
        if (order.delhiveryAwb || order.delhiveryShipmentId || order.awbNumber || order.trackingId) {
           return res.status(400).json({ success: false, error: "Duplicate Shipment: Order already has an AWB or Tracking ID", awb: order.delhiveryAwb || order.awbNumber || order.trackingId });
        }
        
        // Validate required fields
        const required = ['fullName', 'phone', 'address', 'pincode', 'paymentMode'];
        for (const field of required) {
          if (order[field] === undefined || order[field] === null || order[field] === "") {
             return res.status(400).json({ success: false, error: `Order Data Error: Missing required field: ${field}` });
          }
        }
        
        
        const rawType = order.deliveryType || "NORMAL";
        const effectiveDeliveryType = String(rawType).toUpperCase() === "FAST" ? "FAST" : "NORMAL";

        
        // WAREHOUSE VALIDATION
        const rawWarehouse = process.env.DELHIVERY_PICKUP_LOCATION || "";
        const pickupLocation = rawWarehouse.trim();
        
        console.log("[Delhivery Diagnostic] Raw WAREHOUSE:", `"${rawWarehouse}"`);
        console.log("[Delhivery Diagnostic] Trimmed WAREHOUSE:", `"${pickupLocation}"`);
        
        if (!pickupLocation) {
             return res.status(400).json({ success: false, error: "Delhivery Configuration Error: DELHIVERY_PICKUP_LOCATION environment variable is not set. Please configure the exact registered warehouse name." });
        }
        
        // CUSTOMER NAME LOGIC
        const nameParts = String(order.fullName).trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ").trim();
        const formattedName = `${firstName}${lastName ? " " + lastName : ""}`;
        
        if (!firstName) {
            return res.status(400).json({ success: false, error: "Order Data Error: First name is missing from fullName" });
        }
        
        // PAYMENT CALCULATION
        const isCod = order.paymentMode === "partial" || order.paymentMode === "cod";
        
        const totalOrderValue = Number(order.totalOrderValue);
        const advancePaid = Number(order.advancePaid || 0);
        const storedCodAmount = Number(order.codAmount || 0);
        const productSubtotal = Number(order.productSubtotal || order.price || 0);
        
        if (isNaN(totalOrderValue) || isNaN(advancePaid) || isNaN(storedCodAmount) || isNaN(productSubtotal)) {
            return res.status(400).json({ success: false, error: "Payment Calculation Error: One or more payment values are invalid (NaN)" });
        }
        
        let calculatedCodAmount = 0;
        
        if (isCod) {
            calculatedCodAmount = totalOrderValue - advancePaid;
            
            // Validate that the calculation matches the stored expected COD
            if (calculatedCodAmount !== storedCodAmount) {
                return res.status(400).json({ success: false, error: `Payment Calculation Error: Expected COD amount (${calculatedCodAmount}) does not match stored COD amount (${storedCodAmount}).` });
            }
        }
        
        let productDesc = order.productName || "Jersey";
        if (order.category) productDesc += ` - ${order.category.replace("-", " ")}`;
        if (order.size) productDesc += ` - Size ${order.size}`;
        if (order.customization) {
           if (typeof order.customization === 'string') productDesc += ` - Customization: ${order.customization}`;
           else if (order.customization.name) productDesc += ` - Customization: ${order.customization.name} ${order.customization.number || ''}`;
        }
        
        const payload = {
          format: "json",
          data: {
            shipments: [{
              name: formattedName,
              add: order.address,
              pin: order.pincode,
              city: order.city || "",
              state: order.state || "",
              country: "India",
              phone: order.phone,
              order: String(order.orderNumber || orderId),
              payment_mode: isCod ? "COD" : "Prepaid",
              cod_amount: isCod ? calculatedCodAmount : 0,
              products_desc: productDesc,
              quantity: String(order.quantity || 1),
              weight: String(500), 
              shipment_length: 20, shipment_width: 20, shipment_height: 5,
              total_amount: totalOrderValue,
              shipping_mode: effectiveDeliveryType === "FAST" ? "Express" : "Surface"
            }],
            pickup_location: { name: pickupLocation }
          }
        };
        
        const formData = new URLSearchParams(); 
        formData.append("format", "json"); 
        formData.append("data", JSON.stringify(payload.data));
        
        const response = await fetch("https://track.delhivery.com/api/cmu/create.json", {
          method: "POST", headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
        
        const data = await response.json();
        
        if (!data.success || data.error === true || !data.packages || data.packages.length === 0 || !data.packages[0].waybill || data.packages[0].status === "Fail") {
          console.error("[Delhivery API Error] Status:", response.status);
          console.error("[Delhivery API Error] Body:", JSON.stringify(data, null, 2));
          
          let errorMsg = "Failed to create shipment.";
          if (data.packages && data.packages.length > 0 && data.packages[0].remarks && data.packages[0].remarks.length > 0) {
            errorMsg = data.packages[0].remarks.join(" ");
          } else if (typeof data.error === "string") {
            errorMsg = data.error;
          } else if (data.rmk) {
            errorMsg = data.rmk;
          } else if (data.error !== undefined) {
            errorMsg = JSON.stringify(data.error);
          }
          
          errorMsg = String(errorMsg); // Ensure it is always a string
          
          if (errorMsg.includes('ClientWarehouse')) {
            const usedWarehouse = pickupLocation;
            errorMsg = `Delhivery pickup warehouse ('${usedWarehouse}') is not registered or active. Please check the exact warehouse name configured in your Delhivery account.\n\nActual Error: ${errorMsg}`;
          }
          
          return res.status(400).json({ 
             success: false, 
             error: `Delhivery API Error: ${errorMsg}`,
             delhiveryStatus: response.status,
             delhiveryResponse: data
          });
        }
        
        const awb = data.packages[0].waybill;
        
        // Save to DB
        await updateDoc(doc(db, 'orders', orderId), {
          delhiveryAwb: awb,
          delhiveryShipmentId: data.packages[0].client || "",
          delhiveryOrderId: String(order.orderNumber || orderId),
          delhiveryStatus: "Manifested",
          delhiveryTrackingUrl: `https://www.delhivery.com/track/package/${awb}`,
          delhiveryPickupLocation: pickupLocation,
          delhiveryCreatedAt: new Date().toISOString(),
          delhiveryUpdatedAt: new Date().toISOString(),
          // Standard generic shipping fields
          awbNumber: awb,
          shippingProvider: "Delhivery",
          shippingStatus: "Manifested",
          courierName: "Delhivery",
          trackingId: awb,
          trackingUrl: `https://www.delhivery.com/track/package/${awb}`,
          shipmentCreatedAt: new Date().toISOString()
        });
        
        return res.json({ success: true, awb, data });
      }
      if (action === 'label') {
        const response = await fetch(`https://track.delhivery.com/api/p/packing_slip?wbns=${awb}&pdf=true`, { headers: { "Authorization": `Token ${apiKey}` } });
        const data = await response.json(); return res.json(data);
      }

      if (action === 'track') {
        const response = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${awb}`, { headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" } });
        const data = await response.json(); return res.json(data);
      }

      return res.status(400).json({ success: false, error: "Invalid action" });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
