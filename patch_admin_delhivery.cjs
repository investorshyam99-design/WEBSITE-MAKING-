const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const injection = `
  const [isShippingOneDot, setIsShippingOneDot] = useState(false);
  
  const handleDelhiveryShipment = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(\`Are you sure you want to create a OneDot Delivery shipment for Order \${order.orderNumber ? \`#\${order.orderNumber}\` : \`#\${order.id}\`}?\`)) {
      return;
    }
    
    setIsShippingOneDot(true);
    try {
      const productDesc = \`\${order.productName} - Size \${order.size} - Customization: \${order.customization || order.customizationStatus === "YES" ? "YES" : "NO"}\`;
      const orderData = {
         orderNumber: order.orderNumber || order.id,
         fullName: order.fullName || "Guest",
         phone: order.phone,
         address: order.address,
         city: order.city || "Not Provided",
         state: order.state || "Not Provided",
         pincode: order.pincode,
         paymentMode: calc.paymentMode,
         codAmount: calc.codAmount,
         productDesc,
         quantity: order.quantity || 1,
         finalTotal: calc.finalTotalAmount,
         weight: 500
      };

      const response = await fetch("/api/shipping/onedot/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderData })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create shipment");
      }

      const awb = data.awb;
      
      // Update order in Firestore
      const { doc, updateDoc } = require('firebase/firestore');
      const { db } = require('../lib/firebase');
      
      await updateDoc(doc(db, "orders", order.id), {
         awbNumber: awb,
         oneDotShipmentId: awb,
         shippingProvider: "OneDot Delivery",
         shippingStatus: "Manifested",
         courierName: "OneDot Delivery",
         trackingId: awb,
         shipmentCreatedAt: new Date().toISOString()
      });
      
      alert("Success! OneDot Delivery shipment created. AWB: " + awb);
      window.location.reload(); // Refresh to show new state
    } catch (err: any) {
      console.error(err);
      alert("OneDot Delivery shipment creation failed: " + err.message);
    } finally {
      setIsShippingOneDot(false);
    }
  };
`;

file = file.replace('  const handleQikinkFulfillment = async (e: React.MouseEvent) => {', injection + '\n  const handleQikinkFulfillment = async (e: React.MouseEvent) => {');

// We also need to inject the button in the UI
// Find where the Qikink button is
const buttonInjection = `
                {/* OneDot Delivery Integration */}
                {order.awbNumber ? (
                  <div className="mt-4 p-4 rounded-xl border border-[#1E2A44]/20 bg-[#1E2A44]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Shipping Details</p>
                      <p className="text-sm font-semibold text-[#1B1B1B]">OneDot Delivery • AWB: <span className="font-black text-[#1E2A44]">{order.awbNumber}</span></p>
                      <p className="text-xs font-medium text-gray-600 mt-0.5">Status: {order.shippingStatus || "Created"}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <a 
                        href={\`/track?awb=\${order.awbNumber}\`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 sm:flex-none text-center px-4 py-2 bg-white border-2 border-[#1E2A44] text-[#1E2A44] text-xs font-bold rounded-lg hover:bg-[#1E2A44] hover:text-white transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        TRACK
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={handleDelhiveryShipment}
                      disabled={isShippingOneDot}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E2A44] hover:bg-[#2A3B5C] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isShippingOneDot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                      {isShippingOneDot ? "CREATING..." : "SHIP WITH ONEDOT DELIVERY"}
                    </button>
                  </div>
                )}
`;

file = file.replace(/\{\/\* Qikink Fulfillment Action \*\/\}/g, buttonInjection + '\n                {/* Qikink Fulfillment Action */}');

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
