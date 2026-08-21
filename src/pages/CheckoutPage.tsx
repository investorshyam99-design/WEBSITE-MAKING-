import React, { useState, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { Lock, Truck, ShieldCheck, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, setDoc, runTransaction, getDocs, query, orderBy, limit } from "firebase/firestore";
import { trackInitiateCheckout, trackPurchase } from "../lib/pixel";
import { calculateDeliveryEstimate } from "../lib/delivery";
import { checkPincodeServiceability } from "../services/pincode";
import { DeliveryChecker } from "../components/DeliveryChecker";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function CheckoutPage() {
  const {
    cart,
    user,
    clearCart,
    updateQuantity,
    removeFromCart,
    setIsCartOpen,
    
    deliveryMethod,
    deliveryPincode,
    deliveryLocation,
    setDeliveryLocation,
    deliveryTat,
    setDeliveryTat,
  } = useShop();
  const navigate = useNavigate();

  // Redirect to home if cart is empty and track InitiateCheckout
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
    } else {
      const itemsToTrack = jerseyCart.length > 0 ? jerseyCart : cart;
      const totalVal = itemsToTrack.reduce((sum, item) => sum + item.price * item.quantity, 0);
      trackInitiateCheckout(itemsToTrack, totalVal);
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.email?.startsWith("+") ? user.email.replace("+91", "") : "");
  const [houseNo, setHouseNo] = useState("");
  const [areaStreet, setAreaStreet] = useState("");
  const [city, setCity] = useState(deliveryLocation?.city || "");
  const [state, setState] = useState(deliveryLocation?.state || "");
  const [paymentMode, setPaymentMode] = useState<"full" | "partial">("full");

  useEffect(() => {
    if (deliveryLocation) {
      setCity(deliveryLocation.city || "");
      setState(deliveryLocation.state || "");
    }
  }, [deliveryLocation]);

  const jerseyCart = cart.filter(item => ['player-version', 'master-version', 'fan-set'].includes(item.category));
  
  const hasCustomization = jerseyCart.some(item => {
    if (!item.customization) return false;
    if (typeof item.customization === 'object') {
      return Boolean(item.customization.name?.trim()) || Boolean(item.customization.number?.trim());
    }
    if (typeof item.customization === 'string') {
      return (item.customization as string).trim().length > 0;
    }
    return false;
  });

  useEffect(() => {
    if (hasCustomization) {
      setPaymentMode("full");
    }
  }, [hasCustomization]);

  const productSubtotal = jerseyCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  
  const isFastDelivery = deliveryMethod === "FAST";
  const fastDeliveryCharge = isFastDelivery ? 50 : 0;
  const codHandlingCharge = paymentMode === "partial" ? 50 : 0;
  
  const totalOrderValue = productSubtotal + codHandlingCharge + fastDeliveryCharge;

  let advanceToCollect = 0;
  let codAmount = 0;

  if (paymentMode === "partial") {
    if (isFastDelivery) {
      advanceToCollect = 100;
    } else {
      advanceToCollect = 50;
    }
    codAmount = productSubtotal;
  } else {
    advanceToCollect = totalOrderValue;
    codAmount = 0;
  }

  const handleCheckout = async (overrideMode?: "full" | "partial") => {
    const currentMode = overrideMode || paymentMode;
    
    // Recalculate based on currentMode to avoid React state async issues
    const currentIsFastDelivery = deliveryMethod === "FAST";
    const currentFastDeliveryCharge = currentIsFastDelivery ? 50 : 0;
    const currentCodHandlingCharge = currentMode === "partial" ? 50 : 0;
    const currentTotalOrderValue = productSubtotal + currentCodHandlingCharge + currentFastDeliveryCharge;
    
    let currentAdvanceToCollect = 0;
    let currentCodAmount = 0;
    
    if (currentMode === "partial") {
      if (currentIsFastDelivery) {
        currentAdvanceToCollect = 100;
      } else {
        currentAdvanceToCollect = 50;
      }
      currentCodAmount = productSubtotal;
    } else {
      currentAdvanceToCollect = currentTotalOrderValue;
      currentCodAmount = 0;
    }

    if (!fullName || !phone || !deliveryPincode || !houseNo) {
      alert("Please fill in your full name, phone number, pincode and complete delivery address");
      return;
    }

    if (phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const combinedAddress = [houseNo, areaStreet, city, state, `Pincode: ${deliveryPincode}`].filter(Boolean).join(", ");
    setIsSubmitting(true);
    
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsSubmitting(false);
        return;
      }

      let nextOrderNumber = 396;
      try {
        await runTransaction(db, async (transaction) => {
          const counterRef = doc(db, "counters", "orderCounter");
          const counterDoc = await transaction.get(counterRef);
          if (!counterDoc.exists()) {
            nextOrderNumber = 396;
            transaction.set(counterRef, { count: nextOrderNumber });
          } else {
            const current = counterDoc.data().count || 0;
            nextOrderNumber = Math.max(current + 1, 396);
            transaction.update(counterRef, { count: nextOrderNumber });
          }
        });
      } catch (e) {
        console.error("Failed to generate order number", e);
        try {
          const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(20));
          const snap = await getDocs(q);
          let maxNum = 395;
          snap.forEach((d) => {
            const num = d.data().orderNumber;
            if (typeof num === "number" && num < 10000 && num > maxNum) {
              maxNum = num;
            }
          });
          nextOrderNumber = maxNum + 1;
        } catch (err) {
          nextOrderNumber = 396;
        }
      }

      const createdOrderIds = [];
      let isFirstItem = true;
      for (const item of jerseyCart) {
        for (let i = 0; i < item.quantity; i++) {
          const itemFastDelivery = isFirstItem ? currentFastDeliveryCharge : 0;
          const itemCodExtra = isFirstItem ? currentCodHandlingCharge : 0;
          
          let itemAdvance = 0;
          let itemRemainingCod = 0;
          
          if (currentMode === "full") {
            itemAdvance = item.price + itemFastDelivery + itemCodExtra;
            itemRemainingCod = 0;
          } else {
             if (isFirstItem) {
                itemAdvance = currentAdvanceToCollect; 
             } else {
                itemAdvance = 0;
             }
             itemRemainingCod = item.price;
          }
          
          const itemTotalOrderValue = item.price + itemFastDelivery + itemCodExtra;
          const itemAmountPaid = itemAdvance;
          const itemFinalPrice = item.price;
          
          isFirstItem = false;

          const estimate = calculateDeliveryEstimate({
            pincode: deliveryPincode,
            deliveryMethod,
            customization: !!item.customization,
            tat: deliveryTat || undefined
          });

          const resolvedDeliveryType = deliveryMethod === "FAST" ? "Express" : "Surface";
          if (!deliveryMethod) {
            console.warn("Order creation: deliveryMethod is missing! Defaulting deliveryType to Surface.");
          }

          const docRef = await addDoc(collection(db, "orders"), {
            orderNumber: nextOrderNumber,
            userId: user ? user.uid : "guest",
            productId: item.id,
            productName: item.name,
            image: item.image,
            size: item.selectedSize || "N/A",
            color: item.selectedColor || "N/A",
            quantity: 1,
            customization: item.customization ? `${item.customization.name} (${item.customization.number})` : null,
            productSubtotal: item.price,
            deliveryType: resolvedDeliveryType,
            fastDeliveryCharge: itemFastDelivery,
            codHandlingCharge: itemCodExtra,
            totalOrderValue: itemTotalOrderValue,
            amountPaid: itemAmountPaid,
            codAmount: itemRemainingCod,
            
            // Legacy / compatibility fields
            price: item.price,
            originalPrice: item.price,
            codCharges: itemCodExtra,
            advancePaid: itemAdvance,
            remainingCodAmount: itemRemainingCod,
            finalTotal: itemTotalOrderValue,
            status: currentMode === "full" ? "pending full payment" : "pending advance payment",
            paymentMode: currentMode,
            deliveryMethod,
            deliveryPincode,
            expectedDeliveryStart: estimate.estimatedStartDate ? estimate.estimatedStartDate.toISOString() : "",
            expectedDeliveryEnd: estimate.estimatedEndDate ? estimate.estimatedEndDate.toISOString() : "",
            dispatchDate: estimate.dispatchDate.toISOString(),
            customizationProcessingDays: estimate.processingDays,
            deliveryCity: deliveryLocation?.city || city,
            deliveryDistrict: deliveryLocation?.district || "",
            deliveryState: deliveryLocation?.state || state,
            deliveryServiceable: estimate.isServiceable,
            createdAt: serverTimestamp(),
            fullName,
            address: combinedAddress,
            phone,
            pincode: deliveryPincode,
            houseNo,
            areaStreet,
            city,
            state,
          });
          createdOrderIds.push(docRef.id);
        }
      }

      if (!user) {
        const existingGuestOrders = JSON.parse(localStorage.getItem("guest_orders") || "[]");
        localStorage.setItem("guest_orders", JSON.stringify([...existingGuestOrders, ...createdOrderIds]));
      }

      const finalAmountToPay = currentAdvanceToCollect;

      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: jerseyCart,
          fullName,
          address: combinedAddress,
          phone,
          paymentMode: currentMode,
          deliveryMethod,
          finalAmount: finalAmountToPay,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create razorpay order session");
      }

      const orderData = await response.json();

      const options = {
        key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Jersey Unicorn",
        description: "Payment for Order",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-razorpay-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              for (const id of createdOrderIds) {
                await updateDoc(doc(db, "orders", id), {
                  status: currentMode === "full" ? "Fully Paid" : "Advance Paid",
                  paymentId: response.razorpay_payment_id,
                });
              }

              // Fire Meta Pixel Purchase event with order ID, total INR value, and item list
              const paidAmount = currentAdvanceToCollect;
              trackPurchase(nextOrderNumber, paidAmount, jerseyCart);

              if (currentMode === "full") {
                alert(`Payment Successful!\n✅ ₹${currentAdvanceToCollect} Paid Successfully\nThank you for your order #${nextOrderNumber}.`);
              } else {
                alert(`Payment Successful!\n✅ ₹${currentAdvanceToCollect} Advance Paid Successfully\nOrder #${nextOrderNumber} Confirmed\nRemaining COD Amount: ₹${currentCodAmount}\nPay remaining amount during delivery.`);
              }
              // Clear only jersey items from cart
              jerseyCart.forEach(item => {
                 removeFromCart(item.id, item.selectedSize, item.selectedColor, item.customization);
              });
              
              navigate("/account");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (e) {
            console.error(e);
            alert("Payment recorded, but failed to verify on server.");
          }
        },
        prefill: {
          name: user ? user.name : fullName,
          email: user ? user.email : "",
          contact: phone,
        },
        theme: {
          color: "#1E2A44",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[72px] pb-[200px]">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => { setIsCartOpen(true); navigate(-1); }} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Cart
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 sm:p-6 bg-gray-900 text-white flex items-center gap-3">
            <Lock className="w-5 h-5 text-[#38D9A9]" />
            <h1 className="font-bold tracking-wider uppercase text-lg">Secure Checkout</h1>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Delivery Details */}
            <div className="space-y-4">
              <h2 className="font-bold text-[#1B1B1B] uppercase tracking-wider text-sm flex items-center gap-2">
                <Truck className="w-4 h-4" /> Delivery Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="mb-4">
                <DeliveryChecker customizationEnabled={hasCustomization} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Address (House No, Area, Street)"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Payment Modes */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="font-bold text-[#1B1B1B] uppercase tracking-wider text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" /> Payment Options
              </h2>

              {hasCustomization && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed flex items-start gap-2.5 shadow-sm">
                  <span className="text-base leading-none">ℹ️</span>
                  <span className="font-medium">
                    Customized jerseys are made exclusively for you. Therefore, Name & Number customized jerseys are available only on Prepaid orders.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMode("full")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMode === "full"
                      ? "border-green-500 bg-green-50/50"
                      : "border-gray-200 hover:border-green-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">Pay Full Amount (Prepaid)</span>
                    {paymentMode === "full" && <ShieldCheck className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="text-xs text-gray-500">Pay ₹{totalOrderValue.toFixed(2)} securely now.</div>
                  <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">
                    Free Delivery
                  </div>
                </button>

                {!hasCustomization ? (
                  <button
                    onClick={() => setPaymentMode("partial")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMode === "partial"
                        ? "border-[#1E2A44] bg-[#1E2A44]/5"
                        : "border-gray-200 hover:border-[#1E2A44]/20"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm">💳 COD Available</span>
                      {paymentMode === "partial" && <ShieldCheck className="w-5 h-5 text-[#1E2A44]" />}
                    </div>
                    <div className="text-xs text-gray-700 font-bold mb-1">₹{advanceToCollect} Advance Payment Required</div>
                    <div className="text-[11px] text-gray-500 font-medium leading-tight">Remaining Amount Payable on Delivery</div>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60 text-left cursor-not-allowed">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-gray-500">💳 COD Unavailable</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Prepaid Only</span>
                    </div>
                    <div className="text-xs text-gray-500">COD is disabled for Name & Number customized jerseys.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({jerseyCart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{productSubtotal.toFixed(2)}</span>
              </div>
              {fastDeliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Fast Delivery</span>
                  <span>Rs. {fastDeliveryCharge.toFixed(2)}</span>
                </div>
              )}
              {paymentMode === "partial" && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>COD Advance</span>
                  <span>Rs. {advanceToCollect.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total Order Value</span>
                <span className="text-sm">₹{totalOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                <span>Amount to Pay Now</span>
                <span className="text-xl">₹{advanceToCollect.toFixed(2)}</span>
              </div>
              {paymentMode === "partial" && (
                <div className="flex justify-between text-xs font-bold text-red-600 pt-2 border-t border-gray-200">
                  <span>To pay on delivery</span>
                  <span>₹{codAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              disabled={isSubmitting}
              onClick={() => handleCheckout()}
              className="w-full bg-[#1B1B1B] text-white h-14 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 hover:bg-[#2A2A2A] transition-all flex items-center justify-center gap-2 animate-checkout-wiggle"
            >
              <Lock className="w-4 h-4" />
              {isSubmitting ? "PROCESSING..." : `PAY RS. ${(advanceToCollect).toFixed(2)} SECURELY`}
            </button>
            
            <div className="flex justify-center items-center gap-3 opacity-60">
              <span className="text-[10px] font-bold tracking-widest uppercase">Secured by</span>
              <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Sticky Payment Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-6 shadow-[0_-8px_30px_-5px_rgba(0,0,0,0.1)] z-50 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto px-4 sm:px-0 flex gap-4 md:gap-6">
          {/* LEFT BUTTON - COD */}
          {!hasCustomization && (
            <button
              disabled={isSubmitting}
              onClick={() => {
                setPaymentMode("partial");
                handleCheckout("partial");
              }}
              className={`flex-1 relative rounded-2xl border-2 transition-all duration-300 py-2 px-4 flex flex-col items-center justify-center text-center animate-attention disabled:opacity-50 disabled:animate-none ${
                paymentMode === "partial" 
                  ? "border-[#1E2A44] shadow-[0_8px_20px_-5px_rgba(30,42,68,0.3)] bg-gray-50 scale-[1.02] z-10" 
                  : "border-gray-200 bg-white opacity-90 hover:opacity-100 hover:border-[#1E2A44]/50"
              }`}
            >
              {paymentMode === "partial" && (
                <div className="absolute -top-3 -right-3 bg-[#1E2A44] text-white rounded-full p-1 shadow-lg">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              )}
              <span className="text-xs md:text-sm font-black tracking-wider text-[#1E2A44] uppercase mb-1.5 flex items-center justify-center gap-1.5 w-full"><Truck className="w-4 h-4 md:w-5 md:h-5"/> COD</span>
              <span className="text-base md:text-xl font-bold text-gray-900 leading-tight mb-1">Pay ₹{advanceToCollect.toFixed(0)}</span>
              <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">Remaining on<br/>Delivery</span>
            </button>
          )}

          {/* RIGHT BUTTON - PREPAID */}
          <button
            disabled={isSubmitting}
            onClick={() => {
              setPaymentMode("full");
              handleCheckout("full");
            }}
            className={`flex-1 relative rounded-2xl border-2 transition-all duration-300 py-2 px-4 flex flex-col items-center justify-center text-center animate-attention disabled:opacity-50 disabled:animate-none ${
              paymentMode === "full" 
                ? "border-[#38D9A9] shadow-[0_8px_20px_-5px_rgba(56,217,169,0.4)] bg-[#1E2A44] text-white scale-[1.02] z-10" 
                : "border-[#1E2A44] bg-[#1E2A44] text-white opacity-90 hover:opacity-100"
            }`}
          >
            {paymentMode === "full" && (
              <div className="absolute -top-3 -right-3 bg-[#38D9A9] text-[#1E2A44] rounded-full p-1 shadow-lg">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            )}
            <span className="text-xs md:text-sm font-black tracking-wider text-[#38D9A9] uppercase mb-1.5 flex items-center justify-center gap-1.5 w-full"><ShieldCheck className="w-4 h-4 md:w-5 md:h-5"/> PREPAID ONLY</span>
            <span className="text-base md:text-xl font-bold text-white leading-tight mb-1">Pay ₹{totalOrderValue.toFixed(0)}</span>
            <span className="text-[10px] md:text-xs font-medium text-gray-300 uppercase tracking-wide leading-tight">{fastDeliveryCharge > 0 ? "+₹50 Fast Delivery" : "Free Delivery"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
