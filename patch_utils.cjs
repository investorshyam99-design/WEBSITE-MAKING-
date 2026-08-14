const fs = require('fs');
const utilsContent = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOrderCalculations(order: any) {
    let effectiveQuantity = order.quantity || 1;
    if (!order.quantity && (order.price || 0) >= 1800) {
       effectiveQuantity = Math.max(1, Math.round((order.price || 0) / ((order?.productName || "").toLowerCase().includes("player") ? 1499 : 999)));
    }
    
    // Determine payment mode accurately
    const isCustomized = (order.customization || order.customizationStatus === "YES");
    let isFullyPaid = order.paymentMode === "full" || String(order.status).toLowerCase().includes("full") || order.paymentMethod === "PREPAID" || order.paymentStatus === "FULLY_PAID" || isCustomized;
    let paymentMode = isFullyPaid ? "full" : "partial";
    
    const originalAmount = order.originalAmount !== undefined ? order.originalAmount : (order.price || 0);
    
    // Deductions and adjusted amount
    let deductionAmount = order.deductionAmount !== undefined ? order.deductionAmount : 0;
    let adjustedAmount = originalAmount - deductionAmount;
    
    if (order.adjustedAmount !== undefined && order.deductionAmount === undefined) {
        adjustedAmount = order.adjustedAmount;
        deductionAmount = originalAmount - adjustedAmount;
    }
    if (order.codAmount !== undefined && order.adjustedAmount === undefined && order.deductionAmount === undefined && paymentMode !== "full") {
        adjustedAmount = order.codAmount;
        deductionAmount = originalAmount - adjustedAmount;
    }
    
    let amountPaid = 0;
    let codAmount = 0;
    let finalTotalAmount = 0;
    
    if (paymentMode === "full") {
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
    }
    
    return {
        effectiveQuantity,
        amountPaid,
        originalAmount,
        adjustedAmount,
        deductionAmount,
        finalTotalAmount,
        codAmount,
        paymentMode // returned so UI can use it instead of raw order.paymentMode
    };
}
`;
fs.writeFileSync('src/lib/utils.ts', utilsContent);
