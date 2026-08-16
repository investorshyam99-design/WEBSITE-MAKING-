const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const regexTracking = /{order\.trackingId && \([\s\S]*?<\/div>\s*\)}/;
const replacementTracking = `{order.trackingId && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                <p className="font-bold text-[#1E2A44] flex items-center gap-2 tracking-wider uppercase"><Truck className="h-4 w-4" /> Tracking Information</p>
                {order.courierName && <p><strong className="font-semibold">Courier:</strong> {order.courierName}</p>}
                <p><strong className="font-semibold">Tracking ID:</strong> {order.trackingId}</p>
              </div>
            )}`;
file = file.replace(regexTracking, replacementTracking);

const regexTrackBtn = /\{order\.awbNumber && \(\s*<a[\s\S]*?<\/a>\s*\)\}/;
const replacementTrackBtn = `{order.trackingId && order.trackingUrl && (
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
// wait, order doesn't have `awbNumber` actually in the interface, it was just there.
file = file.replace(regexTrackBtn, replacementTrackBtn);

// But let's check if awbNumber exists in the file, if it doesn't we just add the tracking button below "View Order"
fs.writeFileSync('src/pages/AccountPage.tsx', file);
