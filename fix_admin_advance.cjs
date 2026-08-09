const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

file = file.replace(/const advance = order\.advancePaid \|\| \(order\.paymentMode === "partial" \? 50 : 0\);/g, `let effectiveQuantity = order.quantity || 1;
          if (!order.quantity && order.price >= 1800) {
            if (order.price % 1499 === 0) effectiveQuantity = order.price / 1499;
            else if (order.price % 1099 === 0) effectiveQuantity = order.price / 1099;
            else if (order.price % 999 === 0) effectiveQuantity = order.price / 999;
            else if (order.price % 1149 === 0) effectiveQuantity = order.price / 1149;
            else effectiveQuantity = Math.max(1, Math.round(order.price / ((order?.productName || "").toLowerCase().includes("player") ? 1499 : 999)));
          }
          const advance = order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0);`);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
