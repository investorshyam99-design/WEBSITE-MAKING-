const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const replacement = `
          <div className="flex-shrink-0 flex flex-col gap-2">
            <button 
              onClick={() => handleImageClick(order)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1B1B1B] text-sm font-bold rounded-lg transition-colors w-full"
            >
              View Order
            </button>
            {order.awbNumber && (
              <a 
                href={\`/track?awb=\${order.awbNumber}\`}
                className="px-4 py-2 bg-white border-2 border-[#1E2A44] hover:bg-[#1E2A44] hover:text-white text-[#1E2A44] text-center text-sm font-bold rounded-lg transition-colors w-full block"
              >
                Track Order
              </a>
            )}
          </div>
`;

file = file.replace(/<div className="flex-shrink-0">\s*<button\s*onClick=\{[^\}]+\}\s*className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-\[#1B1B1B\] text-sm font-bold rounded-lg transition-colors"\s*>\s*View Order\s*<\/button>\s*<\/div>/, replacement);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
