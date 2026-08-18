const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// I'll look for where `finalTotalAmount` or `order.price` is rendered and add these fields there, or just add them below the order items.

const searchString = `            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Total Order Value
                </p>`;

// Actually, I don't know the exact structure of AdminDashboard. Let's find it.
