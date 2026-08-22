const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Change tracking button logic
  const oldTracking = `{order.trackingId && order.trackingUrl && (
              <a 
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border-2 border-[#1E2A44] hover:bg-[#1E2A44] hover:text-white text-[#1E2A44] text-center text-sm font-bold rounded-lg transition-colors w-full block whitespace-nowrap"
              >
                Track Order
              </a>
            )}
            {order.trackingId && !order.trackingUrl && (
              <a 
                href={\`https://shiprocket.co/tracking/\${order.trackingId}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border-2 border-[#1E2A44] hover:bg-[#1E2A44] hover:text-white text-[#1E2A44] text-center text-sm font-bold rounded-lg transition-colors w-full block whitespace-nowrap"
              >
                Track Order
              </a>
            )}`;

  const newTracking = `{(order.trackingId || order.delhiveryAwb) && (order.trackingUrl || order.delhiveryTrackingUrl) && (
              <a 
                href={order.trackingUrl || order.delhiveryTrackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border-2 border-[#1E2A44] hover:bg-[#1E2A44] hover:text-white text-[#1E2A44] text-center text-sm font-bold rounded-lg transition-colors w-full block whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" /> Track Order
              </a>
            )}
            {(order.trackingId || order.delhiveryAwb) && !(order.trackingUrl || order.delhiveryTrackingUrl) && (
              <a 
                href={order.courierName === "Delhivery" || order.delhiveryAwb ? \`https://www.delhivery.com/track/package/\${order.trackingId || order.delhiveryAwb}\` : \`https://shiprocket.co/tracking/\${order.trackingId}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border-2 border-[#1E2A44] hover:bg-[#1E2A44] hover:text-white text-[#1E2A44] text-center text-sm font-bold rounded-lg transition-colors w-full block whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" /> Track Order
              </a>
            )}`;

  if (content.includes(oldTracking)) {
      content = content.replace(oldTracking, newTracking);
      // We also need to import Truck if not imported
      if (!content.includes('Truck,')) {
        content = content.replace('MapPin,', 'MapPin, Truck,');
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched tracking in ${filePath}`);
  } else {
      console.log(`Could not find old tracking in ${filePath}`);
  }
}

patchFile('src/pages/AccountPage.tsx');
