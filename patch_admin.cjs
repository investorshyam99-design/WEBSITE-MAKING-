const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

file = file.replace(/customization\?: string;/, `customization?: string;
  customizationStatus?: string;
  customizationDeduction?: number;
  originalPrice?: number;
  advancePaid?: number;
  finalTotal?: number;`);

file = file.replace(/const handleUpdatePrice = async [\s\S]*?refreshOrders\(\);\n      \} catch \(e\) \{\n        console\.error\(e\);\n        alert\("Failed to update price"\);\n      \}\n    \}\n  \};/, 
`const handleUpdatePrice = async (orderId: string, currentPrice: number) => {
    const newPrice = prompt(
      "Enter the new correct price (excluding COD charges):",
      currentPrice.toString(),
    );
    if (newPrice && !isNaN(Number(newPrice))) {
      try {
        const order = orders.find(o => o.id === orderId);
        const finalPrice = Number(newPrice);
        const updateData: any = {
          price: finalPrice,
          finalTotal: finalPrice,
        };
        if (order && (order.paymentMode !== "full" || order.remainingCodAmount !== undefined)) {
          const advance = order.advancePaid || (order.paymentMode === "partial" ? 50 : 0);
          updateData.remainingCodAmount = Math.max(0, finalPrice - advance);
        }
        await updateDoc(doc(db, "orders", orderId), updateData);
        refreshOrders();
      } catch (e) {
        console.error(e);
        alert("Failed to update price");
      }
    }
  };

  const handleUpdateCustomizationStatus = async (orderId: string, status: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const updateData: any = { customizationStatus: status };
      
      if (status === "NO") {
        const ded = prompt("Customization cannot be fulfilled. Enter the exact deduction amount:", (order.customizationDeduction || 0).toString());
        if (ded && !isNaN(Number(ded))) {
          const deduction = Number(ded);
          updateData.customizationDeduction = deduction;
          
          const basePrice = order.originalPrice || order.price || 0;
          const newPrice = basePrice - deduction;
          updateData.price = newPrice;
          updateData.finalTotal = newPrice;
          
          if (order.paymentMode !== "full" || order.remainingCodAmount !== undefined) {
             const advance = order.advancePaid || (order.paymentMode === "partial" ? 50 : 0);
             updateData.remainingCodAmount = Math.max(0, newPrice - advance);
          }
        } else {
          return;
        }
      } else {
        if (order.customizationDeduction) {
          const newPrice = (order.price || 0) + order.customizationDeduction;
          updateData.price = newPrice;
          updateData.finalTotal = newPrice;
          updateData.customizationDeduction = 0;
          
          if (order.paymentMode !== "full" || order.remainingCodAmount !== undefined) {
             const advance = order.advancePaid || (order.paymentMode === "partial" ? 50 : 0);
             updateData.remainingCodAmount = Math.max(0, newPrice - advance);
          }
        }
      }

      await updateDoc(doc(db, "orders", orderId), updateData);
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update customization status");
    }
  };`);

// Also update the AdminOrderCard props and JSX
file = file.replace(/onUpdatePrice: \(p: number\) => void;\n\}\) \{/, `onUpdatePrice: (p: number) => void;
  onUpdateCustomizationStatus: (status: string) => void;
}) {`);

file = file.replace(/onUpdatePrice=\{\(p\) => handleUpdatePrice\(order.id, p\)\}/, `onUpdatePrice={(p) => handleUpdatePrice(order.id, p)}
              onUpdateCustomizationStatus={(s) => handleUpdateCustomizationStatus(order.id, s)}`);

// Customization display
file = file.replace(/<p className="font-semibold text-gray-800">\s*\{order\.customization \|\| "None"\}\s*<\/p>/,
`<div className="flex flex-col gap-1">
                <p className="font-semibold text-gray-800">
                  {order.customization || "None"}
                </p>
                {order.customization && (
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] font-bold text-gray-500 uppercase">Status:</span>
                     <select 
                       className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 border border-gray-200 outline-none cursor-pointer"
                       value={order.customizationStatus || "YES"}
                       onChange={(e) => onUpdateCustomizationStatus(e.target.value)}
                       onClick={(e) => e.stopPropagation()}
                     >
                       <option value="YES">YES</option>
                       <option value="NO">NO</option>
                     </select>
                     {order.customizationStatus === "NO" && (
                        <span className="text-[10px] text-rose-500 font-bold ml-1 px-1.5 py-0.5 bg-rose-50 rounded">Deducted: ₹{order.customizationDeduction || 0}</span>
                     )}
                   </div>
                )}
              </div>`);

// Update remaining COD logic in card
file = file.replace(/order\.remainingCodAmount \?\? \(\(order\.price \|\| 0\) \* effectiveQuantity\)/,
`order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, ((order.price || 0) * effectiveQuantity) - (order.advancePaid || (order.paymentMode === "partial" ? 50 : 0)))`);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
