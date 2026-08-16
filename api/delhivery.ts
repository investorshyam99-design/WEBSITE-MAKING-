import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      const data: any = await response.json();
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
      const origin = process.env.DELHIVERY_PICKUP_PINCODE || process.env.DELHIVERY_ORIGIN_PINCODE;
      if (!dest) return res.status(400).json({ success: false, error: "Destination pincode is required" });
      let normalDays = 5, expressDays = 3, expressAvailable = true;
      if (origin) {
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
      }
      return res.json({ success: true, tat: { normal: { days: normalDays, mode: "Surface" }, express: { days: expressDays, mode: "Express", available: expressAvailable } } });
    }

    if (action === 'create') {
      const payload = {
        shipments: [{
          name: orderData.fullName, add: orderData.address, pin: orderData.pincode, city: orderData.city,
          state: orderData.state, country: "India", phone: orderData.phone, order: String(orderData.orderNumber),
          payment_mode: orderData.paymentMode === "full" ? "Pre-paid" : "COD",
          cod_amount: orderData.paymentMode === "full" ? 0 : orderData.codAmount,
          products_desc: orderData.productDesc, quantity: String(orderData.quantity || 1),
          weight: String(orderData.weight || 500), total_amount: orderData.finalTotal, shipping_mode: orderData.shippingMode || "Surface"
        }],
        pickup_location: { name: process.env.DELHIVERY_PICKUP_LOCATION || "Primary" }
      };
      const formData = new URLSearchParams();
      formData.append("format", "json"); formData.append("data", JSON.stringify(payload));
      const response = await fetch("https://track.delhivery.com/api/cmu/create.json", {
        method: "POST", headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      const data: any = await response.json();
      if (!data.success && (!data.packages || data.packages.length === 0 || !data.packages[0].waybill)) {
        return res.status(400).json({ success: false, error: data.error || data.rmk || "Failed to create shipment" });
      }
      return res.json({ success: true, awb: data.packages[0].waybill, data });
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
}
