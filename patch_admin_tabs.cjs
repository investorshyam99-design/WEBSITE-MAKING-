const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

file = file.replace(/const newOrders = orders\.filter\(\n    \(o\) =>\n      !o\.status\?\.toLowerCase\(\)\.includes\("pending"\) &&\n      !o\.status\?\.toLowerCase\(\)\.includes\("abandoned"\) &&\n      !o\.status\?\.toLowerCase\(\)\.includes\("draft"\) &&\n      o\.status\?\.toLowerCase\(\) !== "delivered" &&\n      o\.status\?\.toLowerCase\(\) !== "order placed" &&\n      o\.address,\n  \);/, 
`const newOrders = orders.filter(
    (o) =>
      !o.status?.toLowerCase().includes("pending") &&
      !o.status?.toLowerCase().includes("abandoned") &&
      !o.status?.toLowerCase().includes("draft") &&
      o.status?.toLowerCase() !== "delivered" &&
      o.status?.toLowerCase() !== "order placed" &&
      o.status?.toLowerCase() !== "cancelled" &&
      o.address,
  );

  const cancelledOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "cancelled"
  );`);

file = file.replace(/if \(activeTab === "delivered"\) currentOrders = deliveredOrders;/,
`if (activeTab === "delivered") currentOrders = deliveredOrders;
  if (activeTab === "cancelled") currentOrders = cancelledOrders;`);

const tabsEnd = `            </button>
          ))}
        </div>`;

const replaceTabs = `            </button>
          ))}
          <div className="relative flex items-center shrink-0">
             <select 
               className="ml-2 pl-3 pr-8 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 rounded-md shadow-sm outline-none cursor-pointer hover:bg-gray-50 appearance-none"
               value={activeTab === "cancelled" ? "cancelled" : "more"}
               onChange={(e) => {
                 if(e.target.value === "cancelled") setActiveTab("cancelled");
               }}
             >
               <option value="more" disabled>MORE ▼</option>
               <option value="cancelled">❌ Cancelled Orders</option>
             </select>
          </div>
        </div>`;

file = file.replace(tabsEnd, replaceTabs);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
