const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const rtoCancelledButtons = `
                <button
                  onClick={() => onUpdateStatus("RTO")}
                  className="w-full py-2.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 hover:bg-amber-700"
                >
                  <RefreshCw className="h-4 w-4" /> Move to RTO
                </button>
                <button
                  onClick={() => onUpdateStatus("Cancelled")}
                  className="w-full py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" /> Cancel Order
                </button>
`;

const manualTrackingForm = `
                {showTrackingForm ? (
                  <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm space-y-3 mb-2">
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                    >
                      <option value="">Select Courier</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="BlueDart">BlueDart</option>
                      <option value="DTDC">DTDC</option>
                      <option value="XpressBees">XpressBees</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="India Post">India Post</option>
                      <option value="Ekart">Ekart</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tracking Number"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowTrackingForm(false)}
                        className="flex-1 py-2 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onUpdateTracking(trackingId, courierName, trackingUrl);
                          window.open(
                            generateWhatsAppLink(
                              order.phone || "",
                              templates.shipped,
                            ),
                            "_blank",
                          );
                          setShowTrackingForm(false);
                        }}
                        className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-1"
                      >
                        <Truck className="h-3 w-3" /> Save & Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTrackingForm(true)}
                    className="w-full py-2.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 border border-blue-200 mb-2"
                  >
                    <Truck className="h-4 w-4" /> {(order.awbNumber || order.delhiveryShipmentId || order.trackingId) ? "Update Tracking" : "Add Tracking"}
                  </button>
                )}
`;

const existingPlacedRegex = /\{activeTab === "placed" && \([\s\S]*?<\/button>\s*<\/>\s*\)}/;

// We need to inject the tracking UI + manual form + the new RTO/Cancelled buttons into `activeTab === "placed"`
// Also inject RTO/Cancelled buttons into `activeTab === "new"`

// Let's modify the file string
// 1. Inject into "new"
code = code.replace(/<Check className="h-4 w-4" \/> Mark Delivered\s*<\/button>/, 
  '<Check className="h-4 w-4" /> Mark Delivered\n                </button>\n' + rtoCancelledButtons);

// 2. Inject into "placed"
const placedReplacement = `{activeTab === "placed" && (
              <>
                {(order.awbNumber || order.delhiveryShipmentId || order.trackingId) ? (
                  <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                    <p className="text-xs font-bold text-green-700 uppercase mb-1">Shipment Created</p>
                    <p className="text-[11px] text-green-600 mb-2 font-mono">AWB: {order.awbNumber || order.delhiveryShipmentId || order.trackingId}</p>
                    <div className="flex gap-2">
                       <a href={order.trackingUrl || \`https://www.delhivery.com/track/package/\${order.awbNumber || order.delhiveryShipmentId || order.trackingId}\`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">Track</a>
                       {(order.awbNumber || order.delhiveryShipmentId) && (
                         <a href={\`/api/delhivery?action=label&awb=\${order.awbNumber || order.delhiveryShipmentId}\`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">View Label</a>
                       )}
                    </div>
                  </div>
                ) : null}
                
                ${manualTrackingForm}
                
                <button
                  onClick={() => onUpdateStatus("Received")}
                  className="w-full py-2.5 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm border border-gray-200 mb-2 hover:bg-gray-200"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" /> Move to New Orders
                </button>
                <button
                  onClick={() => onUpdateStatus("Delivered")}
                  className="w-full py-2.5 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 mb-2"
                >
                  <Check className="h-4 w-4" /> Mark Delivered
                </button>
                ${rtoCancelledButtons}
              </>
            )}`;

code = code.replace(existingPlacedRegex, placedReplacement);

// 3. Fix the "View Label" button in "new" to only show if it's Delhivery
code = code.replace(/<a href=\{`\/api\/delhivery\?action=label&awb=\$\{order\.awbNumber \|\| order\.delhiveryShipmentId \|\| order\.trackingId\}`\} target="_blank" className="flex-1 py-1\.5 bg-white border border-green-300 text-green-700 text-\[10px\] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">View Label<\/a>/g, 
  '{(order.awbNumber || order.delhiveryShipmentId) && (<a href={`/api/delhivery?action=label&awb=${order.awbNumber || order.delhiveryShipmentId}`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">View Label</a>)}');

// Also update the "Add Tracking" button in "new" to say "Update Tracking" if tracking exists.
code = code.replace(/<Truck className="h-4 w-4" \/> Add Tracking/g, '<Truck className="h-4 w-4" /> {(order.awbNumber || order.delhiveryShipmentId || order.trackingId) ? "Update Tracking" : "Add Tracking"}');

fs.writeFileSync('src/components/AdminDashboard.tsx', code, 'utf8');
