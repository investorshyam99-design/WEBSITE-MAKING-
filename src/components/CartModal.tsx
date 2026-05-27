import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Lock, CheckCircle2, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function CartModal() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, user, clearCart, loginWithGoogle } = useShop();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [paymentMode, setPaymentMode] = useState<'full' | 'partial'>('full');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = 150 * itemsCount;
  const codExtra = 50 * itemsCount;

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPincode(value);
    if (value.length === 6) {
      setDeliveryEstimate('Delivery in 4–7 days');
    } else {
      setDeliveryEstimate('');
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsKeyboardOpen(true);
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (document.activeElement?.tagName !== 'INPUT') {
        setIsKeyboardOpen(false);
      }
    }, 100);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login first to place an order.");
      loginWithGoogle();
      return;
    }
    if (!fullName || !phone || !pincode || !streetAddress) {
      alert("Please fill in your full name, phone number, pincode and delivery address");
      return;
    }

    const combinedAddress = `${streetAddress}, Pincode: ${pincode}`;

    setIsSubmitting(true);
    try {
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        alert("Payment gateway failed to load. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      // 1. Create order in Firestore as Pending
      const createdOrderIds: string[] = [];
      for (const item of cart) {
        const docRef = await addDoc(collection(db, 'orders'), {
          userId: user.uid,
          productName: item.name,
          image: item.image,
          size: item.selectedSize || 'N/A',
          customization: item.customization ? `${item.customization.name} (${item.customization.number})` : null,
          price: item.price * item.quantity,
          status: paymentMode === 'full' ? 'pending full payment' : 'pending advance payment',
          paymentMode,
          createdAt: serverTimestamp(),
          fullName,
          address: combinedAddress,
          phone
        });
        createdOrderIds.push(docRef.id);
      }
      
      // 2. Create Razorpay order on server
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          fullName,
          address: combinedAddress,
          phone,
          paymentMode // Send 'full' or 'partial'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create razorpay order session');
      }

      const orderData = await response.json();
      
      // 3. Open Razorpay Checkout modal
      const options = {
        key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Jersey Unicorn",
        description: "Advance Payment for Order",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verify-razorpay-payment', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              // Update orders in firebase to Paid
              for (const id of createdOrderIds) {
                await updateDoc(doc(db, 'orders', id), {
                   status: paymentMode === 'full' ? 'Fully Paid' : 'Advance Paid',
                   paymentId: response.razorpay_payment_id
                });
              }
              alert("Payment Successful!");
              setIsCartOpen(false);
              clearCart();
              navigate('/orders');
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch(e) {
            console.error(e);
            alert("Payment recorded, but failed to verify on server.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: phone
        },
        theme: {
          color: "#1E2A44"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
      });
      rzp1.open();
      
    } catch (error: any) {
      console.error("Error creating order", error);
      alert("Failed to initiate payment: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity">
      <div className="w-full max-w-md bg-white h-[100dvh] relative shadow-2xl flex flex-col md:rounded-l-2xl overflow-hidden">
        <div className="flex flex-col border-b border-gray-100 bg-[#1E2A44] text-white">
          <div className="flex items-center justify-between p-5 md:p-6 pb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#E6C9A8]" />
              <h2 className="text-xl font-black uppercase tracking-widest">Secure Checkout</h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-300 hover:text-white transition-colors">
               <X className="h-6 w-6" />
            </button>
          </div>
          <p className="px-5 md:px-6 pb-4 text-xs font-medium text-gray-300">Trusted by 5000+ football fans across India</p>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <X className="w-8 h-8 text-gray-400" />
               </div>
               <p className="text-lg font-bold text-[#1B1B1B] mb-2">Your cart is empty</p>
               <button onClick={() => setIsCartOpen(false)} className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-[#1E2A44] hover:bg-gray-50 transition-colors shadow-sm">
                  Continue Shopping
               </button>
            </div>
          ) : (
            <>
              <div className="p-4 md:p-6 space-y-4">
                {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 relative group">
                  <div className="w-24 h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-black text-sm text-[#1B1B1B] leading-snug uppercase pr-8 tracking-wide">{item.name}</h3>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="inline-block px-2.5 py-1 bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-lg w-fit">
                          Size: {item.selectedSize}
                        </span>
                        {item.customization && (
                          <span className="inline-block px-2.5 py-1 bg-[#1E2A44]/5 border border-[#1E2A44]/10 text-[10px] font-black text-[#1E2A44] rounded-lg tracking-widest uppercase mt-1">
                            {item.customization.name} ({item.customization.number})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <p className="font-black text-lg text-[#1E2A44]">₹{item.price.toLocaleString()}</p>
                      
                      <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                        <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1, item.customization)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-[#1E2A44] hover:text-white transition-colors">
                          <span className="text-lg leading-none mb-0.5">-</span>
                        </button>
                        <span className="w-8 text-center text-xs font-black text-[#1B1B1B]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1, item.customization)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-[#1E2A44] hover:text-white transition-colors">
                          <span className="text-lg leading-none mb-0.5">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id, item.selectedSize, item.customization)} 
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2 md:opacity-0 md:group-hover:opacity-100 bg-white rounded-full shadow-sm md:shadow-none border border-gray-100 md:border-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] px-4 md:px-6 py-8 space-y-8">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                {paymentMode === 'partial' && (
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest pt-2 border-t border-gray-200/60">
                    <span>COD Charges</span>
                    <span className="text-[#1E2A44]">₹{codExtra}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#1B1B1B] uppercase tracking-wider pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{paymentMode === 'full' ? total : total + codExtra}</span>
                </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Details</h3>
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden focus-within:border-[#1E2A44] transition-colors focus-within:ring-1 focus-within:ring-[#1E2A44]">
                    <div className="relative border-b border-gray-100">
                       <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full px-5 py-4 text-sm font-bold text-[#1B1B1B] focus:outline-none placeholder:text-gray-400 placeholder:font-medium bg-transparent"
                      />
                    </div>
                    <div className="relative border-b border-gray-100">
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">+91</div>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full pl-14 pr-5 py-4 text-sm font-bold text-[#1B1B1B] focus:outline-none placeholder:text-gray-400 placeholder:font-medium bg-transparent overflow-hidden"
                      />
                    </div>
                    <div className="relative border-b border-gray-100 flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Pincode"
                        maxLength={6}
                        value={pincode}
                        onChange={handlePincodeChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full px-5 py-4 text-sm font-bold text-[#1B1B1B] focus:outline-none placeholder:text-gray-400 placeholder:font-medium bg-transparent"
                      />
                      {deliveryEstimate && (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mr-5 whitespace-nowrap animate-in fade-in duration-300">
                           {deliveryEstimate}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="House No / Street / Area"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full px-5 py-4 text-sm font-bold text-[#1B1B1B] focus:outline-none placeholder:text-gray-400 placeholder:font-medium bg-transparent"
                      />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Payment Method</h3>
                <div className="space-y-3">
                  <label className={
                     `relative block p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden
                     ${paymentMode === 'full' 
                        ? 'border-[#1E2A44] bg-[#1E2A44] text-white shadow-lg shadow-[#1E2A44]/20 scale-[1.02]' 
                        : 'border-gray-200 bg-white hover:border-[#1E2A44]/50'}`
                  }>
                     <input type="radio" value="full" checked={paymentMode === 'full'} onChange={() => setPaymentMode('full')} className="hidden" />
                     <div className="relative z-10 flex items-start justify-between">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === 'full' ? 'border-white' : 'border-gray-300'}`}>
                                 {paymentMode === 'full' && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                              </span>
                              <span className={`text-sm font-black uppercase tracking-wider ${paymentMode === 'full' ? 'text-white' : 'text-[#1B1B1B]'}`}>Full Prepaid</span>
                           </div>
                           <div className={`text-xs font-medium ml-7 ${paymentMode === 'full' ? 'text-white/80' : 'text-gray-500'}`}>Free Delivery + Extra ₹50 OFF</div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm ${paymentMode === 'full' ? 'bg-[#E6C9A8] text-[#1E2A44]' : 'bg-green-100 text-green-800'}`}>Recommended</span>
                     </div>
                  </label>

                  <label className={
                     `relative block p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden
                     ${paymentMode === 'partial' 
                        ? 'border-[#1E2A44] bg-blue-50/50 shadow-md scale-[1.02]' 
                        : 'border-gray-200 bg-white hover:border-[#1E2A44]/50'}`
                  }>
                     <input type="radio" value="partial" checked={paymentMode === 'partial'} onChange={() => setPaymentMode('partial')} className="hidden" />
                     <div className="relative z-10 flex items-start justify-between">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === 'partial' ? 'border-[#1E2A44]' : 'border-gray-300'}`}>
                                 {paymentMode === 'partial' && <div className="w-2.5 h-2.5 rounded-full bg-[#1E2A44]"></div>}
                              </span>
                              <span className="text-sm font-black text-[#1B1B1B] uppercase tracking-wider">Partial COD</span>
                           </div>
                           <div className="text-xs font-medium text-gray-500 ml-7">
                              Pay ₹{advanceAmount} now. Pay ₹{(total - advanceAmount) + codExtra} on delivery.
                           </div>
                        </div>
                     </div>
                  </label>
                </div>
              </div>

              {/* Trust Signals Row */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-6 border-t border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                 <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#1E2A44]" /> Secure</div>
                 <div className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#1E2A44]" /> Fast Delivery</div>
                 <div className="flex items-center gap-1.5"><RefreshCcw className="w-4 h-4 text-[#1E2A44]" /> Easy Exch.</div>
              </div>

            </div>

            </>
          )}
        </div>

        {cart.length > 0 && (!isKeyboardOpen || window.innerWidth >= 768) && (
          <div className="shrink-0 p-4 md:p-6 bg-white border-t border-gray-100 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-[#1E2A44] text-white h-14 rounded-2xl font-black uppercase tracking-[0.15em] shadow-xl shadow-[#1E2A44]/20 hover:scale-[1.01] active:scale-[0.99] hover:bg-[#223A5E] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isSubmitting ? 'Processing...' : `Proceed to Pay ₹${paymentMode === 'full' ? total : advanceAmount}`}
            </button>
            {!user && (
              <p className="text-xs text-red-500 text-center font-bold mt-3">Sign in to place an order</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
