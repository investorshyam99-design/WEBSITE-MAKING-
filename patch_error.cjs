const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `        const data = await response.json();
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
        }`;

const replace = `        const data = await response.json();
        if (!data.success && (!data.packages || data.packages.length === 0 || !data.packages[0].waybill || data.packages[0].status === "Fail")) {
          console.error("[Delhivery API Error] Status:", response.status);
          console.error("[Delhivery API Error] Body:", JSON.stringify(data, null, 2));
          
          let errorMsg = "Failed to create shipment.";
          if (data.packages && data.packages.length > 0 && data.packages[0].remarks && data.packages[0].remarks.length > 0) {
            errorMsg = data.packages[0].remarks.join(" ");
          } else if (typeof data.error === "string") {
            errorMsg = data.error;
          } else if (data.rmk) {
            errorMsg = data.rmk;
          } else if (data.error) {
            errorMsg = JSON.stringify(data.error);
          }
          return res.status(400).json({ 
            success: false, 
            error: errorMsg,
            delhiveryStatus: response.status,
            delhiveryResponse: data
          });
        }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('server.ts', code);
    console.log('patched error handler');
} else {
    console.log('could not find error handler');
}
