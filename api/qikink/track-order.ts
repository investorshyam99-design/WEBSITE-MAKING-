import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { trackingId } = req.body;
    if (!trackingId) {
      return res.status(400).json({ error: "No tracking ID provided" });
    }

    const apiKey = process.env.QIKINK_API_KEY || "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

    const trackPayload = {
      apikey: apiKey,
      order_id: trackingId
    };

    const qikinkRes = await fetch("https://qikink.com/index.php/api/api/order_status/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(trackPayload)
    });

    const qikinkData = await qikinkRes.json();
    res.json(qikinkData);
  } catch (error: any) {
    console.error("Qikink track error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch tracking details" });
  }
}
