const fs = require('fs');

function patchAdminDashboard() {
    let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
    
    // Replace: order.finalTotalAmount ?? order.price ?? 0
    // With: order.finalTotalAmount ?? ((order.price || 0) + (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "full" ? 0 : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * (order.quantity || 1) : 0)))))
    
    // We can just use the calculated amountPaid if it's available in the scope, but in the list item it's calculated inline as amountPaid or we can just duplicate the inline logic.
    // Wait, let's look at the inline logic for amountPaid in the list item:
    // (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "full" ? (order.price || 0) : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0))))
    // Wait, if paymentMode === "full", amountPaid is order.price. If we add order.price + amountPaid, it becomes 2x order.price!
    // Ah! Let's check TEST 4:
    // Original amount = 1198, Paid = 0.
    // Total order value = 999 (deducted). If no deduction: 1198.
    // So if paymentMode === "full", COD is 0. Total Order Value is just price.
    // The prompt says: "COD to collect = Total Order Value - Amount Already Paid" -> "Total Order Value = COD + Amount Paid"
    // Since originalAmount is the COD amount before deduction, Total Order Value = originalAmount + Amount Paid.
    
    const regex = /\{\(order\.finalTotalAmount \?\? order\.price \?\? 0\)\.toLocaleString\("en-IN"\)\}/g;
    const replacement = `{(order.finalTotalAmount !== undefined ? order.finalTotalAmount : ((order.price || 0) + (order.paymentMode === "full" ? 0 : (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0)))))).toLocaleString("en-IN")}`;
    
    file = file.replace(regex, replacement);
    fs.writeFileSync('src/components/AdminDashboard.tsx', file);
}

function patchAccountPage() {
    let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');
    
    const regex = /\{\(order\.finalTotalAmount \?\? order\.price \?\? 0\)\.toLocaleString\("en-IN"\)\}/g;
    const replacement = `{(order.finalTotalAmount !== undefined ? order.finalTotalAmount : ((order.price || 0) + (order.paymentMode === "full" ? 0 : (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0)))))).toLocaleString("en-IN")}`;
    
    file = file.replace(regex, replacement);
    fs.writeFileSync('src/pages/AccountPage.tsx', file);
}

function patchAdminProfits() {
    let file = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');
    
    const regex = /const basePrice = order\.finalTotalAmount \?\? order\.price \?\? order\.finalTotal \?\? getOrderPrice\(order\);/;
    const replacement = `const basePriceRaw = order.price ?? order.finalTotal ?? getOrderPrice(order);
          const basePrice = order.finalTotalAmount !== undefined ? order.finalTotalAmount : (basePriceRaw + (order.paymentMode === "full" ? 0 : (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : 50 * eq))));`;
          
    file = file.replace(regex, replacement);
    fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', file);
}

patchAdminDashboard();
patchAccountPage();
patchAdminProfits();

