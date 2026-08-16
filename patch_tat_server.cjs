const fs = require('fs');

function patchTat(code) {
  const search = `      if (action === 'tat') {
      const origin = process.env.DELHIVERY_PICKUP_PINCODE || process.env.DELHIVERY_ORIGIN_PINCODE;
      if (!dest) return res.status(400).json({ success: false, error: "Destination pincode is required" });
      let normalDays = 5, expressDays = 3, expressAvailable = true;
      if (origin) {
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
      }
      return res.json({ success: true, tat: { normal: { days: normalDays, mode: "Surface" }, express: { days: expressDays, mode: "Express", available: expressAvailable } } });
    }`;

  const replace = `      if (action === 'tat') {
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
    
    // Fallback for slightly different spacing
    let search2 = search.replace(/any =/g, "= ");
    return code.replace(search, replace).replace(search.replace(/any: /g, ''), replace);
}

let apiCode = fs.readFileSync('api/delhivery.ts', 'utf8');
apiCode = patchTat(apiCode);
// Let's do regex replace manually if it doesn't match
apiCode = apiCode.replace(/if \(action === 'tat'\) \{[\s\S]*?return res\.json\(\{ success: true, tat:[\s\S]*?\}\);\n    \}/, `if (action === 'tat') {
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
    }`);
fs.writeFileSync('api/delhivery.ts', apiCode);

let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(/if \(action === 'tat'\) \{[\s\S]*?return res\.json\(\{ success: true, tat:[\s\S]*?\}\);\n      \}/, `if (action === 'tat') {
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
      }`);
fs.writeFileSync('server.ts', serverCode);

console.log('patched TAT backend');
