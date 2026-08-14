const fs = require('fs');

function patchAdminProfits() {
    let file = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');
    
    const regex = /const basePrice = o\.finalTotalAmount \?\? o\.price \?\? o\.finalTotal \?\? getOrderPrice\(o\);/;
    const replacement = `const basePriceRaw = o.price ?? o.finalTotal ?? getOrderPrice(o);
      const basePrice = o.finalTotalAmount !== undefined ? o.finalTotalAmount : (basePriceRaw + (o.paymentMode === "full" ? 0 : (o.amountPaid !== undefined ? o.amountPaid : (o.advancePaid !== undefined ? o.advancePaid : 50 * effectiveQty))));`;
          
    file = file.replace(regex, replacement);
    fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', file);
}

patchAdminProfits();

