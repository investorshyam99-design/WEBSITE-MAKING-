import React, { useEffect, useState, useCallback } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useShop } from "../context/ShopContext";
import { db, auth } from "../lib/firebase";
import { collection, query, where, getDocs, doc, documentId } from "firebase/firestore";
import { Package, Truck, X, LogOut, User, MapPin, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AdminOrdersDashboard } from "../components/AdminDashboard";
import { useProducts } from "../data/products";
import { signOut } from "firebase/auth";

interface Order {
  id: string;
  orderNumber?: number;
  userId: string;
  productName: string;
  image?: string;
  size: string;
  quantity?: number;
  cartItems?: any[];
  customization?: string;
  customizationStatus?: string;
  advancePaid?: number;
  remainingCodAmount?: number;
  finalTotal?: number;
  price: number;
  status: string;
  createdAt: any;
  address?: string;
  phone?: string;
  fullName?: string;
  paymentMode?: string;
  paymentId?: string;
  trackingId?: string;
  courierName?: string;
}

export function AccountPage() {
  const { user, setIsLoginOpen, isAuthLoading } = useShop();
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses" | "wishlist">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { products } = useProducts();

  const handleImageClick = (order: Order) => {
    const product = products.find(p => p?.name === order?.productName || p?.id === (order as any)?.productId);
    if (product) {
      navigate(`/products/${product.slug}`);
    } else {
      const pid = (order as any).productId;
      if (pid) {
        navigate(`/products/${encodeURIComponent(pid)}`);
      }
    }
  };

  const fetchOrders = useCallback(async () => {
    if (isAuthLoading) return;
    try {
      setLoading(true);
      let q;
      let fetchedOrders = [];
      const ordersRef = collection(db, "orders");
      
      if (user) {
        q = query(ordersRef, where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        fetchedOrders = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...(doc.data() as any) })
        );
      } else {
        const guestOrderIds = JSON.parse(localStorage.getItem("guest_orders") || "[]");
        const guestPhone = localStorage.getItem("guest_phone");
        
        if (guestPhone) {
          q = query(ordersRef, where("phone", "==", guestPhone));
        } else if (guestOrderIds.length > 0) {
          q = query(ordersRef, where(documentId(), "in", guestOrderIds.slice(0, 30)));
        } else {
          setOrders([]);
          setLoading(false);
          return;
        }
        
        const snapshot = await getDocs(q);
        fetchedOrders = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...(doc.data() as any) })
        );
      }
      
      // Always filter out drafts and internal statuses
      fetchedOrders = fetchedOrders.filter((order) => {
        const s = (order.status || "").toLowerCase();
        const payStatus = (order.paymentStatus || "").toLowerCase();
        // Reject draft, pending, or abandoned orders
        if (s.includes("draft") || s.includes("abandoned") || s.includes("pending")) return false;
        if (payStatus.includes("pending") || payStatus.includes("failed")) return false;
        // Accept paid or advance paid or active fulfillment status
        return (
          s.includes("paid") ||
          s.includes("shipped") ||
          s.includes("delivered") ||
          s.includes("processing") ||
          s.includes("confirmed") ||
          s.includes("completed") ||
          s.includes("cancelled") ||
          payStatus.includes("paid") ||
          payStatus.includes("success") ||
          payStatus.includes("captured")
        );
      });
      
      // Sort ascending to assign sequential order numbers (1, 2, 3, 4...)
      const sortedAsc = [...fetchedOrders].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateA.getTime() - dateB.getTime();
      });
      
      let seq = 1;
      const mappedOrders = sortedAsc.map((order) => {
        let num = order.orderNumber;
        if (typeof num !== "number" || isNaN(num) || num <= 0 || num >= 10000) {
          num = seq;
        }
        seq = Math.max(seq + 1, num + 1);
        return {
          ...order,
          orderNumber: num,
        };
      });
      
      // Sort descending (newest first)
      const sortedOrders = mappedOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setOrders(sortedOrders);
    } catch (error) {
      console.warn("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2A44]"></div>
        </main>
        <Footer />
      </div>
    );
  }



  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 py-8 md:py-12">
        {user?.email !== "investorshyam99@gmail.com" && (
          <div className="flex flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B1B] uppercase tracking-tight">
               My Account
            </h1>
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        )}


          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm sticky top-24">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1E2A44] text-white flex items-center justify-center font-bold text-lg">
                    {(user?.name || user?.email || "G").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Welcome,</p>
                    <p className="font-black text-[#1B1B1B] truncate max-w-[140px]">{user?.name || user?.email || user?.phoneNumber || "Guest User"}</p>
                  </div>
                </div>
                <div className="flex flex-col p-2">
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-gray-100 text-[#1B1B1B]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <Package className="w-4 h-4" /> My Orders
                  </button>
                  {user && (
                    <>
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-gray-100 text-[#1B1B1B]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        <User className="w-4 h-4" /> Profile Details
                      </button>
                      <button 
                        onClick={() => setActiveTab('addresses')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'addresses' ? 'bg-gray-100 text-[#1B1B1B]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        <MapPin className="w-4 h-4" /> Saved Addresses
                      </button>
                      <button 
                        onClick={() => setActiveTab('wishlist')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'wishlist' ? 'bg-gray-100 text-[#1B1B1B]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        <Heart className="w-4 h-4" /> Wishlist
                      </button>
                    </>
                  )}
                  <div className="h-px bg-gray-100 my-2 mx-4"></div>
                  {user ? (
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        localStorage.removeItem('guest_phone');
                        localStorage.removeItem('guest_orders');
                        window.location.reload();
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Exit Tracking
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-black text-[#1B1B1B] uppercase tracking-tight mb-6">Order History</h2>
                  {loading ? (
                    <div className="text-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2A44] mx-auto mb-4"></div>
                      <p className="text-gray-500 font-medium">Loading your orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center bg-white p-12 shadow-sm border border-gray-100 rounded-xl">
                      <Package className="h-16 w-16 mx-auto text-gray-200 mb-4" />
                      <h2 className="text-lg font-bold text-[#1B1B1B] uppercase tracking-wider mb-2">
                        {user ? "No orders found" : "Track Your Order"}
                      </h2>
                      <p className="text-sm text-gray-500 mb-6">
                        {user ? "You haven't placed any orders yet." : "Sign in or enter your phone number to track your order."}
                      </p>
                      {!user ? (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto w-full">
                          <button
                            onClick={() => setIsLoginOpen(true)}
                            className="bg-[#1E2A44] text-white px-6 py-3 font-bold uppercase text-sm w-full sm:w-1/2 hover:bg-[#223A5E] transition-colors rounded-xl"
                          >
                            Log in
                          </button>
                          <button
                            onClick={() => {
                              const phone = window.prompt("Enter the phone number used during checkout:");
                              if (phone?.trim()) {
                                localStorage.setItem('guest_phone', phone.trim());
                                window.location.reload();
                              }
                            }}
                            className="bg-white border-2 border-[#1E2A44] text-[#1E2A44] px-6 py-3 font-bold uppercase text-sm w-full sm:w-1/2 hover:bg-gray-50 transition-colors rounded-xl"
                          >
                            Track Order
                          </button>
                        </div>
                      ) : (
                        <Link
                          to="/"
                          className="inline-block bg-[#1E2A44] text-white px-6 py-3 font-bold uppercase text-sm rounded-xl hover:bg-[#223A5E] transition-colors"
                        >
                          Start Shopping
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {!user && (
                        <div className="flex justify-end mb-4">
                          <button
                            onClick={() => {
                              const phone = window.prompt("Enter the phone number used during checkout:");
                              if (phone?.trim()) {
                                localStorage.setItem('guest_phone', phone.trim());
                                window.location.reload();
                              }
                            }}
                            className="text-xs font-bold uppercase tracking-wider text-[#1E2A44] hover:underline"
                          >
                            + Track Another Order
                          </button>
                        </div>
                      )}
                      {orders.map((order) => <OrderCard key={order.id} order={order} user={user} handleImageClick={handleImageClick} />)}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
                  <h2 className="text-xl font-black text-[#1B1B1B] uppercase tracking-tight mb-6">Profile Details</h2>
                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Name</label>
                      <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-bold text-[#1B1B1B]">
                        {user?.name || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Email</label>
                      <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-bold text-[#1B1B1B]">
                        {user?.email || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Phone Number</label>
                      <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 font-bold text-[#1B1B1B]">
                        {user?.phoneNumber || (user?.email?.startsWith("+") ? user?.email : "Not provided")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
                  <h2 className="text-xl font-black text-[#1B1B1B] uppercase tracking-tight mb-6">Saved Addresses</h2>
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">You have no saved addresses yet.</p>
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
                  <h2 className="text-xl font-black text-[#1B1B1B] uppercase tracking-tight mb-6">Wishlist</h2>
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Heart className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Your wishlist is empty.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}

function OrderCard({ order, user, handleImageClick }: { order: Order; user: any; handleImageClick: (order: Order) => void }) {
  const orderDate = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Just now";

  let effectiveQuantity = order.quantity;
  if (!effectiveQuantity) {
    if (order.price >= 1800) {
      if (order.price % 1499 === 0) effectiveQuantity = order.price / 1499;
      else if (order.price % 1099 === 0) effectiveQuantity = order.price / 1099;
      else if (order.price % 999 === 0) effectiveQuantity = order.price / 999;
      else if (order.price % 1149 === 0) effectiveQuantity = order.price / 1149;
      else effectiveQuantity = Math.max(1, Math.round(order.price / ((order?.productName || "").toLowerCase().includes('player') ? 1499 : 999)));
    } else {
      effectiveQuantity = 1;
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4 md:gap-6 flex-wrap">
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Order Date
            </p>
            <p className="font-semibold text-[#1B1B1B]">{orderDate}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Order #
            </p>
            <p className="font-semibold text-[#1B1B1B]">{order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Order Total
            </p>
            <p className="font-semibold text-[#1B1B1B]">
              ₹{(order.price || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Customization
            </p>
            <p className="font-semibold text-[#1B1B1B] text-sm">
              {order.customizationStatus === "YES" ? "YES" : "NO"}
            </p>
          </div>
          {order.customizationStatus === "YES" && (
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                Customization Amount
              </p>
              <p className="font-semibold text-[#1B1B1B] text-sm">
                ₹199
              </p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Paid
            </p>
            <p className="font-semibold text-green-600 text-sm">
              ₹{(order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : ((order.paymentMode === "full" ? (order.price || 0) : ((order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance")) ? 50 * effectiveQuantity : 0))))) || 0}
            </p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1">
            Status
          </p>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded ${
              order.status?.toLowerCase().includes('cancelled') 
                ? 'bg-red-100 text-red-800' 
                : order.status?.toLowerCase().includes('pending') 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {order.status || "Pending"}
            </span>
            {order.paymentMode !== "full" && (
               <div className="mt-1 text-right">
                 <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">COD Remaining</p>
                 <p className="font-black text-rose-600 text-sm">₹{(
                   order.codAmount !== undefined ? order.codAmount : (order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))))
                 ).toLocaleString("en-IN")}</p>
               </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div 
            className={`h-20 w-20 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden ${order.image ? 'cursor-pointer' : ''}`}
            onClick={() => handleImageClick(order)}
          >
            {order.image ? (
              <img src={order.image} alt={order.productName} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <Package className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-black text-[#1B1B1B] text-lg tracking-tight">
              {order.productName}
            </h3>
            {order.cartItems && order.cartItems.length > 0 ? (
              <div className="mt-2 space-y-1">
                {order.cartItems.map((item: any, idx: number) => (
                  <p key={idx} className="text-gray-600 text-sm font-medium">
                    {item?.quantity}x {item?.name} (Size: {item?.size})
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm font-medium mt-1">
                {effectiveQuantity}x Size: {order.size}
              </p>
            )}
            
            {order.trackingId && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                <p className="font-bold text-[#1E2A44] flex items-center gap-2 tracking-wider uppercase"><Truck className="h-4 w-4" /> Tracking Information</p>
                <p><strong className="font-semibold">Courier:</strong> {order.courierName}</p>
                <p><strong className="font-semibold">Tracking ID:</strong> {order.trackingId}</p>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <button 
              onClick={() => handleImageClick(order)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1B1B1B] text-sm font-bold rounded-lg transition-colors"
            >
              View Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
