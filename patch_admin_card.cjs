const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexDelivery = /<p className="text-gray-400 font-bold uppercase tracking-wider mb-1">\s*Tracking & Customization\s*<\/p>/;
const replacementDelivery = `<p className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                Delivery & Tracking
              </p>
              <div className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col gap-2 text-xs text-gray-700 font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">Pincode:</span>
                  <span className="text-[#1B1B1B] font-bold">{order.deliveryPincode || order.pincode || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">Location:</span>
                  <span className="text-[#1B1B1B] font-bold text-right">{order.deliveryCity || order.city || ""}, {order.deliveryDistrict || ""}, {order.deliveryState || order.state || ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">Method:</span>
                  <span className="text-[#1B1B1B] font-bold">{order.deliveryMethod || "NORMAL"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">Expected Delivery:</span>
                  <span className="text-[#1B1B1B] font-bold">{order.expectedDeliveryStart ? new Date(order.expectedDeliveryStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' – ' + new Date(order.expectedDeliveryEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">Dispatch:</span>
                  <span className="text-[#1B1B1B] font-bold">{order.dispatchDate ? new Date(order.dispatchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">Courier:</span>
                  <span className="text-[#1B1B1B] font-bold">{order.courierName || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase">AWB:</span>
                  <span className="text-[#1B1B1B] font-bold">{order.awbNumber || order.trackingId || "N/A"}</span>
                </div>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 mt-4">
                Update Tracking
              </p>`;

file = file.replace(regexDelivery, replacementDelivery);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
