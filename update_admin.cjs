const fs = require('fs');

const file = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need to inject AdminCustomerGroupCard before AdminOrderCard.
const orderCardIdx = content.indexOf('function AdminOrderCard({');
if (orderCardIdx === -1) throw new Error("Could not find AdminOrderCard");

const groupCardComponent = `
function AdminCustomerGroupCard({
  group,
  activeTab,
  onUpdateStatus,
  onDelete,
  onUpdateTracking,
  onUpdatePrice,
  onUpdateCustomizationStatus,
  onEditPayment,
}: {
  group: any;
  activeTab: string;
  onUpdateStatus: (orderId: string, s: string) => void;
  onDelete: (orderId: string) => void;
  onUpdateTracking: (orderId: string, t: string, c: string, url: string) => void;
  onUpdatePrice: (orderId: string, p: number) => void;
  onUpdateCustomizationStatus: (orderId: string, status: string) => void;
  onEditPayment: (order: any, calc: any) => void;
}) {
  const [isFulfillingAll, setIsFulfillingAll] = useState(false);
  const [isMovingAll, setIsMovingAll] = useState(false);
  const [showConfirmFulfill, setShowConfirmFulfill] = useState(false);
  const [fulfillResults, setFulfillResults] = useState<{id: string, success: boolean, msg: string}[]>([]);
  const [moveResults, setMoveResults] = useState<{id: string, success: boolean, msg: string}[]>([]);

  // Calculate totals
  let totalOrderValue = 0;
  let totalPaid = 0;
  let totalCod = 0;

  group.orders.forEach((o: any) => {
    const calc = getOrderCalculations(o);
    totalOrderValue += (calc.finalTotalAmount || 0);
    totalPaid += (calc.amountPaid || 0);
    totalCod += (calc.codAmount || 0);
  });

  const handleFulfillAllConfirm = async () => {
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
  };

  const handleMoveAllToPlaced = async () => {
    setIsMovingAll(true);
    setMoveResults([]);
    const results = [];
    for (const order of group.orders) {
      try {
        onUpdateStatus(order.id, "Order Placed");
        results.push({ id: order.orderNumber || order.id, success: true, msg: "Moved successfully" });
      } catch (err: any) {
        results.push({ id: order.orderNumber || order.id, success: false, msg: err.message });
      }
    }
    setMoveResults(results);
    setIsMovingAll(false);
  };

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Group Header */}
      <div className="bg-[#1E2A44] p-4 text-white">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-black text-lg tracking-wider uppercase">{group.customerName}</h3>
            <p className="text-xs text-blue-200 font-bold tracking-widest">{group.orders.length} ORDER{group.orders.length !== 1 ? 'S' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200 uppercase font-bold tracking-widest">Total Order Value: <span className="text-white">₹{totalOrderValue.toLocaleString("en-IN")}</span></p>
            <p className="text-xs text-blue-200 uppercase font-bold tracking-widest">Total Paid: <span className="text-white">₹{totalPaid.toLocaleString("en-IN")}</span></p>
            <p className="text-xs text-blue-200 uppercase font-bold tracking-widest">Total COD: <span className="text-white">₹{totalCod.toLocaleString("en-IN")}</span></p>
          </div>
        </div>

        {activeTab === "new" && group.orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={() => setShowConfirmFulfill(true)}
              disabled={isFulfillingAll}
              className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isFulfillingAll ? "Processing..." : "Fulfill With Delhivery — All Orders"}
            </button>
            <button
              onClick={handleMoveAllToPlaced}
              disabled={isMovingAll}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isMovingAll ? "Moving..." : "Move All Orders To Order Placed"}
            </button>
          </div>
        )}
      </div>
      
      {/* Group Results */}
      {(fulfillResults.length > 0 || moveResults.length > 0) && (
        <div className="p-3 bg-gray-50 border-b border-gray-100 text-xs font-mono space-y-1">
           {fulfillResults.map((r, idx) => (
             <div key={"f"+idx} className={r.success ? "text-green-700" : "text-red-700"}>
               Order #{r.id} — {r.success ? "SUCCESS" : "FAILED"} — {r.msg}
             </div>
           ))}
           {moveResults.map((r, idx) => (
             <div key={"m"+idx} className={r.success ? "text-green-700" : "text-red-700"}>
               Order #{r.id} — {r.success ? "SUCCESS" : "FAILED"} — {r.msg}
             </div>
           ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmFulfill && (
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
      )}

      {/* Individual Orders */}
      <div className="divide-y divide-gray-100">
        {group.orders.map((order: any) => (
          <div key={order.id} className="p-4 bg-gray-50/30">
            <AdminOrderCard
              order={order}
              activeTab={activeTab}
              onUpdateStatus={(s) => onUpdateStatus(order.id, s)}
              onDelete={() => onDelete(order.id)}
              onUpdateTracking={(t, c, url) => onUpdateTracking(order.id, t, c, url)}
              onUpdatePrice={(p) => onUpdatePrice(order.id, p)}
              onUpdateCustomizationStatus={(s) => onUpdateCustomizationStatus(order.id, s)}
              onEditPayment={onEditPayment}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

`;

