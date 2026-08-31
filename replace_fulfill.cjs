const fs = require('fs');
let file = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldHandleStr = `  const handleFulfillAllConfirm = async () => {
    setShowConfirmFulfill(false);
    setIsFulfillingAll(true);
    setFulfillResults([]);
    
    const results = [];
    for (const order of group.orders) {
      if (order.delhiveryAwb || order.delhiveryShipmentId || order.awbNumber || order.trackingId) {
        results.push({ id: order.orderNumber || order.id, success: false, msg: "Already fulfilled" });
        continue;
      }
      
      try {
        const response = await fetch("/api/delhivery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", orderId: order.id })
        });
        const data = await response.json();
        
        if (!data.success) {
           results.push({ id: order.orderNumber || order.id, success: false, msg: data.error || "Failed" });
        } else {
           const awb = data.awb;
           // update doc
           // We need to import db, doc, updateDoc. 
           // Since AdminCustomerGroupCard is in AdminDashboard, it has access to them if they are imported at the top.
           // Actually, we can just call an onUpdate/refresh? No, we need to do the updateDoc here just like AdminOrderCard does.
           await updateDoc(doc(db, "orders", order.id), {
             awbNumber: awb,
             delhiveryShipmentId: awb,
             shippingProvider: "Delhivery",
             shippingStatus: "Manifested",
             courierName: "Delhivery",
             trackingId: awb,
             trackingUrl: \`https://www.delhivery.com/track/package/\${awb}\`,
             shipmentCreatedAt: new Date().toISOString()
           });
           results.push({ id: order.orderNumber || order.id, success: true, msg: "AWB " + awb });
        }
      } catch (err: any) {
        results.push({ id: order.orderNumber || order.id, success: false, msg: err.message });
      }
    }
    
    setFulfillResults(results);
    setIsFulfillingAll(false);
    
    // Slight delay before reload to let user read if needed, or we just rely on parent refresh?
    // The prompt says "Do not remove either order from the dashboard." but also "if one shipment fails DO NOT stop silently."
    // Let's just not reload window here. We can trigger a refresh via a prop if we want, but since they are real-time or we just leave it.
    // Wait, AdminOrderCard does window.location.reload(). 
    // Let's just show results.
  };`;

const newHandleStr = `  const handleFulfillAllClick = () => {
    // 1. Check for already fulfilled orders
    const unfulfilled = group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId));
    if (unfulfilled.length === 0) {
      alert("All orders in this group are already fulfilled.");
      return;
    }
    
    // 2. Validate shipping details consistency
    const first = unfulfilled[0];
    const basePhone = String(first.phone).replace(/\\D/g, '').slice(-10);
    const baseAddress = String(first.address).toLowerCase().trim();
    const basePincode = String(first.pincode).toLowerCase().trim();
    const baseType = (first.deliveryType && (String(first.deliveryType).toLowerCase() === "fast" || String(first.deliveryType).toLowerCase() === "express")) ? "fast" : "normal";
    
    for (const o of unfulfilled) {
       const p = String(o.phone).replace(/\\D/g, '').slice(-10);
       const a = String(o.address).toLowerCase().trim();
       const pin = String(o.pincode).toLowerCase().trim();
       const t = (o.deliveryType && (String(o.deliveryType).toLowerCase() === "fast" || String(o.deliveryType).toLowerCase() === "express")) ? "fast" : "normal";
       
       if (p !== basePhone || pin !== basePincode) {
           alert("Cannot combine shipments: customer shipping details differ.\\n\\nPlease fulfill them separately.");
           return;
       }
       if (t !== baseType) {
           alert("These orders have different delivery types and cannot be combined into one shipment.\\n\\nPlease fulfill them separately.");
           return;
       }
    }
    
    setShowConfirmFulfill(true);
  };

  const handleFulfillAllConfirm = async () => {
    setShowConfirmFulfill(false);
    setIsFulfillingAll(true);
    setFulfillResults([]);
    
    const unfulfilled = group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId));
    
    if (unfulfilled.length === 0) {
       setIsFulfillingAll(false);
       return;
    }
    
    try {
        const response = await fetch("/api/delhivery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create_combined", orderIds: unfulfilled.map((o: any) => o.id) })
        });
        const data = await response.json();
        
        const results = [];
        if (!data.success) {
           results.push({ id: "Group", success: false, msg: data.error || "Failed" });
        } else {
           const awb = data.awb;
           for (const order of unfulfilled) {
               // Update local UI immediately for responsiveness (real-time listener will also fire)
               results.push({ id: order.orderNumber || order.id, success: true, msg: "AWB " + awb });
           }
        }
        setFulfillResults(results);
    } catch (err: any) {
        setFulfillResults([{ id: "Group", success: false, msg: err.message }]);
    }
    setIsFulfillingAll(false);
  };`;

