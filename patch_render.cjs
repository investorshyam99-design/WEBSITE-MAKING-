const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const renderStart = '{cart.length === 0 ? (';
const renderEnd = '</AnimatePresence>';

const renderIndex = code.indexOf(renderStart);
const endIndex = code.lastIndexOf(renderEnd);

if (renderIndex !== -1 && endIndex !== -1) {
  const newRender = `{cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <X className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-bold text-[#1B1B1B] mb-2">
                    Your cart is empty
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-[#1E2A44] hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-8 relative">
                  {/* Free Shipping Progress Bar */}
                  {(() => {
                    const freeShippingThreshold = 999;
                    const remainingForFreeShipping = freeShippingThreshold - subtotal;
                    const percentage = Math.min((subtotal / freeShippingThreshold) * 100, 100);
                    return (
                      <div className="bg-white px-5 md:px-6 pt-4 pb-2">
                        <div className="w-full bg-green-100 h-2.5 rounded-full overflow-hidden relative mb-2">
                          <div
                            className={\`h-full transition-all duration-500 ease-out bg-[#38D9A9]\`}
                            style={{ width: \`\${percentage}%\`, backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent)", backgroundSize: "1rem 1rem" }}
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-[#38D9A9]">
                            {remainingForFreeShipping > 0
                              ? \`Add Rs. \${remainingForFreeShipping.toFixed(2)} more to qualify for free shipping!\`
                              : "You qualify for free shipping!"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 1. Cart Items */}
                  <div className="px-4 md:px-6 space-y-0">
                    {cart.map((item, index) => (
                      <div
                        key={\`\${item.id}-\${item.selectedSize}-\${item.selectedColor}\`}
                        className={\`bg-white py-5 flex gap-4 relative group \${index !== cart.length - 1 ? "border-b border-gray-100" : ""}\`}
                      >
                        <div className="w-[90px] h-[100px] bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-sm text-[#1B1B1B] pr-4">{item.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>
                                {item.selectedColor ? \`\${item.selectedColor} / \` : ""}
                                {item.selectedSize}
                              </span>
                            </div>
                            {item.customization && (
                              <div className="mt-1 text-[10px] text-gray-500">
                                Custom: {item.customization.name} ({item.customization.number})
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400 line-through font-medium">Rs. {(item.price * 1.5).toFixed(2)}</span>
                              <span className="text-sm font-bold text-[#E83E44]">Rs. {item.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1, item.customization)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-lg leading-none mb-0.5">-</span>
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-[#1B1B1B]">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1, item.customization)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-lg leading-none mb-0.5">+</span>
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor, item.customization)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 2. Cart Reservation Timer */}
                  <CartReservationTimer />

                  {/* 3. Coupon Code */}
                  <div className="px-4 md:px-6 mt-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Coupon Code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1B1B1B]"
                        />
                        <button
                          onClick={applyCoupon}
                          className="bg-[#1B1B1B] text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider"
                        >
                          Apply
                        </button>
                      </div>
                      {couponMessage && (
                        <p className={\`mt-2 text-xs font-medium \${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}\`}>
                          {couponMessage.text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. Order Summary */}
                  <div className="px-4 md:px-6 mt-6">
                     <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                       <div className="flex justify-between text-sm text-gray-600">
                         <span>Subtotal</span>
                         <span>Rs. {subtotal.toFixed(2)}</span>
                       </div>
                       {discountAmount > 0 && (
                         <div className="flex justify-between text-sm text-green-600">
                           <span>Discount</span>
                           <span>- Rs. {discountAmount.toFixed(2)}</span>
                         </div>
                       )}
                       <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-3">
                         <span>Total</span>
                         <span>Rs. {total.toFixed(2)}</span>
                       </div>
                     </div>
                  </div>

                  {/* 5. Checkout Button */}
                  <div className="px-4 md:px-6 mt-6">
                    <button
                      onClick={() => { setIsCartOpen(false); navigate("/checkout"); }}
                      className="w-full bg-[#1B1B1B] text-white h-14 rounded-xl font-bold uppercase tracking-wider shadow-sm hover:scale-[1.01] active:scale-[0.99] hover:bg-[#2A2A2A] transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      CHECKOUT
                    </button>
                  </div>

                  {/* 6. Payment Trust Section */}
                  <div className="px-4 md:px-6 mt-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Lock className="w-4 h-4 text-[#38D9A9]" />
                      <span className="text-sm font-bold text-gray-800">Secure Checkout</span>
                    </div>
                    <div className="flex justify-center flex-wrap gap-2 mb-5">
                      {["Razorpay", "UPI", "GPay", "PhonePe", "Paytm", "Visa", "Mastercard", "RuPay"].map(name => (
                        <div key={name} className="px-2.5 py-1.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 shadow-sm">{name}</div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 flex flex-col items-center gap-2 font-medium">
                      <div className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-gray-400" /> Fast Dispatch</div>
                      <div className="flex items-center gap-1.5"><span className="text-base leading-none">📦</span> Tracking shared via WhatsApp & Email</div>
                    </div>
                  </div>

                  {/* 7. Product Recommendations */}
                  <div className="px-4 md:px-6 mt-10 mb-8">
                    <h3 className="text-sm font-bold text-[#1B1B1B] mb-4">
                      {recommendationHeading}
                    </h3>
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                      {recommendedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="min-w-[220px] w-[220px] bg-white border border-gray-100 rounded-2xl p-3 shrink-0 snap-start cursor-pointer group shadow-sm hover:shadow-md transition-all"
                          onClick={() => {
                            setIsCartOpen(false);
                            navigate(\`/products/\${product.slug}\`);
                          }}
                        >
                          <div className="w-full aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden mb-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="mb-2">
                            <span className="text-[10px] font-bold text-[#E83E44] bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {product.category}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#1B1B1B] leading-snug line-clamp-2 mb-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1 mb-3">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-xs font-bold text-gray-700">4.8</span>
                            <span className="text-[10px] text-gray-400">({Math.floor(Math.random() * 200 + 50)} reviews)</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-bold text-[#E83E44]">
                              Rs. {product.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400 line-through font-medium">
                              Rs. {(product.price * 1.5).toFixed(2)}
                            </span>
                          </div>
                          <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-[#1B1B1B] text-xs font-bold rounded-xl transition-colors border border-gray-100">
                            View Product
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>`;

  code = code.substring(0, renderIndex) + newRender;
  fs.writeFileSync('src/components/CartModal.tsx', code);
  console.log("Success replacing render block");
} else {
  console.log("Could not find boundaries");
}
