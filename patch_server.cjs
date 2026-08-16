const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const injection = `
  // --------------------------------------------------
  // ONEDOT DELIVERY (DELHIVERY) INTEGRATION
  // --------------------------------------------------

  app.post("/api/shipping/onedot/create", async (req, res) => {
    try {
      const apiKey = process.env.DELHIVERY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "Delhivery API Key not configured" });
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
            shipping_mode: "Surface"
          }
        ],
        pickup_location: {
          name: process.env.DELHIVERY_PICKUP_LOCATION || "Primary"
        }
      };

      const formData = new URLSearchParams();
      formData.append("format", "json");
      formData.append("data", JSON.stringify(payload));

      const response = await fetch("https://track.delhivery.com/api/cmu/create.json", {
        method: "POST",
        headers: {
          "Authorization": \`Token \${apiKey}\`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });

      const data = await response.json();

      if (!data.success && (!data.packages || data.packages.length === 0 || !data.packages[0].waybill)) {
        return res.status(400).json({ success: false, error: data.error || data.rmk || "Failed to create shipment via OneDot Delivery API" });
      }

      const waybill = data.packages[0].waybill;
      return res.json({ success: true, awb: waybill, data });
    } catch (e) {
      console.error("[OneDot Delivery] Create Shipment Error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/shipping/onedot/label/:awb", async (req, res) => {
    try {
      const apiKey = process.env.DELHIVERY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "Delhivery API Key not configured" });
      }

      const { awb } = req.params;
      const response = await fetch(\`https://track.delhivery.com/api/p/packagelabels?wbns=\${awb}\`, {
        method: "GET",
        headers: { "Authorization": \`Token \${apiKey}\` }
      });

      const data = await response.json();
      return res.json(data);
    } catch (e) {
      console.error("[OneDot Delivery] Label Error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/shipping/onedot/track/:awb", async (req, res) => {
    try {
      const apiKey = process.env.DELHIVERY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "Delhivery API Key not configured" });
      }

      const { awb } = req.params;
      const response = await fetch(\`https://track.delhivery.com/api/v1/packages/json/?waybill=\${awb}\`, {
        method: "GET",
        headers: {
          "Authorization": \`Token \${apiKey}\`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      return res.json(data);
    } catch (e) {
      console.error("[OneDot Delivery] Track Error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

`;

file = file.replace('  // Streamable Hero Video API to handle dynamic signature expirations', injection + '  // Streamable Hero Video API to handle dynamic signature expirations');
fs.writeFileSync('server.ts', file);
