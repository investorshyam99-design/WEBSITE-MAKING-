const fs = require('fs');
const filePath = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add handleEditPayment
const handleSaveStartStr = "const handleSavePaymentEdit = async () => {";
const handleEditPayment = `  const handleEditPayment = (order: any, calc: any) => {
    setEditingPaymentOrder(order);
    
    const initialTotal = String(calc.finalTotalAmount ?? 0);
    const initialPaid = String(calc.amountPaid ?? 0);
    const initialCod = String(calc.codAmount ?? 0);
    
    setInitialPaymentEditTotal(initialTotal);
    setInitialPaymentEditPaid(initialPaid);
    setInitialPaymentEditCod(initialCod);
    
    setPaymentEditTotal(initialTotal);
    setPaymentEditPaid(initialPaid);
    setPaymentEditCod(initialCod);
  };

  `;

content = content.replace(handleSaveStartStr, handleEditPayment + handleSaveStartStr);

// 2. Pass to AdminOrderCard
const cardUsage = `<AdminOrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              onUpdateStatus={(s) => handleUpdateStatus(order.id, s)}
              onDelete={() => handleDelete(order.id)}
              onUpdateTracking={(t, c) => handleUpdateTracking(order.id, t, c)}
              onUpdatePrice={(p) => handleUpdatePrice(order.id, p)}
              onUpdateCustomizationStatus={(s) => handleUpdateCustomizationStatus(order.id, s)}`;

const newCardUsage = `<AdminOrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              onUpdateStatus={(s) => handleUpdateStatus(order.id, s)}
              onDelete={() => handleDelete(order.id)}
              onUpdateTracking={(t, c) => handleUpdateTracking(order.id, t, c)}
              onUpdatePrice={(p) => handleUpdatePrice(order.id, p)}
              onUpdateCustomizationStatus={(s) => handleUpdateCustomizationStatus(order.id, s)}
              onEditPayment={(order, calc) => handleEditPayment(order, calc)}`;

content = content.replace(cardUsage, newCardUsage);

// 3. Update handleSavePaymentEdit
const saveOldStr = `      const updateData: any = {
        totalOrderValue: newTotal,
        amountPaid: newPaid,
        codAmount: newCod,
        adjustedAmount: newCod, // Backwards compatibility
        finalTotalAmount: newTotal, // Backwards compatibility
      };

      await updateDoc(doc(db, "orders", editingPaymentOrder.id), updateData);
      setEditingPaymentOrder(null);
      refreshOrders();`;

const saveNewStr = `      const updateData: any = {};
      
      // ONLY update fields that actually changed
      if (paymentEditTotal !== initialPaymentEditTotal) {
          updateData.totalOrderValue = newTotal;
          updateData.finalTotalAmount = newTotal;
      }
      if (paymentEditPaid !== initialPaymentEditPaid) {
          updateData.amountPaid = newPaid;
          updateData.advancePaid = newPaid;
      }
      if (paymentEditCod !== initialPaymentEditCod) {
          updateData.codAmount = newCod;
          updateData.adjustedAmount = newCod;
      }

      if (Object.keys(updateData).length > 0) {
          await updateDoc(doc(db, "orders", editingPaymentOrder.id), updateData);
          refreshOrders();
      }
      setEditingPaymentOrder(null);`;

content = content.replace(saveOldStr, saveNewStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched AdminDashboard.tsx completely');
