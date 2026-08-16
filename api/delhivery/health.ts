import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
}
