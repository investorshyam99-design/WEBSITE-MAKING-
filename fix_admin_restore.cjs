const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const targetStr = `{tab.id === "drafts" && counts.drafts > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-[10px]">
                  {counts.drafts}
                </span>
              )}
               {
  const [isFulfillingAll`;

const replacementStr = `{tab.id === "drafts" && counts.drafts > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-[10px]">
                  {counts.drafts}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        {isLoadingOrders ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#1E2A44] mb-4" />
            <p className="text-gray-500 font-medium">Loading orders...</p>
          </div>
        ) : activeTab === "profits" ? (
          <AdminProfitsDashboard updateOrderCost={handleUpdateOrderCost} />
        ) : activeTab === "chats" ? (
          <AdminChatsList />
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              No {activeTab} orders found.
            </p>
          </div>
        ) : (
          groupedOrders.map((group) => (
            <AdminCustomerGroupCard
              key={group.id}
              group={group}
              activeTab={activeTab}
              handleUpdateStatus={handleUpdateStatus}
              handleUpdateTracking={handleUpdateTracking}
              handleDelete={handleDelete}
              onEditPayment={handleEditPayment}
              handleUpdatePrice={handleUpdatePrice}
              handleUpdateCustomizationStatus={handleUpdateCustomizationStatus}
              refreshOrders={refreshOrders}
            />
          ))
        )}

        {/* Pagination Controls */}
        {!search && ["new", "placed", "delivered", "rto", "cancelled"].includes(activeTab) && (
          <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-bold uppercase text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-gray-700">Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className="px-4 py-2 text-sm font-bold uppercase text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Payment Edit Modal */}
      {editingPaymentOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-[#1B1B1B]">Edit Payment Totals</h3>
              <button 
                onClick={() => setEditingPaymentOrder(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Order Value</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold">₹</span>
                  </div>
                  <input
                    type="number"
                    value={paymentEditTotal}
                    onChange={e => setPaymentEditTotal(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-[#1B1B1B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Advance / Amount Paid</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold">₹</span>
                  </div>
                  <input
                    type="number"
                    value={paymentEditPaid}
                    onChange={e => setPaymentEditPaid(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-[#1B1B1B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">To Collect (COD Amount)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold">₹</span>
                  </div>
                  <input
                    type="number"
                    value={paymentEditCod}
                    onChange={e => setPaymentEditCod(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-[#1B1B1B]"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
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
}

function AdminCustomerGroupCard({
  group,
  activeTab,
  handleUpdateStatus,
  handleUpdateTracking,
  handleDelete,
  onEditPayment,
  handleUpdatePrice,
  handleUpdateCustomizationStatus,
  refreshOrders,
}: any) {
  const [isFulfillingAll`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/AdminDashboard.tsx', code, 'utf8');
