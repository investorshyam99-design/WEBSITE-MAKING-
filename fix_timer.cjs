const fs = require('fs');
let code = fs.readFileSync('src/components/CartReservationTimer.tsx', 'utf8');

code = code.replace(/<div className="flex items-center gap-2">[\s\S]*?<\/div>/, `<div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-medium text-red-700 leading-relaxed">
            ⚡ This item is in high demand. We've reserved your cart for the next <span className="font-bold">{displayTime}</span> minutes to help secure your order.
          </p>
        </div>`);

fs.writeFileSync('src/components/CartReservationTimer.tsx', code);