content = content.slice(0, orderCardIdx) + groupCardComponent + content.slice(orderCardIdx);

// Now update the render block
// Replace this block:
/*
        ) : (
          displayOrders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={order}
...
*/

const searchStr = `        ) : (
          displayOrders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              onUpdateStatus={(s) => handleUpdateStatus(order.id, s)}
              onDelete={() => handleDelete(order.id)}
              onUpdateTracking={(t, c) => handleUpdateTracking(order.id, t, c)}
              onUpdatePrice={(p) => handleUpdatePrice(order.id, p)}
              onUpdateCustomizationStatus={(s) => handleUpdateCustomizationStatus(order.id, s)}
              onEditPayment={(order, calc) => handleEditPayment(order, calc)}
            />
          ))
        )}
      </div>`;

const groupedOrdersLogic = `
  const groupedOrders = useMemo(() => {
    const groups = new Map<string, Order[]>();
    
    displayOrders.forEach(order => {
      let groupId = "";
      if (order.phone) {
         let p = order.phone.replace(/\\D/g, "");
         if (p.length > 10) p = p.slice(-10);
         groupId = "phone_" + p;
      } else if (order.userId && order.userId !== "guest") {
         groupId = "user_" + order.userId;
      } else if (order.fullName) {
         groupId = "name_" + order.fullName.toLowerCase().trim();
      } else {
         groupId = "order_" + order.id;
      }
      
      if (!groups.has(groupId)) {
         groups.set(groupId, []);
      }
      groups.get(groupId)!.push(order);
    });
    
    return Array.from(groups.entries()).map(([id, orders]) => ({
      id,
      customerName: orders[0].fullName || "Unknown Customer",
      phone: orders[0].phone || "",
      orders
    }));
  }, [displayOrders]);
`;

// Insert the groupedOrders logic right before the return statement inside AdminOrdersDashboard
const returnStr = `  return (
    <div className="bg-gray-50 min-h-screen pb-20">`;
if (content.indexOf(returnStr) === -1) throw new Error("Could not find return statement");
content = content.replace(returnStr, groupedOrdersLogic + '\n' + returnStr);


const newRenderBlock = `        ) : (
          groupedOrders.map((group) => (
            <AdminCustomerGroupCard
              key={group.id}
              group={group}
              activeTab={activeTab}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
              onUpdateTracking={handleUpdateTracking}
              onUpdatePrice={handleUpdatePrice}
              onUpdateCustomizationStatus={handleUpdateCustomizationStatus}
              onEditPayment={handleEditPayment}
            />
          ))
        )}
      </div>`;

if (content.indexOf(searchStr) === -1) {
  // Let's try flexible search
  const regex = /\)\s*:\s*\(\s*displayOrders\.map\(\(order\) => \([\s\S]*?<\/div>/;
  if (!regex.test(content)) {
     console.log("Could not find map block.");
     console.log(content.slice(content.indexOf('displayOrders.map')-50, content.indexOf('displayOrders.map')+300));
  } else {
     content = content.replace(regex, ') : (\n          groupedOrders.map((group) => (\n            <AdminCustomerGroupCard\n              key={group.id}\n              group={group}\n              activeTab={activeTab}\n              onUpdateStatus={handleUpdateStatus}\n              onDelete={handleDelete}\n              onUpdateTracking={handleUpdateTracking}\n              onUpdatePrice={handleUpdatePrice}\n              onUpdateCustomizationStatus={handleUpdateCustomizationStatus}\n              onEditPayment={handleEditPayment}\n            />\n          ))\n        )}\n      </div>');
  }
} else {
  content = content.replace(searchStr, newRenderBlock);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Update complete');
