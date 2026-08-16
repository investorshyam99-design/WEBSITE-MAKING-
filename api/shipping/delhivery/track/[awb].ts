import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apiKey = process.env.DELHIVERY_API_TOKEN;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "DELHIVERY_API_TOKEN not configured" });
    }

    const awb = req.query.awb;
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
}
