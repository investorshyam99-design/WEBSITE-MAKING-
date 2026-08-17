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
  
  // dispatch_date = next business day, or +2 business days if customized
  const processingDays = customization ? 2 : 1;
  
  // Helper to skip weekends
  const addBusinessDays = (date, days) => {
    let result = new Date(date);
    let count = 0;
    while (count < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        count++;
      }
    }
    return result;
  };

  const dispatchDate = addBusinessDays(orderDate, processingDays);

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

  // Exact dates instead of ranges
  const estimatedStartDate = addBusinessDays(dispatchDate, transitDays);
  const estimatedEndDate = estimatedStartDate; // no range needed if exactly specified
  
  const isServiceable = /^[1-9][0-9]{5}$/.test(pincode);
  
  return {
    isServiceable,
    processingDays,
    transitDaysStart: transitDays,
    transitDaysEnd: transitDays,
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
