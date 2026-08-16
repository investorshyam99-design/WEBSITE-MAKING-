const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const search = `        const data = await response.json();
        if (!data.success && (!data.packages || data.packages.length === 0 || !data.packages[0].waybill)) {
          return res.status(400).json({ success: false, error: data.error || data.rmk || "Failed to create shipment" });
        }
        return res.json({ success: true, awb: data.packages[0].waybill, data });`;

const replace = `        const data = await response.json();
        if (!data.success && (!data.packages || data.packages.length === 0 || !data.packages[0].waybill)) {
          console.error("[Delhivery API Error] Status:", response.status);
          console.error("[Delhivery API Error] Body:", JSON.stringify(data, null, 2));
          let errorMsg = "Failed to create shipment.";
          if (typeof data.error === "string") {
            errorMsg = data.error;
          } else if (data.error) {
            errorMsg = JSON.stringify(data.error);
          } else if (data.rmk) {
            errorMsg = data.rmk;
          }
          return res.status(400).json({ success: false, error: errorMsg });
        }
        return res.json({ success: true, awb: data.packages[0].waybill, data });`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
console.log('patched server.ts delhivery');
