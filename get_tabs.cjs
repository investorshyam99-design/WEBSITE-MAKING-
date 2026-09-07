const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const match = code.match(/className="flex overflow-x-auto hide-scrollbar border-b border-gray-200"[\s\S]*?<\/div>\s*<\/div>\s*<div className="p-4 sm:p-6">/);
if (match) {
    console.log(match[0].substring(0, 500) + '...');
} else {
    console.log("NOT FOUND");
}