// replace old handle with new handle
if (content.indexOf(oldHandleStr) !== -1) {
    content = content.replace(oldHandleStr, newHandleStr);
} else {
    throw new Error("Could not find old handleFulfillAllConfirm");
}

// Now replace onClick={() => setShowConfirmFulfill(true)}
const oldOnClickStr = `onClick={() => setShowConfirmFulfill(true)}`;
const newOnClickStr = `onClick={handleFulfillAllClick}`;
content = content.replace(oldOnClickStr, newOnClickStr);

// Now update the Confirmation Modal UI
const oldModalStr = `{showConfirmFulfill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-5">
            <h3 className="font-black text-lg uppercase tracking-wider text-gray-900 mb-1">{group.customerName} — {group.orders.length} ORDERS</h3>
            <div className="space-y-2 my-4 max-h-60 overflow-y-auto">
              {group.orders.map((o: any, idx: number) => {
                 const calc = getOrderCalculations(o);
                 return (
                   <div key={o.id} className="text-sm border-b border-gray-100 pb-2">
                     <span className="font-bold text-gray-800">{idx + 1}. #{o.orderNumber || o.id}</span> — {o.productName} — Size {o.size} — COD ₹{(calc.codAmount || 0).toLocaleString("en-IN")}
                   </div>
                 );
              })}
            </div>
            <p className="font-black text-indigo-700 text-right mb-4">Total COD: ₹{totalCod.toLocaleString("en-IN")}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmFulfill(false)}
                className="px-4 py-2 text-gray-600 font-bold uppercase text-xs hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleFulfillAllConfirm}
                className="px-4 py-2 bg-indigo-600 text-white font-bold uppercase text-xs rounded hover:bg-indigo-700 shadow-sm"
              >
                Confirm Fulfill All
              </button>
            </div>
          </div>
        </div>
      )}`;

const newModalStr = `{showConfirmFulfill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-5">
            <h3 className="font-black text-lg uppercase tracking-wider text-gray-900 mb-1">{group.customerName}</h3>
            <div className="space-y-2 my-4 max-h-60 overflow-y-auto">
              {group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).map((o: any, idx: number) => {
                 const calc = getOrderCalculations(o);
                 return (
                   <div key={o.id} className="text-sm border-b border-gray-100 pb-2">
                     <span className="font-bold text-gray-800">{idx + 1}. #{o.orderNumber || o.id}</span> — {o.productName} — Size {o.size} {o.customization ? (typeof o.customization === 'string' ? \`— Cust: \${o.customization}\` : \`— Cust: \${o.customization.name} \${o.customization.number || ''}\`) : ''} — COD ₹{(calc.codAmount || 0).toLocaleString("en-IN")}
                   </div>
                 );
              })}
            </div>
            <div className="text-right mb-4 text-sm font-bold space-y-1">
              <p className="text-gray-600 uppercase">Total Items: {group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).length}</p>
              <p className="text-gray-600 uppercase">Total Order Value: ₹{group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).reduce((sum: number, o: any) => sum + (getOrderCalculations(o).finalTotalAmount || 0), 0).toLocaleString("en-IN")}</p>
              <p className="text-gray-600 uppercase">Total Paid/Advance: ₹{group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).reduce((sum: number, o: any) => sum + (getOrderCalculations(o).amountPaid || 0), 0).toLocaleString("en-IN")}</p>
              <p className="font-black text-indigo-700 text-lg uppercase">Total COD: ₹{group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).reduce((sum: number, o: any) => sum + (getOrderCalculations(o).codAmount || 0), 0).toLocaleString("en-IN")}</p>
              <p className="text-gray-500 uppercase mt-2">Delivery Type: {(group.orders.find((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId))?.deliveryType?.toLowerCase() === 'fast' || group.orders.find((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId))?.deliveryType?.toLowerCase() === 'express') ? 'FAST' : 'NORMAL'}</p>
              <p className="text-indigo-600 mt-2">ONE SHIPMENT <br/> ONE AWB</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmFulfill(false)}
                className="px-4 py-2 text-gray-600 font-bold uppercase text-xs hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleFulfillAllConfirm}
                className="px-4 py-2 bg-indigo-600 text-white font-bold uppercase text-xs rounded hover:bg-indigo-700 shadow-sm"
              >
                Confirm Fulfill All
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(oldModalStr, newModalStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Update UI complete');
