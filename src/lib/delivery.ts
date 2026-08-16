export type DeliveryMethod = "NORMAL" | "FAST";

export interface DeliveryEstimateParams {
  pincode: string;
  deliveryMethod: DeliveryMethod;
  customization: boolean;
  orderDate?: Date;
  tat?: {
    normal: { days: number; mode: string };
    express: { days: number; mode: string; available: boolean };
  };
}

export interface DeliveryEstimateResult {
  isServiceable: boolean;
  processingDays: number;
  transitDaysStart?: number;
  transitDaysEnd?: number;
  dispatchDate: Date;
  estimatedStartDate: Date | null;
  estimatedEndDate: Date | null;
  deliveryMethod: DeliveryMethod;
  message?: string;
  isExpressAvailable: boolean;
}

export function calculateDeliveryEstimate({
  pincode,
  deliveryMethod,
  customization,
  orderDate = new Date(),
  tat
}: DeliveryEstimateParams): DeliveryEstimateResult {
  
  // Base dispatch is 2 days. Customization adds 2-3 days (using 2 here).
  const processingDays = customization ? 4 : 2; 
  
  const dispatchDate = new Date(orderDate);
  dispatchDate.setDate(dispatchDate.getDate() + processingDays);

  let transitDays = 5; // Fallback
  let isExpressAvailable = true;

  if (tat) {
    if (deliveryMethod === "FAST" && tat.express.available) {
      transitDays = tat.express.days;
    } else {
      transitDays = tat.normal.days;
    }
    isExpressAvailable = tat.express.available;
  } else {
    // Fallback if tat object is missing
    if (deliveryMethod === "FAST") {
      transitDays = 2;
    }
  }

  // Generate a small range (e.g., if transitDays is 3, make it 3-4 days)
  const transitDaysStart = transitDays;
  const transitDaysEnd = transitDays + 1;
  
  const estimatedStartDate = new Date(dispatchDate);
  estimatedStartDate.setDate(estimatedStartDate.getDate() + transitDaysStart);
  
  const estimatedEndDate = new Date(dispatchDate);
  estimatedEndDate.setDate(estimatedEndDate.getDate() + transitDaysEnd);
  
  const isServiceable = /^[1-9][0-9]{5}$/.test(pincode);
  
  return {
    isServiceable,
    processingDays,
    transitDaysStart,
    transitDaysEnd,
    dispatchDate,
    estimatedStartDate,
    estimatedEndDate,
    deliveryMethod,
    isExpressAvailable
  };
}

export function formatDateRange(startDate: Date | null, endDate: Date | null): string {
  if (!startDate || !endDate) return 'Estimate temporarily unavailable';
  
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startStr = startDate.toLocaleDateString('en-IN', options);
  const endStr = endDate.toLocaleDateString('en-IN', options);
  
  if (startStr === endStr) {
    return startStr;
  }
  
  return `${startStr} – ${endStr}`;
}
