const fs = require('fs');
let code = fs.readFileSync('src/lib/delivery.ts', 'utf8');

const search = `export function calculateDeliveryEstimate({
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
}`;

const replace = `export function calculateDeliveryEstimate({
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
}`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/lib/delivery.ts', code);
    console.log('patched calculateDeliveryEstimate');
} else {
    console.log('could not find calculateDeliveryEstimate');
}
