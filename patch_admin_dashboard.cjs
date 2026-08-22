const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const stateTarget = `const [search, setSearch] = useState("");`;
const stateInjection = `const [search, setSearch] = useState("");
  const [editingPaymentOrder, setEditingPaymentOrder] = useState<any | null>(null);
  const [paymentEditTotal, setPaymentEditTotal] = useState<string>("");
  const [paymentEditPaid, setPaymentEditPaid] = useState<string>("");
  const [paymentEditCod, setPaymentEditCod] = useState<string>("");`;

content = content.replace(stateTarget, stateInjection);

const functionTarget = `  const handleUpdateCustomizationStatus = async (orderId: string, status: string) => {`;
const functionInjection = `  const handleSavePaymentEdit = async () => {
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

  const handleUpdateCustomizationStatus = async (orderId: string, status: string) => {`;

content = content.replace(functionTarget, functionInjection);

const editButtonTarget = `<button
                    title="Edit Total"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePrice(order.adjustedAmount ?? order.codAmount ?? order.remainingCodAmount ?? Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))));
                    }}
                    className="text-gray-400 hover:text-[#1E2A44] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>`;

const editButtonInjection = `<button
                    title="Edit Payment"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPaymentOrder(order);
                      setPaymentEditTotal(String(calc.finalTotalAmount));
                      setPaymentEditPaid(String(calc.amountPaid));
                      setPaymentEditCod(String(calc.codAmount));
                    }}
                    className="text-gray-400 hover:text-[#1E2A44] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>`;

content = content.replace(editButtonTarget, editButtonInjection);

const modalTarget = `      {/* Modal End */}`; // We'll just replace the very end of the file
const endOfFileTarget = `    </div>
  );
}`;

const endOfFileInjection = `
      {/* Payment Edit Modal */}
      {editingPaymentOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setEditingPaymentOrder(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Edit Payment Amounts</h3>
              <button 
                onClick={() => setEditingPaymentOrder(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Total Order Value (₹)
                </label>
                <input 
                  type="number" 
                  value={paymentEditTotal}
                  onChange={(e) => {
                    const newTotal = e.target.value;
                    setPaymentEditTotal(newTotal);
                    const parsedTotal = Number(newTotal) || 0;
                    const parsedPaid = Number(paymentEditPaid) || 0;
                    if (editingPaymentOrder.paymentMode !== "full") {
                        setPaymentEditCod(String(Math.max(0, parsedTotal - parsedPaid)));
                    } else {
                        setPaymentEditPaid(newTotal);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Paid / Advance Amount (₹)
                </label>
                <input 
                  type="number" 
                  value={paymentEditPaid}
                  onChange={(e) => {
                    const newPaid = e.target.value;
                    setPaymentEditPaid(newPaid);
                    const parsedTotal = Number(paymentEditTotal) || 0;
                    const parsedPaid = Number(newPaid) || 0;
                    if (editingPaymentOrder.paymentMode !== "full") {
                        setPaymentEditCod(String(Math.max(0, parsedTotal - parsedPaid)));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  To Collect / COD Amount (₹)
                </label>
                <input 
                  type="number" 
                  value={paymentEditCod}
                  onChange={(e) => {
                    const newCod = e.target.value;
                    setPaymentEditCod(newCod);
                    const parsedTotal = Number(paymentEditTotal) || 0;
                    const parsedCod = Number(newCod) || 0;
                    setPaymentEditPaid(String(Math.max(0, parsedTotal - parsedCod)));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setEditingPaymentOrder(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePaymentEdit}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}`;

content = content.replace(endOfFileTarget, endOfFileInjection);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
