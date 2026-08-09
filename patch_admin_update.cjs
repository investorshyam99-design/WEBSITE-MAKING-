const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexPrice = /const handleUpdatePrice = async \([\s\S]*?alert\("Failed to update price"\);\n      \}\n    \}\n  \};/;

const replacementPrice = `const handleUpdatePrice = async (orderId: string, currentPrice: number) => {
    const newPrice = prompt(
      "Enter the new FINAL TOTAL ORDER VALUE:",
      currentPrice.toString(),
    );
    if (newPrice && !isNaN(Number(newPrice))) {
      try {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const finalPrice = Number(newPrice);
        const updateData: any = {
          price: finalPrice,
          finalTotal: finalPrice,
          finalTotalAmount: finalPrice,
        };
        
        let effectiveQuantity = order.quantity || 1;
        if (!order.quantity && order.price >= 1800) {
           effectiveQuantity = Math.max(1, Math.round(order.price / ((order?.productName || "").toLowerCase().includes("player") ? 1499 : 999)));
        }
        
        let currentPaid = order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0));
        
        if (order.customizationStatus === "YES" && currentPaid === 0) {
            currentPaid = 199;
        }

        if (order.paymentMode !== "full" || order.remainingCodAmount !== undefined || order.codAmount !== undefined) {
          updateData.remainingCodAmount = Math.max(0, finalPrice - currentPaid);
          updateData.codAmount = Math.max(0, finalPrice - currentPaid);
          updateData.amountPaid = currentPaid;
          updateData.advancePaid = currentPaid;
        }
        await updateDoc(doc(db, "orders", orderId), updateData);
        refreshOrders();
      } catch (e) {
        console.error(e);
        alert("Failed to update price");
      }
    }
  };`;

file = file.replace(regexPrice, replacementPrice);

const regexCust = /const handleUpdateCustomizationStatus = async \([\s\S]*?alert\("Failed to update customization status"\);\n    \}\n  \};/;

const replacementCust = `const handleUpdateCustomizationStatus = async (orderId: string, status: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const updateData: any = { customizationStatus: status };
      
      let effectiveQuantity = order.quantity || 1;
      if (!order.quantity && order.price >= 1800) {
         effectiveQuantity = Math.max(1, Math.round(order.price / ((order?.productName || "").toLowerCase().includes("player") ? 1499 : 999)));
      }
      
      let currentPaid = order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0));
      
      if (status === "YES") {
          updateData.customizationAmount = 199;
          if (currentPaid === 0) {
              currentPaid = 199;
          }
      } else if (status === "NO") {
          updateData.customizationAmount = 0;
          if (currentPaid === 199) {
              currentPaid = 0;
          }
      }
      
      updateData.amountPaid = currentPaid;
      updateData.advancePaid = currentPaid;
      
      const finalTotal = order.finalTotalAmount ?? order.finalTotal ?? order.price ?? 0;
      updateData.codAmount = Math.max(0, finalTotal - currentPaid);
      updateData.remainingCodAmount = updateData.codAmount;

      await updateDoc(doc(db, "orders", orderId), updateData);
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update customization status");
    }
  };`;

file = file.replace(regexCust, replacementCust);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
