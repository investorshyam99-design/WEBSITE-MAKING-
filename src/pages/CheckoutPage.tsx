import React, { useState, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { Lock, Truck, ShieldCheck, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, setDoc } from "firebase/firestore";

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
  const { cart, user, clearCart, updateQuantity, removeFromCart, setIsCartOpen } = useShop();
  const navigate = useNavigate();

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.email?.startsWith("+") ? user.email.replace("+91", "") : "");
  const [pincode, setPincode] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [areaStreet, setAreaStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [paymentMode, setPaymentMode] = useState<"full" | "partial">("full");
  const [deliveryEstimate, setDeliveryEstimate] = useState("");

  const jerseyCart = cart.filter(item => ['player-version', 'master-version', 'fan-set'].includes(item.category));
  
  const subtotal = jerseyCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;
  
  const itemsCount = jerseyCart.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = itemsCount * 50;
  const codExtra = itemsCount * 50;

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPincode(value);
    if (value.length === 6) {
      setDeliveryEstimate("Delivery in 4–7 days");
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data && data[0]?.Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setCity(postOffice.District);
          setState(postOffice.State);
        }
      } catch (err) {
        console.error("Error fetching pincode info:", err);
      }
    } else {
      setCity("");
      setState("");
      setDeliveryEstimate("");
    }
  };

  const handleCheckout = async () => {
    if (!fullName || !phone || !pincode || !houseNo) {
      alert("Please fill in your full name, phone number, pincode and complete delivery address");
      return;
    }
    if (phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const combinedAddress = [houseNo, areaStreet, city, state, `Pincode: ${pincode}`].filter(Boolean).join(", ");
    setIsSubmitting(true);
    
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsSubmitting(false);
        return;
      }

      const createdOrderIds = [];
      for (const item of jerseyCart) {
        const itemFinalPrice = item.price;
        const itemAdvance = 50 * item.quantity;
        const itemCodExtra = 50 * item.quantity;
        const itemRemainingCod = paymentMode === "full" ? 0 : itemFinalPrice * item.quantity - itemAdvance + itemCodExtra;

        const docRef = await addDoc(collection(db, "orders"), {
          userId: user ? user.uid : "guest",
          productId: item.id,
          productName: item.name,
          image: item.image,
          size: item.selectedSize || "N/A",
          color: item.selectedColor || "N/A",
          quantity: item.quantity || 1,
          customization: item.customization ? `${item.customization.name} (${item.customization.number})` : null,
          price: itemFinalPrice,
          originalPrice: item.price * item.quantity,
          codCharges: itemCodExtra,
          advancePaid: itemAdvance,
          remainingCodAmount: itemRemainingCod,
          finalTotal: itemFinalPrice + itemCodExtra,
          status: paymentMode === "full" ? "pending full payment" : "pending advance payment",
          paymentMode,
          createdAt: serverTimestamp(),
          fullName,
          address: combinedAddress,
          phone,
          pincode,
          houseNo,
          areaStreet,
          city,
          state,
        });
        createdOrderIds.push(docRef.id);
      }

      const finalAmountToPay = paymentMode === "full" ? total : advanceAmount;

      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: jerseyCart,
          fullName,
          address: combinedAddress,
          phone,
          paymentMode,
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
                  status: paymentMode === "full" ? "Fully Paid" : "Advance Paid",
                  paymentId: response.razorpay_payment_id,
                });
              }
              if (paymentMode === "full") {
                alert(`Payment Successful!\n✅ ₹${total} Paid Successfully\nThank you for your order.`);
              } else {
                alert(`Payment Successful!\n✅ ₹${advanceAmount} Advance Paid Successfully\nRemaining COD Amount: ₹${total - advanceAmount + codExtra}\nPay remaining amount during delivery.`);
              }
              // Clear only jersey items from cart
              jerseyCart.forEach(item => {
                 removeFromCart(item.id, item.selectedSize, item.selectedColor, item.customization);
              });
              
              if (user) {
                navigate("/account");
              } else {
                navigate("/");
              }
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
    <div className="min-h-screen bg-gray-50 pt-[72px] pb-[80px]">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={handlePincodeChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="text"
                  placeholder="Address (House No, Area, Street)"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Hide City and State fields from UI but keep them for backend if fetched via Pincode */}
              
              {deliveryEstimate && (
                <p className="text-xs font-bold text-green-600 flex items-center gap-1.5 mt-2">
                  <Truck className="w-3.5 h-3.5" /> {deliveryEstimate}
                </p>
              )}
            </div>

            {/* Payment Modes */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="font-bold text-[#1B1B1B] uppercase tracking-wider text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" /> Payment Options
              </h2>
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
                    <span className="font-bold text-sm">Pay Full Amount</span>
                    {paymentMode === "full" && <ShieldCheck className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="text-xs text-gray-500">Pay Rs. {total.toFixed(2)} securely now.</div>
                  <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">
                    Free Delivery
                  </div>
                </button>

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
                  <div className="text-xs text-gray-700 font-bold mb-1">₹{advanceAmount} Advance Payment Required</div>
                  <div className="text-[11px] text-gray-500 font-medium leading-tight">Remaining Amount Payable on Delivery<br/>(₹{codExtra} COD handling charge applies)</div>
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({itemsCount} items)</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
              {paymentMode === "partial" && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>COD Charges</span>
                  <span>+ Rs. {codExtra.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Amount to Pay Now</span>
                <span className="text-xl">Rs. {(paymentMode === "full" ? total : advanceAmount).toFixed(2)}</span>
              </div>
              {paymentMode === "partial" && (
                <div className="flex justify-between text-xs font-bold text-red-600">
                  <span>To pay on delivery</span>
                  <span>Rs. {(total - advanceAmount + codExtra).toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleCheckout}
              className="w-full bg-[#1B1B1B] text-white h-14 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 hover:bg-[#2A2A2A] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isSubmitting ? "PROCESSING..." : `PAY RS. ${(paymentMode === "full" ? total : advanceAmount).toFixed(2)} SECURELY`}
            </button>
            
            <div className="flex justify-center items-center gap-3 opacity-60">
              <span className="text-[10px] font-bold tracking-widest uppercase">Secured by</span>
              <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
