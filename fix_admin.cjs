const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /const handleUpdateCustomizationStatus = async \([\s\S]*?alert\("Failed to update customization status"\);\n    \}\n  \};/;

const replacement = `const handleUpdateCustomizationStatus = async (orderId: string, status: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const updateData: any = { customizationStatus: status };
      
      await updateDoc(doc(db, "orders", orderId), updateData);
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update customization status");
    }
  };`;

if (file.match(regex)) {
  file = file.replace(regex, replacement);
  fs.writeFileSync('src/components/AdminDashboard.tsx', file);
  console.log("Successfully replaced handleUpdateCustomizationStatus.");
} else {
  console.error("Regex did not match.");
}
