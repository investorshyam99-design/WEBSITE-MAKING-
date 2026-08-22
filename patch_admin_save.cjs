const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace handleSavePaymentEdit
  const oldSaveStart = `  const handleSavePaymentEdit = async () => {`;
  const oldSaveEnd = `  };`;
  
  const startIndex = content.indexOf(oldSaveStart);
  if (startIndex === -1) return;
  // find the NEXT "  };"
  const endIndex = content.indexOf(oldSaveEnd, startIndex) + oldSaveEnd.length;
  
  const newSave = `  const handleSavePaymentEdit = async () => {
    if (!editingPaymentOrder) return;
    try {
      const newTotal = Number(paymentEditTotal);
      const newPaid = Number(paymentEditPaid);
      const newCod = Number(paymentEditCod);

      if (isNaN(newTotal) || isNaN(newPaid) || isNaN(newCod)) {
        alert("Please enter valid numbers");
        return;
      }
      
      if (newTotal < 0 || newPaid < 0 || newCod < 0) {
        alert("Payment values cannot be negative");
        return;
      }

      const updateData: any = {
        totalOrderValue: newTotal,
        amountPaid: newPaid,
        codAmount: newCod,
        adjustedAmount: newCod, // Backwards compatibility
        finalTotalAmount: newTotal, // Backwards compatibility
      };

      await updateDoc(doc(db, "orders", editingPaymentOrder.id), updateData);
      setEditingPaymentOrder(null);
      refreshOrders();
    } catch (e) {
      console.error("Error updating payment", e);
      alert("Failed to update payment");
    }
  };`;
  
  content = content.substring(0, startIndex) + newSave + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Patched handleSavePaymentEdit');
}

patchFile('src/components/AdminDashboard.tsx');
