import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

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
}
