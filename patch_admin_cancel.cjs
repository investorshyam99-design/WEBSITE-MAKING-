const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const targetNewAction = `{activeTab === "new" && (
              <>
                <button
                  onClick={() => onUpdateStatus("Fampay")}
                  className="w-full py-2.5 bg-[#1E2A44] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2"
                >
                  <Check className="h-4 w-4" /> Fampay
                </button>`;

const replaceNewAction = `{activeTab === "new" && (
              <>
                <button
                  onClick={() => onUpdateStatus("Cancelled")}
                  className="w-full py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" /> Cancel Order
                </button>
                <button
                  onClick={() => onUpdateStatus("Fampay")}
                  className="w-full py-2.5 bg-[#1E2A44] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2"
                >
                  <Check className="h-4 w-4" /> Fampay
                </button>`;

file = file.replace(targetNewAction, replaceNewAction);

const targetDraftAction = `{activeTab === "delivered" && (`;
const replaceDraftAction = `{activeTab === "cancelled" && (
              <>
                <button
                  onClick={() => onUpdateStatus("Received")}
                  className="w-full py-2.5 bg-green-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-green-700"
                >
                  <RefreshCw className="h-4 w-4" /> Restore Order
                </button>
              </>
            )}
            {activeTab === "delivered" && (`;

file = file.replace(targetDraftAction, replaceDraftAction);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
