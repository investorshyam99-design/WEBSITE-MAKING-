import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useShop } from "../context/ShopContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  userId: string;
  productName: string;
  size: string;
  customization?: string;
  price: number;
  status: string;
  createdAt: any;
  address?: string;
  phone?: string;
}

export function OrdersPage() {
  const { user, loginWithGoogle } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        let q;
        const ordersRef = collection(db, "orders");
        // If the admin is viewing, let them see all orders
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

        // Sort by createdAt locally to ensure it works without complex composite indexes
        fetchedOrders.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-[#1B1B1B] uppercase tracking-tight">
             My Orders
          </h1>
          {user.email === "investorshyam99@gmail.com" && (
            <span className="bg-[#1E2A44] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-full">
              Admin View
            </span>
          )}
        </div>

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
          <div className="space-y-6">
            {orders.map((order) => {
              const orderDate = order.createdAt?.toDate?.()
                ? order.createdAt.toDate().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Just now";

              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                          Order Date
                        </p>
                        <p className="font-semibold text-[#1B1B1B]">
                          {orderDate}
                        </p>
                      </div>
                      <div>
                         <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                          Total
                        </p>
                        <p className="font-semibold text-[#1B1B1B]">
                          ₹{order.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      {user.email === "investorshyam99@gmail.com" && (
                         <div>
                          <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                            Customer
                          </p>
                          <p className="font-semibold text-[#1B1B1B]">
                            UID: {order.userId.slice(0, 5)}...
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-left md:text-right">
                       <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1">
                          Status
                        </p>
                        <span className="bg-green-100 text-green-800 text-xs font-black uppercase tracking-widest px-3 py-1 rounded">
                          {order.status || 'Received'}
                        </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-[#1B1B1B] text-lg uppercase tracking-tight">
                          {order.productName}
                        </h3>
                        <p className="text-gray-600 text-sm font-medium mt-1">
                          Size: {order.size}
                        </p>
                        {order.customization && (
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            Custom: {order.customization}
                          </p>
                        )}
                        {(order.address || order.phone) && (
                          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                             {order.phone && <p><strong>Phone:</strong> {order.phone}</p>}
                             {order.address && <p><strong>Address:</strong> {order.address}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
