const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const search = `            {activeTab === "new" && (
              <>
                <button
                  onClick={handleDelhiveryShipment}
                  disabled={isShippingDelhivery}
                  className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 disabled:opacity-50"
                >
                  <Package className="h-4 w-4" /> {isShippingDelhivery ? "Manifesting..." : "Fulfill with Delhivery"}
                </button>`;

const replace = `            {activeTab === "new" && (
              <>
                {(order.awbNumber || order.delhiveryShipmentId || order.trackingId) ? (
                  <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                    <p className="text-xs font-bold text-green-700 uppercase mb-1">Shipment Created</p>
                    <p className="text-[11px] text-green-600 mb-2 font-mono">AWB: {order.awbNumber || order.delhiveryShipmentId || order.trackingId}</p>
                    <div className="flex gap-2">
                       <a href={order.trackingUrl || \`https://www.delhivery.com/track/package/\${order.awbNumber || order.delhiveryShipmentId || order.trackingId}\`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">Track</a>
                       <a href={\`/api/delhivery?action=label&awb=\${order.awbNumber || order.delhiveryShipmentId || order.trackingId}\`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">View Label</a>
                    </div>
                  </div>
                ) : (
                <button
                  onClick={handleDelhiveryShipment}
                  disabled={isShippingDelhivery}
                  className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 disabled:opacity-50"
                >
                  <Package className="h-4 w-4" /> {isShippingDelhivery ? "Manifesting..." : "Fulfill with Delhivery"}
                </button>
                )}`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('patched admin buttons');
