const fs = require('fs');

let code = fs.readFileSync('src/lib/delivery.ts', 'utf8');

const search = `export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startStr = startDate.toLocaleDateString('en-IN', options);
  const endStr = endDate.toLocaleDateString('en-IN', options);
  
  if (startStr === endStr) {
    return startStr;
  }
  
  return \`\${startStr} – \${endStr}\`;
}`;

const replace = `export function formatDateRange(startDate: Date | null, endDate: Date | null): string {
  if (!startDate || !endDate) return 'Estimate temporarily unavailable';
  
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startStr = startDate.toLocaleDateString('en-IN', options);
  const endStr = endDate.toLocaleDateString('en-IN', options);
  
  if (startStr === endStr) {
    return startStr;
  }
  
  return \`\${startStr} – \${endStr}\`;
}`;

code = code.replace(search, replace);
fs.writeFileSync('src/lib/delivery.ts', code);
console.log('patched format date');
