const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

file = file.replace(/  onUpdatePrice,\n\}: \{/, `  onUpdatePrice,
  onUpdateCustomizationStatus,
}: {`);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
