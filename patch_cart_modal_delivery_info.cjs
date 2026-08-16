const fs = require('fs');
let file = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const targetStr = `Rs. {item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>`;

const replacementStr = `Rs. {item.price.toFixed(2)}
                              </span>
                            </div>
                            
                            {/* Delivery Info Box */}
                            {deliveryPincode && (
                              <div className="mt-2.5 p-2 bg-gray-50 border border-gray-100 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-bold text-[#1E2A44] uppercase tracking-wider">
                                    Delivery to {deliveryPincode}
                                  </span>
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    {deliveryMethod} {deliveryMethod === 'EXPRESS' ? '+₹50' : 'FREE'}
                                  </span>
                                </div>
                                <span className="text-[10px] font-medium text-gray-500">
                                  Expected: {(() => {
                                    const est = calculateDeliveryEstimate({
                                      pincode: deliveryPincode,
                                      deliveryMethod,
                                      customization: !!item.customization
                                    });
                                    return formatDateRange(est.estimatedStartDate, est.estimatedEndDate);
                                  })()}
                                </span>
                              </div>
                            )}
                            
                          </div>`;

file = file.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/CartModal.tsx', file);
