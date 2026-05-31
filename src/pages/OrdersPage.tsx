import React, { useEffect, useState, useCallback } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useShop } from "../context/ShopContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Package, Truck, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AdminDashboard } from "../components/AdminDashboard";

interface Order {
  id: string;
  userId: string;
  productName: string;
  image?: string;
  size: string;
  quantity?: number;
  cartItems?: any[];
  customization?: string;
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

export function OrdersPage() {
  const { user, loginWithGoogle, isAuthLoading } = useShop();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    if (isAuthLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let q;
      const ordersRef = collection(db, "orders");
      if (user.email === "investorshyam99@gmail.com") {
        q = query(ordersRef);
      } else {
        q = query(ordersRef, where("userId", "==", user.uid));
      }

      const snapshot = await getDocs(q);
      const fetchedOrders = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...(doc.data() as any),
          } as Order)
      );

      fetchedOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      const displayedOrders = user.email === "investorshyam99@gmail.com"
        ? fetchedOrders
        : fetchedOrders.filter((o) => !o.status?.toLowerCase().includes("pending"));

      setOrders(displayedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center bg-white p-10 shadow-sm border border-gray-100 max-w-sm rounded">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-black text-[#1B1B1B] uppercase tracking-wider mb-2">
              Login Required
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Please sign in to view your orders.
            </p>
            <button
              onClick={loginWithGoogle}
              className="bg-[#1E2A44] text-white px-6 py-3 font-bold uppercase text-sm w-full hover:bg-[#223A5E] transition-colors"
            >
              Sign In with Google
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow max-w-[1200px] mx-auto w-full px-4 py-8 md:py-12">
        {user.email !== "investorshyam99@gmail.com" && (
          <div className="flex flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B1B] uppercase tracking-tight">
               My Orders
            </h1>
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2A44] mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white p-12 shadow-sm border border-gray-100 rounded">
             <Package className="h-16 w-16 mx-auto text-gray-200 mb-4" />
            <h2 className="text-lg font-bold text-[#1B1B1B] uppercase tracking-wider mb-2">
              No orders found
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#1B1B1B] text-white px-8 py-3 font-bold uppercase text-sm tracking-widest hover:bg-[#2A2A2A] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          user.email === "investorshyam99@gmail.com" ? (
             <AdminDashboard orders={orders} refreshOrders={fetchOrders} />
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {orders.map((order) => <OrderCard key={order.id} order={order} user={user} />)}
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}

function OrderCard({ order, user }: { order: Order; user: any }) {
  const orderDate = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Just now";

  // Heuristic for older orders that missed the quantity field
  let effectiveQuantity = order.quantity;
  if (!effectiveQuantity) {
    if (order.price >= 1800) {
      if (order.price % 1499 === 0) effectiveQuantity = order.price / 1499;
      else if (order.price % 1099 === 0) effectiveQuantity = order.price / 1099;
      else if (order.price % 999 === 0) effectiveQuantity = order.price / 999;
      else if (order.price % 1149 === 0) effectiveQuantity = order.price / 1149;
      else effectiveQuantity = Math.max(1, Math.round(order.price / (order.productName?.toLowerCase().includes('player') ? 1499 : 999)));
    } else {
      effectiveQuantity = 1;
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-6">
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Order Date
            </p>
            <p className="font-semibold text-[#1B1B1B]">{orderDate}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Total
            </p>
            <p className="font-semibold text-[#1B1B1B]">
              ₹{(order.price || 0).toLocaleString("en-IN")}
            </p>
            {(order.paymentMode === 'partial' || String(order.status).toLowerCase().includes('advance')) ? (
              <>
               <p className="text-[10px] font-bold text-green-600 mt-1 uppercase">Paid: ₹{(150 * effectiveQuantity).toLocaleString("en-IN")}</p>
               <p className="text-[10px] font-bold text-red-600 mt-1 uppercase">COD: ₹{((order.price || 0) + (50 * effectiveQuantity) - (150 * effectiveQuantity)).toLocaleString("en-IN")}</p>
              </>
            ) : order.paymentMode === 'full' ? (
               <p className="text-[10px] font-bold text-green-600 mt-1 uppercase">Paid: ₹{(order.price || 0).toLocaleString("en-IN")}</p>
            ) : null}
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1">
            Status
          </p>
          <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded ${order.status?.toLowerCase().includes('pending') ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
            {order.status || "Received"}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
            {order.image ? (
              <img src={order.image} alt={order.productName} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-black text-[#1B1B1B] text-lg uppercase tracking-tight">
              {order.productName}
            </h3>
            {order.cartItems && order.cartItems.length > 0 ? (
              <div className="mt-2 space-y-1">
                {order.cartItems.map((item: any, idx: number) => (
                  <p key={idx} className="text-gray-600 text-sm font-medium">
                    {item.quantity}x {item.name} (Size: {item.size})
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm font-medium mt-1">
                {effectiveQuantity}x Size: {order.size}
              </p>
            )}
            {order.customization && (
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                Custom: {order.customization}
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
        </div>
      </div>
    </div>
  );
}
