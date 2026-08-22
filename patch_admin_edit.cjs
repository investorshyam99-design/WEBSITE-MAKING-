const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We will replace the entire modal JSX
  const oldModalStart = `<div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setEditingPaymentOrder(null)}
        >`;
  const oldModalEnd = `          </div>
        </div>
      )}`;
      
  const startIndex = content.indexOf(oldModalStart);
  const endIndex = content.indexOf(oldModalEnd) + oldModalEnd.length;
  
  if (startIndex === -1 || endIndex < startIndex) {
    console.log("Could not find modal bounds");
    return;
  }
  
  const newModal = `<div 
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
                  onChange={(e) => setPaymentEditTotal(e.target.value)}
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
                  onChange={(e) => setPaymentEditPaid(e.target.value)}
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
                  onChange={(e) => setPaymentEditCod(e.target.value)}
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
      )}`;
      
  const newContent = content.substring(0, startIndex) + newModal + content.substring(endIndex);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Patched modal UI');
}

patchFile('src/components/AdminDashboard.tsx');
