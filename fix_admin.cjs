const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Fix duplicates
content = content.replace(`  const [editingPaymentOrder, setEditingPaymentOrder] = useState<any | null>(null);
  const [paymentEditTotal, setPaymentEditTotal] = useState<string>("");
  const [paymentEditPaid, setPaymentEditPaid] = useState<string>("");
  const [paymentEditCod, setPaymentEditCod] = useState<string>("");
  const [editingPaymentOrder, setEditingPaymentOrder] = useState<any | null>(null);
  const [paymentEditTotal, setPaymentEditTotal] = useState<string>("");
  const [paymentEditPaid, setPaymentEditPaid] = useState<string>("");
  const [paymentEditCod, setPaymentEditCod] = useState<string>("");`, `  const [editingPaymentOrder, setEditingPaymentOrder] = useState<any | null>(null);
  const [paymentEditTotal, setPaymentEditTotal] = useState<string>("");
  const [paymentEditPaid, setPaymentEditPaid] = useState<string>("");
  const [paymentEditCod, setPaymentEditCod] = useState<string>("");`);

const handleSaveTarget = `  const handleSavePaymentEdit = async () => {
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
      
      if (editingPaymentOrder.paymentMode === "full" && newPaid !== newTotal) {
          if (!confirm("This is a fully paid order. Are you sure you want to change the paid amount to be different from the total?")) {
              return;
          }
      }

      const updateData: any = {
        totalOrderValue: newTotal,
        amountPaid: newPaid,
        codAmount: newCod,
        adjustedAmount: newCod,
        finalTotalAmount: newTotal,
      };

      await updateDoc(doc(db, "orders", editingPaymentOrder.id), updateData);
      setEditingPaymentOrder(null);
      refreshOrders();
    } catch (e) {
      console.error("Error updating payment", e);
      alert("Failed to update payment");
    }
  };

  const handleSavePaymentEdit = async () => {`;

const handleSaveReplacement = `  const handleSavePaymentEdit = async () => {`;

content = content.replace(handleSaveTarget, handleSaveReplacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
