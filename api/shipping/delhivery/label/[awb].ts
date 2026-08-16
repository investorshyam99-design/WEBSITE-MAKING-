import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apiKey = process.env.DELHIVERY_API_TOKEN;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "DELHIVERY_API_TOKEN not configured" });
    }

    const awb = req.query.awb;
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
}
