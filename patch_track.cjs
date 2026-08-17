const fs = require('fs');
let code = fs.readFileSync('src/pages/TrackOrderPage.tsx', 'utf8');

const search = `      const res = await fetch(\`/api/shipping/onedot/track/\${awbToTrack}\`);
      const data = await res.json();
      
      if (data && data.Error) {
         throw new Error(data.Error || "Tracking information not found.");
      }
      
      if (data && data.ShipmentData && data.ShipmentData.length > 0) {
         setTrackingData(data.ShipmentData[0].Shipment);
      } else {
         // fallback fake data for preview if API fails but no hard error
         if (!data.success && data.error) throw new Error(data.error);
         throw new Error("No tracking information available for this ID.");
      }`;

const replace = `      const res = await fetch(\`/api/delhivery\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "track", awb: awbToTrack })
      });
      const data = await res.json();
      
      if (data && data.Error) {
         throw new Error(data.Error || "Tracking information not found.");
      }
      
      if (data && data.ShipmentData && data.ShipmentData.length > 0) {
         setTrackingData(data.ShipmentData[0].Shipment);
      } else {
         if (!data.success && data.error) throw new Error(data.error);
         throw new Error("No tracking information available for this ID.");
      }`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/pages/TrackOrderPage.tsx', code);
  console.log("Patched TrackOrderPage.tsx fetch endpoint");
} else {
  console.log("Search string not found!");
}
