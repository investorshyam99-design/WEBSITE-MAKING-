import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // Use Delhivery invoice/charges API to fetch exact delivery Zone for TAT calculation
    if (origin) {
      try {
        const zoneRes = await fetch(`https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${dest}&o_pin=${origin}&cgm=500`, {
          headers: { "Authorization": `Token ${apiKey}` }
        });
        
        if (zoneRes.ok) {
          const zoneData = await zoneRes.json();
          if (zoneData && zoneData.length > 0 && zoneData[0].zone) {
            const zone = String(zoneData[0].zone).toUpperCase();
            
            if (zone.startsWith("A")) {
              normalDays = 2; expressDays = 1;
            } else if (zone.startsWith("B")) {
              normalDays = 3; expressDays = 2;
            } else if (zone.startsWith("C")) {
              normalDays = 4; expressDays = 2;
            } else if (zone.startsWith("D")) {
              normalDays = 5; expressDays = 3;
            } else if (zone.startsWith("E")) {
              normalDays = 7; expressDays = 5;
              expressAvailable = false; // Usually express to Zone E is prohibitively expensive or unavailable
            }
          }
        }
      } catch (e) {
        console.error("TAT fetch error", e);
      }
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
}
