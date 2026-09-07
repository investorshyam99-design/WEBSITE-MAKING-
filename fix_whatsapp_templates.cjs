const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/draftReminder: .*,/g, 'draftReminder: `Hey ${customerName}\\n\\nYour Jersey Unicorn order ${displayOrderNumber} is waiting for confirmation ⚽\\n\\nComplete your order here:\\nhttps://jerseyunicorn.com`,');
code = code.replace(/codConfirm: .*,/g, 'codConfirm: `Hey ${customerName}\\n\\nYour Jersey Unicorn order ${displayOrderNumber} is waiting for confirmation ⚽\\n\\nComplete your order here:\\nhttps://jerseyunicorn.com`,');

fs.writeFileSync('src/components/AdminDashboard.tsx', code, 'utf8');
