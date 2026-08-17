const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const search = `  const orderDate = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";`;

const replace = `  const orderDate = (() => {
    if (!order.createdAt) return "Just now";
    try {
      const d = typeof order.createdAt?.toDate === 'function' 
        ? order.createdAt.toDate() 
        : new Date(order.createdAt);
      if (isNaN(d.getTime())) return "Just now";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch(e) {
      return "Just now";
    }
  })();`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('patched date formatting');
