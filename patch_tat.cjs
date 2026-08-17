const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `      if (action === 'tat') {
        const origin = process.env.DELHIVERY_PICKUP_PINCODE || process.env.DELHIVERY_ORIGIN_PINCODE;
        if (!dest) return res.status(400).json({ success: false, error: "Destination pincode is required" });
        if (!origin) {
          return res.status(400).json({ success: false, error: "DELHIVERY_PICKUP_PINCODE not configured." });
        }
        
        let normalDays = 5, expressDays = 3, expressAvailable = true;
        const zoneRes = await fetch(\`https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=\${dest}&o_pin=\${origin}&cgm=500\`, {
          headers: { "Authorization": \`Token \${apiKey}\` }
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
            return res.json({ success: true, tat: { normal: { days: normalDays, mode: "Surface" }, express: { days: expressDays, mode: "Express", available: expressAvailable } } });
          }
        }
        return res.status(400).json({ success: false, error: "Failed to fetch TAT from Delhivery" });
      }`;

const replace = `      if (action === 'tat') {
        const origin = process.env.DELHIVERY_PICKUP_PINCODE || "410206";
        if (!dest) return res.status(400).json({ success: false, error: "Destination pincode is required" });
        
        let normalDays = 5, expressDays = 3, expressAvailable = true;
        
        // 1. Check Serviceability API first
        const servRes = await fetch(\`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=\${dest}\`, {
          headers: { "Authorization": \`Token \${apiKey}\` }
        });
        if (servRes.ok) {
          const servData: any = await servRes.json();
          if (servData?.delivery_codes?.length > 0) {
            const pinInfo = servData.delivery_codes[0].postal_code;
            if (pinInfo.pre_paid === "N" && pinInfo.cod === "N") {
              return res.json({ success: true, serviceable: false });
            }
          } else {
             // invalid pincode
             return res.json({ success: true, serviceable: false });
          }
        } else {
          return res.status(400).json({ success: false, error: "Delhivery Serviceability check failed" });
        }

        // 2. Zone lookup for fallback TAT
        const zoneRes = await fetch(\`https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=\${dest}&o_pin=\${origin}&cgm=500\`, {
          headers: { "Authorization": \`Token \${apiKey}\` }
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
        
        return res.json({ 
          success: true, 
          serviceable: true,
          tat: { 
            normal: { days: normalDays, mode: "Surface" }, 
            express: { days: expressDays, mode: "Express", available: expressAvailable } 
          } 
        });
      }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('server.ts', code);
    console.log('patched tat handler');
} else {
    console.log('could not find tat handler');
}
