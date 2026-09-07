const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Replace {tab.id === "abandoned" && counts.abandoned > 0 && (...)} with nothing
code = code.replace(
  /\{tab\.id === "abandoned" && counts\.abandoned > 0 && \([\s\S]*?\}\)/g,
  ''
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code, 'utf8');
