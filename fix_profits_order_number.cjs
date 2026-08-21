const fs = require('fs');

let content = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

// Replace {order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`}
// With {order.orderNumber ? `#${order.orderNumber}` : "Order number unavailable"}
content = content.replace(/\{order\.orderNumber \? \`\#\$\{order\.orderNumber\}\` \: \`\#\$\{order\.id\}\`\}/g, '{order.orderNumber ? `#${order.orderNumber}` : "Order number unavailable"}');

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', content);
