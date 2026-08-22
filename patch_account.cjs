const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Change the filter logic in AccountPage.tsx
  const oldFilter = `      // Always filter out drafts and internal statuses
      fetchedOrders = fetchedOrders.filter((order) => {
        const s = (order.status || "").toLowerCase();
        const payStatus = (order.paymentStatus || "").toLowerCase();
        // Reject draft, pending, or abandoned orders
        if (s.includes("draft") || s.includes("abandoned") || s.includes("pending")) return false;
        if (payStatus.includes("pending") || payStatus.includes("failed")) return false;
        // Accept paid or advance paid or active fulfillment status
        return (
          s.includes("paid") ||
          s.includes("shipped") ||
          s.includes("delivered") ||
          s.includes("processing") ||
          s.includes("confirmed") ||
          s.includes("completed") ||
          s.includes("cancelled") ||
          payStatus.includes("paid") ||
          payStatus.includes("success") ||
          payStatus.includes("captured")
        );
      });`;

  const newFilter = `      // Always filter out drafts and internal statuses
      fetchedOrders = fetchedOrders.filter((order) => {
        const s = (order.status || "").toLowerCase();
        
        // Reject internal uncompleted states
        if (s.includes("draft") || s.includes("abandoned") || s.includes("pending_cart")) return false;
        
        // We explicitly accept these statuses based on the admin dashboard tabs:
        const isNewOrder = s.includes("fully paid") || s.includes("advance paid") || s.includes("fampay") || s.includes("received");
        const isPlaced = s.includes("order placed");
        const isDelivered = s.includes("delivered");
        
        // Accept common active fulfillment statuses
        return (
          isNewOrder || 
          isPlaced || 
          isDelivered ||
          s.includes("paid") ||
          s.includes("shipped") ||
          s.includes("processing") ||
          s.includes("confirmed") ||
          s.includes("completed") ||
          s.includes("cancelled")
        );
      });`;

  if (content.includes(oldFilter)) {
      content = content.replace(oldFilter, newFilter);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched ${filePath}`);
  } else {
      console.log(`Could not find old filter in ${filePath}`);
  }
}

patchFile('src/pages/AccountPage.tsx');
