const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Inside refreshOrders catch block
content = content.replace(
  /catch \(e\) {\s*console\.warn\("Failed to fetch tab orders", e\);\s*}/g,
  `catch (e: any) {
        console.warn("Failed to fetch tab orders", e);
        if (e.message?.includes("Quota")) {
           alert("Firestore daily quota limit reached. The dashboard data will be available again after Midnight PT.");
        }
    }`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
