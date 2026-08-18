const fs = require('fs');
let code = fs.readFileSync('src/lib/utils.ts', 'utf8');

const search = `    if (paymentMode === "full") {
        // FULLY PREPAID
        amountPaid = adjustedAmount; // the actual full amount paid
        codAmount = 0;
        finalTotalAmount = adjustedAmount;
        
        // If there was an explicitly saved final total, use it for amountPaid and finalTotalAmount, but prefer adjustedAmount logic to be safe
        if (order.finalTotalAmount !== undefined && order.finalTotalAmount !== adjustedAmount && order.deductionAmount === undefined) {
             finalTotalAmount = order.finalTotalAmount;
             amountPaid = order.finalTotalAmount;
        }
    } else {
        // COD or PARTIAL
        if (order.amountPaid !== undefined) {
            amountPaid = order.amountPaid;
        } else if (order.advancePaid !== undefined) {
            amountPaid = order.advancePaid;
        } else {
            amountPaid = 50 * effectiveQuantity;
        }
        
        // For partial, cod amount is the remaining adjusted amount
        codAmount = adjustedAmount;
        finalTotalAmount = adjustedAmount + amountPaid;
    }`;

const replace = `    if (paymentMode === "full") {
        // FULLY PREPAID
        amountPaid = order.amountPaid !== undefined ? order.amountPaid : adjustedAmount;
        codAmount = 0;
        finalTotalAmount = order.totalOrderValue !== undefined ? order.totalOrderValue : (order.finalTotal !== undefined ? order.finalTotal : amountPaid);
    } else {
        // COD or PARTIAL
        if (order.amountPaid !== undefined) {
            amountPaid = order.amountPaid;
        } else if (order.advancePaid !== undefined) {
            amountPaid = order.advancePaid;
        } else {
            amountPaid = 50 * effectiveQuantity;
        }
        
        codAmount = order.codAmount !== undefined ? order.codAmount : adjustedAmount;
        finalTotalAmount = order.totalOrderValue !== undefined ? order.totalOrderValue : (order.finalTotal !== undefined ? order.finalTotal : adjustedAmount + amountPaid);
    }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/lib/utils.ts', code);
    console.log("Patched getOrderCalculations in utils.ts");
} else {
    console.log("Search string not found in utils.ts");
}
