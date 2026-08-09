const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexPrice = /const handleUpdatePrice = async \([\s\S]*?alert\("Failed to update price"\);\n      \}\n    \}\n  \};/;

const replacementPrice = `const handleUpdatePrice = async (orderId: string, currentAdjustedAmount: number) => {
    const newPrice = prompt(
      "Enter the new adjusted amount (FINAL AMOUNT BEFORE ADDING EXISTING ADVANCE PAYMENT):",
      currentAdjustedAmount.toString(),
    );
    if (newPrice && !isNaN(Number(newPrice))) {
      try {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        
        let effectiveQuantity = order.quantity || 1;
        if (!order.quantity && order.price >= 1800) {
           effectiveQuantity = Math.max(1, Math.round(order.price / ((order?.productName || "").toLowerCase().includes("player") ? 1499 : 999)));
        }
        
        const amountPaid = order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0));
        
        const adjustedAmount = Number(newPrice);
        const originalAmount = order.originalAmount !== undefined ? order.originalAmount : order.price;
        const deductionAmount = originalAmount - adjustedAmount;
        const finalTotalAmount = adjustedAmount + amountPaid;
        const codAmount = adjustedAmount;
        
        const updateData: any = {
          adjustedAmount,
          deductionAmount,
          priceAdjustment: deductionAmount,
          finalTotalAmount,
          codAmount,
          amountPaid,
          originalAmount,
          // Update price and finalTotal for backward compatibility in other parts of the app
          price: finalTotalAmount,
          finalTotal: finalTotalAmount
        };
        
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
      
      let effectiveQuantity = order.quantity || 1;
      if (!order.quantity && order.price >= 1800) {
         effectiveQuantity = Math.max(1, Math.round(order.price / ((order?.productName || "").toLowerCase().includes("player") ? 1499 : 999)));
      }
      
      const amountPaid = order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0));
      
      const originalAmount = order.originalAmount !== undefined ? order.originalAmount : order.price;
      
      let deductionAmount = order.deductionAmount || 0;
      const wasYes = order.customizationStatus !== "NO";
      
      if (status === "NO" && wasYes) {
          deductionAmount = 199;
      } else if (status === "YES" && !wasYes) {
          deductionAmount = 0;
      }
      
      const adjustedAmount = originalAmount - deductionAmount;
      const finalTotalAmount = adjustedAmount + amountPaid;
      const codAmount = adjustedAmount;
      
      const updateData: any = {
        customizationStatus: status,
        adjustedAmount,
        deductionAmount,
        priceAdjustment: deductionAmount,
        finalTotalAmount,
        codAmount,
        amountPaid,
        originalAmount,
        price: finalTotalAmount,
        finalTotal: finalTotalAmount
      };

      await updateDoc(doc(db, "orders", orderId), updateData);
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update customization status");
    }
  };`;

file = file.replace(regexCust, replacementCust);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
