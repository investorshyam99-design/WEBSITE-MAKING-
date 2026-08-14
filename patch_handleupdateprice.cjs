const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const replacement = `const handleUpdatePrice = async (orderId: string, currentAdjustedAmount: number) => {
    const newPrice = prompt(
      "Enter the new adjusted amount (FINAL AMOUNT BEFORE ADDING EXISTING ADVANCE PAYMENT):",
      currentAdjustedAmount.toString(),
    );
    if (newPrice && !isNaN(Number(newPrice))) {
      try {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        
        const calc = getOrderCalculations(order);
        const adjustedAmount = Number(newPrice);
        const deductionAmount = calc.originalAmount - adjustedAmount;
        const finalTotalAmount = adjustedAmount + calc.amountPaid;
        const codAmount = adjustedAmount;
        
        const updateData: any = {
          adjustedAmount,
          deductionAmount,
          priceAdjustment: deductionAmount,
          finalTotalAmount,
          codAmount,
          amountPaid: calc.amountPaid,
          originalAmount: calc.originalAmount,
        };
        
        await updateDoc(doc(db, "orders", orderId), updateData);
        refreshOrders();
      } catch (e) {
        console.error(e);
        alert("Failed to update price");
      }
    }
  };`;
  
const startIdx = file.indexOf('const handleUpdatePrice = async (orderId: string, currentAdjustedAmount: number) => {');
const endIdx = file.indexOf('const handleUpdateCustomizationStatus = async (orderId: string, status: string) => {');

if (startIdx !== -1 && endIdx !== -1) {
    file = file.substring(0, startIdx) + replacement + '\n\n  ' + file.substring(endIdx);
    fs.writeFileSync('src/components/AdminDashboard.tsx', file);
    console.log("Patched successfully");
} else {
    console.log("Could not find boundaries");
}
