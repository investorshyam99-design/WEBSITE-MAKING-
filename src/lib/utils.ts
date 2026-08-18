import { clsx, type ClassValue } from "clsx";
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
    let isFullyPaid = order.paymentMode === "full" || String(order.status).toLowerCase().includes("full") || order.paymentMethod === "PREPAID" || order.paymentStatus === "FULLY_PAID";
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
