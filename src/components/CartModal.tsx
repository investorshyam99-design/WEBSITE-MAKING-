import React, { useState, useEffect } from "react";
import { useProducts } from "../data/products";
import { useShop } from "../context/ShopContext";
import {
  X,
  Trash2,
  Edit2,
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
import { CartReservationTimer } from "./CartReservationTimer";
import { getProductReviewsInfo } from "./ReviewsSection";

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
  const { products } = useProducts();
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
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Auto-fill phone if logged in with phone number
  useEffect(() => {
    if (user && user.email?.startsWith("+")) {
      setPhone(user.email.replace("+91", ""));
    }
  }, [user]);

  const [draftOrderId, setDraftOrderId] = useState<string | null>(null);

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

  // Draft Order Creation
  useEffect(() => {
    if (!fullName || phone.length !== 10 || cart.length === 0) return;

    const timeoutId = setTimeout(async () => {
      try {
        const combinedAddress = [houseNo, areaStreet, city, state, `Pincode: ${pincode}`].filter(Boolean).join(", ");
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
  const total = Math.max(0, subtotal - discountAmount);
  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "WELCOME10") {
      const discount = subtotal * 0.1;
      setDiscountAmount(discount);
      setCouponMessage({
        type: "success",
        text: "Coupon applied successfully!",
      });
    } else {
      setDiscountAmount(0);
      setCouponMessage({ type: "error", text: "Invalid coupon code" });
    }
  };

  const getDominantCategory = () => {
    if (cart.length === 0) return "player-version";
    const categories = cart.map((item) => {
      const p = products.find((prod) => prod.id === item.id);
      return p ? p.category : "player-version";
    });

    const counts = categories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b,
    );
  };

  const dominantCategory = getDominantCategory();
  const recommendedProducts = products
    .filter(
      (p) =>
        p.category === dominantCategory && !cart.some((c) => c.id === p.id),
    )
    .slice(0, 4);

  let recommendationHeading = "⭐ More Products You'll Love";
  if (dominantCategory === "player-version") {
    recommendationHeading = "⭐ More Player Version Jerseys";
  } else if (dominantCategory === "master-version") {
    recommendationHeading = "⭐ More Master Version Jerseys";
  } else if (dominantCategory === "fan-set") {
    recommendationHeading = "⭐ More Fan Version Jerseys";
  } else if (dominantCategory === "tees") {
    recommendationHeading = "👕 More T-Shirts You'll Love";
  }

  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = itemsCount * 50;
  const codExtra = itemsCount * 50;

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

  const handleCheckout = async () => {
    if (
      !fullName ||
      !phone ||
      !pincode ||
      !houseNo
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

    const combinedAddress = [houseNo, areaStreet, city, state, `Pincode: ${pincode}`].filter(Boolean).join(", ");

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
        const itemFinalPrice = item.price * item.quantity;
        const itemCodExtra = paymentMode === "partial" ? 50 * item.quantity : 0;
        const itemAdvance =
          paymentMode === "partial" ? 150 * item.quantity : itemFinalPrice;
        const itemRemainingCod =
          paymentMode === "partial"
            ? itemFinalPrice + itemCodExtra - itemAdvance
            : 0;

        const docRef = await addDoc(collection(db, "orders"), {
          userId: user ? user.uid : "guest",
          productId: item.id,
          productName: item.name,
          image: item.image,
          size: item.selectedSize || "N/A",
          color: item.selectedColor || "N/A",
          quantity: item.quantity || 1,
          customization: item.customization
            ? `${item.customization.name} (${item.customization.number})`
            : null,
          price: itemFinalPrice,
          originalPrice: item.price * item.quantity,
          codCharges: itemCodExtra,
          advancePaid: itemAdvance,
          remainingCodAmount: itemRemainingCod,
          finalTotal: itemFinalPrice + itemCodExtra,
          status:
            paymentMode === "full"
              ? "pending full payment"
              : "pending advance payment",
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
          finalAmount: finalAmountToPay,
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
              if (paymentMode === "full") {
                alert(
                  `Payment Successful!\n✅ ₹${total} Paid Successfully\nThank you for your order.`,
                );
              } else {
                alert(
                  `Payment Successful!\n✅ ₹${advanceAmount} Advance Paid Successfully\nRemaining COD Amount: ₹${total - advanceAmount + codExtra}\nPay remaining amount during delivery.`,
                );
              }
              setIsCartOpen(false);
              clearCart();
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
          className="fixed inset-0 z-[999] flex justify-end bg-black/50"
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white h-[100dvh] relative shadow-2xl flex flex-col md:rounded-l-2xl overflow-hidden"
          >
            <div className="flex flex-col border-b border-gray-100 bg-white text-[#1B1B1B]">
              <div className="flex items-start justify-between p-5 md:p-6 pb-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">Shopping Cart</h2>
                  <p className="text-sm text-gray-500">
                    {cart.reduce((total, item) => total + item.quantity, 0)}{" "}
                    item
                    {cart.reduce((total, item) => total + item.quantity, 0) !==
                    1
                      ? "s"
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
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
                <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-8 relative">
                  {/* Free Shipping Progress Bar */}
                  {(() => {
                    const freeShippingThreshold = 999;
                    const remainingForFreeShipping =
                      freeShippingThreshold - subtotal;
                    const percentage = Math.min(
                      (subtotal / freeShippingThreshold) * 100,
                      100,
                    );
                    return (
                      <div className="bg-white px-5 md:px-6 pt-4 pb-2">
                        <div className="w-full bg-green-100 h-2.5 rounded-full overflow-hidden relative mb-2">
                          <div
                            className={`h-full transition-all duration-500 ease-out bg-[#38D9A9]`}
                            style={{
                              width: `${percentage}%`,
                              backgroundImage:
                                "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent)",
                              backgroundSize: "1rem 1rem",
                            }}
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-[#38D9A9]">
                            {remainingForFreeShipping > 0
                              ? `Add Rs. ${remainingForFreeShipping.toFixed(2)} more to qualify for free shipping!`
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
                        key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${item.customization ? item.customization.name : "no-cust"}-${item.customization ? item.customization.number : "no-num"}`}
                        className={`bg-white py-5 flex gap-4 relative group ${index !== cart.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        <div className="w-[90px] h-[100px] bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-sm text-[#1B1B1B] pr-4">
                                {item.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>
                                {item.selectedColor
                                  ? `${item.selectedColor} / `
                                  : ""}
                                {item.selectedSize}
                              </span>
                            </div>
                            {item.customization && (
                              <div className="mt-1 text-[10px] text-gray-500">
                                Custom: {item.customization.name} (
                                {item.customization.number})
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400 line-through font-medium">
                                Rs. 1599.00
                              </span>
                              <span className="text-sm font-bold text-[#E83E44]">
                                Rs. {item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.selectedSize,
                                    item.selectedColor,
                                    item.quantity - 1,
                                    item.customization,
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-lg leading-none mb-0.5">
                                  -
                                </span>
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-[#1B1B1B]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.selectedSize,
                                    item.selectedColor,
                                    item.quantity + 1,
                                    item.customization,
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-lg leading-none mb-0.5">
                                  +
                                </span>
                              </button>
                            </div>
                            <button
                              onClick={() =>
                                removeFromCart(
                                  item.id,
                                  item.selectedSize,
                                  item.selectedColor,
                                  item.customization,
                                )
                              }
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
                        <p
                          className={`mt-2 text-xs font-medium ${couponMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
                        >
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

                  {/* COD Payment Rules Info */}
                  <div className="px-4 md:px-6 mt-6">
                    <div className="p-4 border border-[#1E2A44] bg-[#F8FAFC] rounded-xl flex items-start gap-3">
                      <Lock className="w-5 h-5 text-[#1E2A44] shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#1B1B1B] uppercase tracking-wider mb-1">COD Available</span>
                        <span className="text-xs font-bold text-gray-700 mb-1">₹{advanceAmount} Advance Payment Required</span>
                        <span className="text-[11px] font-medium text-gray-500 leading-tight">Remaining Amount Payable on Delivery (₹{codExtra} COD handling charge applies)</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Checkout Button */}
                  <div className="px-4 md:px-6 mt-6 flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        window.location.href = "/#/checkout";
                      }}
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
                      <span className="text-sm font-bold text-gray-800">
                        Secure Checkout
                      </span>
                    </div>
                    <div className="flex justify-center flex-wrap gap-2 mb-5">
                      {[
                        "Razorpay",
                        "UPI",
                        "GPay",
                        "PhonePe",
                        "Paytm",
                        "Visa",
                        "Mastercard",
                        "RuPay",
                      ].map((name) => (
                        <div
                          key={name}
                          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 shadow-sm"
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 flex flex-col items-center gap-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-gray-400" /> Fast
                        Dispatch
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base leading-none">📦</span>{" "}
                        Tracking Number will be shared via WhatsApp after dispatch.
                      </div>
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
                            navigate(`/products/${product.slug}`);
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
                            <span className="text-xs font-bold text-gray-700">
                              {getProductReviewsInfo(product).avgRating}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              ({getProductReviewsInfo(product).reviewCount} reviews)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-400 line-through font-medium">
                              Rs. 1599.00
                            </span>
                            <span className="text-sm font-bold text-[#E83E44]">
                              Rs. {product.price.toFixed(2)}
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
    </AnimatePresence>
  );
}
