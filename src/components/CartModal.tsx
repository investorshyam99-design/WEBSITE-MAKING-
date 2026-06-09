import React, { useState, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import {
  X,
  Trash2,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RefreshCcw,
} from "lucide-react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const validateCouponForCart = (items: any[]) => {
  if (items.length === 0) {
    return { isValid: false, message: "Your cart is empty." };
  }

  // Check if there are any excluded items: sublimation and Indian embroidery jerseys
  const hasExcluded = items.some((item) => {
    const name = (item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    return (
      category === "sublimation" ||
      category === "indian" ||
      name.includes("sublimation") ||
      name.includes("sublimition") ||
      name.includes("indian embroidery") ||
      name.includes("embroidery")
    );
  });

  if (hasExcluded) {
    return {
      isValid: false,
      message:
        "❌ UNICORN100 is not applicable on sublimation or Indian embroidery jerseys.",
    };
  }

  // Check if there is at least one eligible item: player version, fan version, or master version
  const hasEligible = items.some((item) => {
    const name = (item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    return (
      category === "player" ||
      category === "fan" ||
      category === "master" ||
      name.includes("player version") ||
      name.includes("fan version") ||
      name.includes("master version") ||
      name.includes("player") ||
      name.includes("fan") ||
      name.includes("master")
    );
  });

  if (!hasEligible) {
    return {
      isValid: false,
      message:
        "❌ UNICORN100 is only valid for Player, Fan, or Master version jerseys.",
    };
  }

  return {
    isValid: true,
    message: "🎉 UNICORN100 Applied Successfully! ₹100 Discount Added.",
  };
};

export function CartModal() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    user,
    clearCart,
    setIsLoginOpen,
  } = useShop();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [areaStreet, setAreaStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [paymentMode, setPaymentMode] = useState<"full" | "partial">("full");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [autoCheckoutPending, setAutoCheckoutPending] = useState(false);

  // Auto-fill phone if logged in with phone number
  useEffect(() => {
    if (user && user.email?.startsWith("+")) {
      setPhone(user.email.replace("+91", ""));
    }
  }, [user]);

  const [draftOrderId, setDraftOrderId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && autoCheckoutPending) {
      setAutoCheckoutPending(false);
      handleCheckout();
    }
  }, [user, autoCheckoutPending]);

  // Custom Hook or logic to save abandoned carts
  useEffect(() => {
    if (user && cart.length > 0) {
      const abandonedTimer = setTimeout(() => {
        const cartRef = doc(db, "abandoned_carts", user.uid);
        setDoc(
          cartRef,
          {
            uid: user.uid,
            phone: user.email?.startsWith("+") ? user.email : null,
            name: user.name,
            cartItems: cart.map((i) => ({
              productId: i.id,
              name: i.name,
              quantity: i.quantity,
              size: i.selectedSize,
              price: i.price,
              customization: i.customization || null,
            })),
            totalValue: cart.reduce(
              (total, item) => total + item.price * item.quantity,
              0,
            ),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        ).catch((err) => console.error("Failed to save abandoned cart:", err));
      }, 3000); // Save after 3 seconds of inactvity
      return () => clearTimeout(abandonedTimer);
    }
  }, [cart, user]);

  useEffect(() => {
    if (user && !fullName && !phone) {
      setFullName(user.name || "");
    }
  }, [user]);

  useEffect(() => {
    if (discount > 0) {
      const validation = validateCouponForCart(cart);
      if (!validation.isValid) {
        setDiscount(0);
        setCouponMessage({ type: "error", text: validation.message });
      }
    }
  }, [cart]);

  // Draft Order Creation
  useEffect(() => {
    if (!fullName || phone.length !== 10 || cart.length === 0) return;

    const timeoutId = setTimeout(async () => {
      try {
        const combinedAddress = `${houseNo}, ${areaStreet}, ${city}, ${state}, Pincode: ${pincode}`;
        const draftData: any = {
          userId: user ? user.uid : "guest",
          fullName,
          phone,
          address: combinedAddress,
          cartItems: cart.map((i) => ({
            productId: i.id,
            name: i.name,
            quantity: i.quantity,
            size: i.selectedSize,
          })),
          status: "draft",
          paymentMode,
          discount,
          couponCode: discount > 0 ? "UNICORN100" : null,
          updatedAt: serverTimestamp(),
        };

        if (draftOrderId) {
          await updateDoc(doc(db, "draft_orders", draftOrderId), draftData);
        } else {
          draftData.createdAt = serverTimestamp();
          const docRef = await addDoc(
            collection(db, "draft_orders"),
            draftData,
          );
          setDraftOrderId(docRef.id);
        }
      } catch (err) {
        console.error("Failed to update draft order", err);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [
    fullName,
    phone,
    houseNo,
    areaStreet,
    city,
    state,
    pincode,
    cart,
    user,
    paymentMode,
    draftOrderId,
  ]);

  // removed early return to allow AnimatePresence to work

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discount);
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = Math.max(0, 150 * itemsCount - discount);
  const codExtra = 50 * itemsCount;

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    setPincode(value);
    if (value.length === 6) {
      setDeliveryEstimate("Delivery in 4–7 days");
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${value}`,
        );
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          if (postOffice) {
            setCity(postOffice.District);
            setState(postOffice.State);
          }
        }
      } catch (err) {
        console.error("Error fetching pincode details:", err);
      }
    } else {
      setDeliveryEstimate("");
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsKeyboardOpen(true);
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (document.activeElement?.tagName !== "INPUT") {
        setIsKeyboardOpen(false);
      }
    }, 100);
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code !== "UNICORN100") {
      setCouponMessage({ type: "error", text: "❌ Invalid coupon code." });
      setDiscount(0);
      return;
    }

    const validation = validateCouponForCart(cart);

    if (!validation.isValid) {
      setCouponMessage({ type: "error", text: validation.message });
      setDiscount(0);
      return;
    }

    setDiscount(100);
    setCouponMessage({ type: "success", text: validation.message });
  };

  const handleCheckout = async () => {
    if (
      !fullName ||
      !phone ||
      !pincode ||
      !houseNo ||
      !areaStreet ||
      !city ||
      !state
    ) {
      alert(
        "Please fill in your full name, phone number, pincode and complete delivery address",
      );
      return;
    }

    if (phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const combinedAddress = `${houseNo}, ${areaStreet}, ${city}, ${state}, Pincode: ${pincode}`;

    setIsSubmitting(true);
    try {
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        alert(
          "Payment gateway failed to load. Please check your internet connection.",
        );
        setIsSubmitting(false);
        return;
      }

      // 1. Create order in Firestore as Pending
      const createdOrderIds: string[] = [];
      for (const item of cart) {
        const docRef = await addDoc(collection(db, "orders"), {
          userId: user ? user.uid : "guest",
          productId: item.id,
          productName: item.name,
          image: item.image,
          size: item.selectedSize || "N/A",
          quantity: item.quantity || 1,
          customization: item.customization
            ? `${item.customization.name} (${item.customization.number})`
            : null,
          price:
            item.price * item.quantity -
            (discount > 0 ? discount / cart.length : 0),
          discountApplied: discount > 0 ? discount / cart.length : 0,
          couponCode: discount > 0 ? "UNICORN100" : null,
          status:
            paymentMode === "full"
              ? "pending full payment"
              : "pending advance payment",
          paymentMode,
          createdAt: serverTimestamp(),
          fullName,
          address: combinedAddress,
          phone,
        });
        createdOrderIds.push(docRef.id);
      }

      // 2. Create Razorpay order on server
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          fullName,
          address: combinedAddress,
          phone,
          paymentMode, // Send 'full' or 'partial'
          discount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create razorpay order session",
        );
      }

      const orderData = await response.json();

      // 3. Open Razorpay Checkout modal
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
              // Update orders in firebase to Paid
              for (const id of createdOrderIds) {
                await updateDoc(doc(db, "orders", id), {
                  status:
                    paymentMode === "full" ? "Fully Paid" : "Advance Paid",
                  paymentId: response.razorpay_payment_id,
                });
              }
              alert("Payment Successful! Thank you for your order.");
              setIsCartOpen(false);
              clearCart();
              if (user) {
                navigate("/orders");
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
    } catch (error: any) {
      console.error("Error creating order", error);
      alert(
        "Failed to initiate payment: " + (error.message || "Unknown error"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white h-[100dvh] relative shadow-2xl flex flex-col md:rounded-l-2xl overflow-hidden"
          >
            <div className="flex flex-col border-b border-gray-100 bg-[#1E2A44] text-white">
              <div className="flex items-center justify-between p-5 md:p-6 pb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#E6C9A8]" />
                  <h2 className="text-xl font-black uppercase tracking-widest">
                    Secure Checkout
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="px-5 md:px-6 pb-4 text-xs font-medium text-gray-300">
                Trusted by 5000+ football fans across India
              </p>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/50">
              {cart.length === 0 ? (
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
                <>
                  <div className="p-4 md:p-6 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={`${item.id}-${item.selectedSize}`}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 relative group"
                      >
                        <div className="w-24 h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <h3 className="font-black text-sm text-[#1B1B1B] leading-snug uppercase pr-8 tracking-wide">
                              {item.name}
                            </h3>
                            <div className="flex flex-col gap-1 mt-2">
                              <span className="inline-block px-2.5 py-1 bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-lg w-fit">
                                Size: {item.selectedSize}
                              </span>
                              {item.customization && (
                                <span className="inline-block px-2.5 py-1 bg-[#1E2A44]/5 border border-[#1E2A44]/10 text-[10px] font-black text-[#1E2A44] rounded-lg tracking-widest uppercase mt-1">
                                  {item.customization.name} (
                                  {item.customization.number})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <p className="font-black text-lg text-[#1E2A44]">
                              ₹{item.price.toLocaleString()}
                            </p>

                            <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.selectedSize,
                                    item.quantity - 1,
                                    item.customization,
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-[#1E2A44] hover:text-white transition-colors"
                              >
                                <span className="text-lg leading-none mb-0.5">
                                  -
                                </span>
                              </button>
                              <span className="w-8 text-center text-xs font-black text-[#1B1B1B]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.selectedSize,
                                    item.quantity + 1,
                                    item.customization,
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-[#1E2A44] hover:text-white transition-colors"
                              >
                                <span className="text-lg leading-none mb-0.5">
                                  +
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(
                              item.id,
                              item.selectedSize,
                              item.customization,
                            )
                          }
                          className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2 md:opacity-0 md:group-hover:opacity-100 bg-white rounded-full shadow-sm md:shadow-none border border-gray-100 md:border-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] px-4 md:px-6 py-8 space-y-8">
                    {/* Coupon Section */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Apply Coupon
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter Coupon Code"
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-[#1B1B1B] uppercase tracking-wider focus:outline-none focus:border-[#1E2A44] transition-colors"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="bg-[#1E2A44] text-white px-6 rounded-xl font-bold uppercase text-xs tracking-widest shadow-sm hover:bg-[#223A5E] transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponMessage && (
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wider ml-1 mt-1 ${couponMessage.type === "success" ? "text-green-600" : "text-red-500"}`}
                        >
                          {couponMessage.text}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-xs font-bold text-green-600 uppercase tracking-widest">
                          <span>Discount ({couponCode})</span>
                          <span>-₹{discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Shipping</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      {paymentMode === "partial" && (
                        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest pt-2 border-t border-gray-200/60">
                          <span>COD Charges</span>
                          <span className="text-[#1E2A44]">₹{codExtra}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-black text-[#1B1B1B] uppercase tracking-wider pt-3 border-t border-gray-200">
                        <span>Total</span>
                        <span>
                          ₹{paymentMode === "full" ? total : total + codExtra}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Delivery Details
                      </h3>
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden focus-within:border-[#1E2A44] transition-colors focus-within:ring-1 focus-within:ring-[#1E2A44]">
                        <div className="relative border-b border-gray-100 bg-white">
                          <input
                            id="fullName"
                            type="text"
                            placeholder="Full Name *"
                            value={fullName}
                            autoComplete="name"
                            onChange={(e) => setFullName(e.target.value)}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="peer w-full px-4 pt-6 pb-2 text-sm font-bold text-[#1B1B1B] bg-transparent focus:outline-none placeholder-transparent"
                          />
                          <label
                            htmlFor="fullName"
                            className="absolute left-4 top-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-500 peer-placeholder-shown:normal-case peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-[#1E2A44] pointer-events-none"
                          >
                            Full Name *
                          </label>
                        </div>
                        <div className="relative border-b border-gray-100 bg-white">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 lg:translate-y-0 lg:top-4 text-sm font-bold text-gray-500 z-10 peer-focus:text-[#1E2A44]">
                            +91
                          </div>
                          <input
                            id="phone"
                            type="tel"
                            maxLength={10}
                            placeholder="Phone Number *"
                            value={phone}
                            autoComplete="tel"
                            onChange={(e) =>
                              setPhone(e.target.value.replace(/\D/g, ""))
                            }
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="peer w-full pl-12 pr-4 pt-6 pb-2 text-sm font-bold text-[#1B1B1B] bg-transparent focus:outline-none placeholder-transparent"
                          />
                          <label
                            htmlFor="phone"
                            className="absolute left-12 top-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-500 peer-placeholder-shown:normal-case peer-focus:left-12 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-[#1E2A44] pointer-events-none"
                          >
                            Phone Number *
                          </label>
                        </div>
                        <div className="relative border-b border-gray-100 bg-white flex items-center justify-between">
                          <div className="relative flex-1">
                            <input
                              id="pincode"
                              type="tel"
                              maxLength={6}
                              placeholder="Pincode *"
                              value={pincode}
                              autoComplete="postal-code"
                              onChange={handlePincodeChange}
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                              className="peer w-full px-4 pt-6 pb-2 text-sm font-bold text-[#1B1B1B] bg-transparent focus:outline-none placeholder-transparent"
                            />
                            <label
                              htmlFor="pincode"
                              className="absolute left-4 top-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-500 peer-placeholder-shown:normal-case peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-[#1E2A44] pointer-events-none"
                            >
                              Pincode *
                            </label>
                          </div>
                          {deliveryEstimate && (
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 mr-4 whitespace-nowrap animate-in fade-in duration-300">
                              {deliveryEstimate}
                            </span>
                          )}
                        </div>
                        <div className="relative border-b border-gray-100 bg-white">
                          <input
                            id="houseNo"
                            type="text"
                            placeholder="House No / Flat No *"
                            value={houseNo}
                            autoComplete="address-line1"
                            onChange={(e) => setHouseNo(e.target.value)}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="peer w-full px-4 pt-6 pb-2 text-sm font-bold text-[#1B1B1B] bg-transparent focus:outline-none placeholder-transparent"
                          />
                          <label
                            htmlFor="houseNo"
                            className="absolute left-4 top-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-500 peer-placeholder-shown:normal-case peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-[#1E2A44] pointer-events-none"
                          >
                            House No / Flat No *
                          </label>
                        </div>
                        <div className="relative border-b border-gray-100 bg-white">
                          <input
                            id="areaStreet"
                            type="text"
                            placeholder="Area / Street *"
                            value={areaStreet}
                            autoComplete="address-line2"
                            onChange={(e) => setAreaStreet(e.target.value)}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="peer w-full px-4 pt-6 pb-2 text-sm font-bold text-[#1B1B1B] bg-transparent focus:outline-none placeholder-transparent"
                          />
                          <label
                            htmlFor="areaStreet"
                            className="absolute left-4 top-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-500 peer-placeholder-shown:normal-case peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-[#1E2A44] pointer-events-none"
                          >
                            Area / Street *
                          </label>
                        </div>
                        <div className="flex bg-white">
                          <div className="relative flex-1 border-r border-gray-100">
                            <input
                              id="city"
                              type="text"
                              placeholder="City *"
                              value={city}
                              autoComplete="address-level2"
                              onChange={(e) => setCity(e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                              className="peer w-full px-4 pt-6 pb-2 text-sm font-bold text-[#1B1B1B] bg-transparent focus:outline-none placeholder-transparent"
                            />
                            <label
                              htmlFor="city"
                              className="absolute left-4 top-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-500 peer-placeholder-shown:normal-case peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-[#1E2A44] pointer-events-none"
                            >
                              City *
                            </label>
                          </div>
                          <div className="relative flex-1">
                            <input
                              id="state"
                              type="text"
                              placeholder="State *"
                              value={state}
                              autoComplete="address-level1"
                              onChange={(e) => setState(e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                              className="peer w-full px-4 pt-6 pb-2 text-sm font-bold text-[#1B1B1B] bg-transparent focus:outline-none placeholder-transparent"
                            />
                            <label
                              htmlFor="state"
                              className="absolute left-4 top-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-gray-500 peer-placeholder-shown:normal-case peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-[#1E2A44] pointer-events-none"
                            >
                              State *
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 px-1">
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />{" "}
                            Delivery in 3–10 Days
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />{" "}
                            Tracking Number Provided
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />{" "}
                            Secure Payments
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />{" "}
                            WhatsApp Support Available
                          </span>
                        </div>
                      </div>

                      <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 flex items-center justify-center gap-2 mt-4">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold text-green-800 uppercase tracking-wider">
                          Trusted by 10,000+ Football Fans
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Payment Method
                      </h3>
                      <div className="space-y-3">
                        <label
                          className={`relative block p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden
                     ${
                       paymentMode === "full"
                         ? "border-[#1E2A44] bg-[#1E2A44] text-white shadow-lg shadow-[#1E2A44]/20 scale-[1.02]"
                         : "border-gray-200 bg-white hover:border-[#1E2A44]/50"
                     }`}
                        >
                          <input
                            type="radio"
                            value="full"
                            checked={paymentMode === "full"}
                            onChange={() => setPaymentMode("full")}
                            className="hidden"
                          />
                          <div className="relative z-10 flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === "full" ? "border-white" : "border-gray-300"}`}
                                >
                                  {paymentMode === "full" && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                  )}
                                </span>
                                <span
                                  className={`text-sm font-black uppercase tracking-wider ${paymentMode === "full" ? "text-white" : "text-[#1B1B1B]"}`}
                                >
                                  Full Payment
                                </span>
                              </div>
                              <div
                                className={`text-xs font-medium ml-8 space-y-1 pt-1 ${paymentMode === "full" ? "text-white/90" : "text-gray-500"}`}
                              >
                                <p className="flex items-center gap-1.5 text-green-400 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Free
                                  Delivery
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                  Faster Processing
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                  Priority Support
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm mb-1 ${paymentMode === "full" ? "bg-[#E6C9A8] text-[#1E2A44]" : "bg-green-100 text-green-800"}`}
                              >
                                Recommended
                              </span>
                              <span
                                className={`text-sm font-black ${paymentMode === "full" ? "text-white" : "text-[#1B1B1B]"}`}
                              >
                                ₹{total}
                              </span>
                            </div>
                          </div>
                        </label>

                        <label
                          className={`relative block p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden
                     ${
                       paymentMode === "partial"
                         ? "border-[#1E2A44] bg-[#1E2A44]/5 shadow-md scale-[1.02]"
                         : "border-gray-200 bg-white hover:border-[#1E2A44]/50"
                     }`}
                        >
                          <input
                            type="radio"
                            value="partial"
                            checked={paymentMode === "partial"}
                            onChange={() => setPaymentMode("partial")}
                            className="hidden"
                          />
                          <div className="relative z-10 flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === "partial" ? "border-[#1E2A44]" : "border-gray-300"}`}
                                >
                                  {paymentMode === "partial" && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1E2A44]"></div>
                                  )}
                                </span>
                                <span className="text-sm font-black text-[#1B1B1B] uppercase tracking-wider">
                                  Partial COD
                                </span>
                              </div>
                              <div className="text-xs font-bold text-[#1E2A44] ml-8 mt-1">
                                ₹{advanceAmount} Confirmation Amount
                              </div>
                              <div className="text-xs font-medium text-gray-500 ml-8 mt-2 leading-relaxed">
                                To prevent fake orders, a{" "}
                                <span className="font-bold">
                                  ₹{advanceAmount}
                                </span>{" "}
                                confirmation payment is required. Remaining
                                amount of{" "}
                                <span className="font-bold">
                                  ₹{total - advanceAmount + codExtra}
                                </span>{" "}
                                payable on delivery.
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-black text-[#1B1B1B]">
                                ₹{total + codExtra}
                              </span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Conversion Boosters Row */}
                    <div className="flex flex-col gap-y-3 pt-6 border-t border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="grid grid-cols-2 gap-y-3">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-[#1E2A44]" /> Delivery:
                          3-10 Days
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#1E2A44]" />{" "}
                          Secure Checkout
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] leading-tight">
                          <img
                            src="/favicon.svg"
                            alt="Premium"
                            className="w-4 h-4 opacity-70 filter invert grayscale opacity-100 brightness-0"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />{" "}
                          Premium Football Jerseys
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-1.5 text-[#25D366]">
                          <CheckCircle2 className="w-4 h-4 text-[#25D366]" /> We
                          will send tracking number through whatsapp
                        </div>
                        <div className="flex items-center gap-1.5 text-red-500">
                          <X className="w-4 h-4 text-red-500" /> Exchanges can
                          be made only when mistake is done by our side
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 &&
              (!isKeyboardOpen || window.innerWidth >= 768) && (
                <div className="shrink-0 p-4 md:p-6 bg-white border-t border-gray-100 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                  {!user ? (
                    <button
                      onClick={() => {
                        if (
                          fullName &&
                          phone.length === 10 &&
                          pincode &&
                          houseNo &&
                          areaStreet &&
                          city &&
                          state
                        ) {
                          setAutoCheckoutPending(true);
                        }
                        setIsLoginOpen(true);
                      }}
                      className="w-full bg-[#1E2A44] text-white h-14 rounded-2xl font-black uppercase tracking-[0.15em] shadow-xl shadow-[#1E2A44]/20 hover:scale-[1.01] active:scale-[0.99] hover:bg-[#223A5E] transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Sign in to place order
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className="w-full bg-[#1E2A44] text-white h-14 rounded-2xl font-black uppercase tracking-[0.15em] shadow-xl shadow-[#1E2A44]/20 hover:scale-[1.01] active:scale-[0.99] hover:bg-[#223A5E] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      {isSubmitting
                        ? "Processing..."
                        : `Proceed to Pay ₹${paymentMode === "full" ? total : advanceAmount}`}
                    </button>
                  )}
                </div>
              )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
