const fs = require('fs');

// 1. Update src/lib/delivery.ts to return null dates if tat is missing
let code = fs.readFileSync('src/lib/delivery.ts', 'utf8');

const search = `  let transitDays = 5; // Fallback
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
  estimatedEndDate.setDate(estimatedEndDate.getDate() + transitDaysEnd);`;

const replace = `  let isExpressAvailable = true;
  let estimatedStartDate = null;
  let estimatedEndDate = null;
  let transitDaysStart = 0;
  let transitDaysEnd = 0;

  if (tat) {
    let transitDays = 5;
    if (deliveryMethod === "FAST" && tat.express.available) {
      transitDays = tat.express.days;
    } else {
      transitDays = tat.normal.days;
    }
    isExpressAvailable = tat.express.available;

    transitDaysStart = transitDays;
    transitDaysEnd = transitDays + 1;
    
    estimatedStartDate = new Date(dispatchDate);
    estimatedStartDate.setDate(estimatedStartDate.getDate() + transitDaysStart);
    
    estimatedEndDate = new Date(dispatchDate);
    estimatedEndDate.setDate(estimatedEndDate.getDate() + transitDaysEnd);
  } else {
    isExpressAvailable = false;
  }`;

code = code.replace(search, replace);
// Update type signatures
code = code.replace('estimatedStartDate: Date;', 'estimatedStartDate: Date | null;');
code = code.replace('estimatedEndDate: Date;', 'estimatedEndDate: Date | null;');
code = code.replace('transitDaysStart: number;', 'transitDaysStart?: number;');
code = code.replace('transitDaysEnd: number;', 'transitDaysEnd?: number;');

fs.writeFileSync('src/lib/delivery.ts', code);
console.log('patched delivery.ts');
