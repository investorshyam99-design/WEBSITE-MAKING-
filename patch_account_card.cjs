const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const regexOrderInfo = /<div className="flex gap-4 md:gap-6 flex-wrap">/g;
const replacementOrderInfo = `<div className="flex gap-4 md:gap-6 flex-wrap">
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Delivery
            </p>
            <p className="font-semibold text-[#1B1B1B] text-sm">
              {order.deliveryMethod || "NORMAL"}
            </p>
            {order.expectedDeliveryStart && (
              <p className="text-[10px] text-gray-500 mt-1">
                Expected: {new Date(order.expectedDeliveryStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(order.expectedDeliveryEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            )}
            {order.dispatchDate && (
              <p className="text-[10px] text-gray-500">
                Dispatch: {new Date(order.dispatchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Location
            </p>
            <p className="font-semibold text-[#1B1B1B] text-sm">
              {order.deliveryCity || order.city || ""} {order.deliveryState ? \`, \${order.deliveryState}\` : ""}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {order.deliveryPincode || order.pincode}
            </p>
          </div>`;

file = file.replace(regexOrderInfo, replacementOrderInfo);

fs.writeFileSync('src/pages/AccountPage.tsx', file);
