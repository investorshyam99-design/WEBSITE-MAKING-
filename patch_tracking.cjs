const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const regexTrackingBtn = /\{order\.trackingId && !order\.trackingUrl && \([\s\S]*?<\/a>\n\s*\}\)/;
const replacementTrackingBtn = `{order.trackingId && !order.trackingUrl && (
              <a 
                href={\`https://shiprocket.co/tracking/\${order.trackingId}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border-2 border-[#1E2A44] hover:bg-[#1E2A44] hover:text-white text-[#1E2A44] text-center text-sm font-bold rounded-lg transition-colors w-full block whitespace-nowrap"
              >
                Track Order
              </a>
            )}
            {!order.trackingId && (
              <p className="text-[10px] text-gray-400 font-medium text-center mt-1 w-full italic">
                Tracking will be available after dispatch.
              </p>
            )}`;

file = file.replace(regexTrackingBtn, replacementTrackingBtn);
fs.writeFileSync('src/pages/AccountPage.tsx', file);
