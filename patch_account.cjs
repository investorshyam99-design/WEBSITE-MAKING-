const fs = require('fs');
let file = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// Add imports
if (!file.includes('formatDateRange')) {
  file = file.replace(/import \{ Header \} from "\.\.\/components\/Header";/, `import { Header } from "../components/Header";\nimport { formatDateRange } from "../lib/delivery";`);
}

// Update Order interface
const regexOrder = /trackingId\?: string;\n\s+courierName\?: string;/;
const replacementOrder = `trackingId?: string;
  trackingUrl?: string;
  courierName?: string;
  deliveryMethod?: "NORMAL" | "EXPRESS";
  deliveryPincode?: string;
  expectedDeliveryStart?: string;
  expectedDeliveryEnd?: string;
  customizationProcessingDays?: number;`;
file = file.replace(regexOrder, replacementOrder);

const regexJSX = /\{order\.size\} \| Qty: \{order\.quantity\}\n\s+<\/p>/;
const replacementJSX = `{order.size} | Qty: {order.quantity}
                        </p>
                        
                        {order.deliveryMethod && (
                          <div className="mt-2 text-xs bg-gray-50 border border-gray-100 p-2 rounded-lg flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Delivery</span>
                              <span className="font-black text-[#1B1B1B] uppercase tracking-wider text-[11px]">{order.deliveryMethod} {order.deliveryMethod === 'EXPRESS' ? '⚡' : ''}</span>
                            </div>
                            {order.expectedDeliveryStart && order.expectedDeliveryEnd && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Expected</span>
                                <span className="font-black text-[#1B1B1B] uppercase tracking-wider text-[11px]">{formatDateRange(new Date(order.expectedDeliveryStart), new Date(order.expectedDeliveryEnd))}</span>
                              </div>
                            )}
                            {order.deliveryPincode && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Pincode</span>
                                <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">{order.deliveryPincode}</span>
                              </div>
                            )}
                            {order.customizationProcessingDays ? (
                              <div className="mt-1 pt-1 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Customization</span>
                                <span className="font-bold text-gray-700 text-[10px]">2-3 Days Processing</span>
                              </div>
                            ) : null}
                          </div>
                        )}`;
file = file.replace(regexJSX, replacementJSX);

const regexTracking = /<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">/g;
// Actually I need to add tracking button. Let's find where to add it.
