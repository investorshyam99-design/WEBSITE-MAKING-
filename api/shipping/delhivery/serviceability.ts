import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
}
