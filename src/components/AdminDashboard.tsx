import React, { useState } from "react";
import { db } from "../lib/firebase";
import { getOrderCalculations } from "../lib/utils";
import { doc, updateDoc, deleteDoc, collection, query, orderBy, limit, getDocs, getDocsFromCache, getCountFromServer, where, startAfter } from "firebase/firestore";
import {
  Package,
  Search,
  Phone,
  MapPin,
  Copy,
  MessageCircle,
  Truck,
  Check,
  Trash2,
  ChevronDown,
  RefreshCw,
  Star,
  X,
  Edit2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminProfitsDashboard } from "./AdminProfitsDashboard";
import { AdminChatsList } from "./AdminChatsList";
import { useProducts } from "../data/products";

interface Order { [key: string]: any;
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
  customizationDeduction?: number;
  originalPrice?: number;
  advancePaid?: number;
  finalTotal?: number;
  price: number;
  remainingCodAmount?: number;
  status: string;
  createdAt: any;
  address?: string;
  phone?: string;
  fullName?: string;
  paymentMode?: string;
  paymentId?: string;
  trackingId?: string;
  trackingUrl?: string;
  courierName?: string;
  delhiveryShipmentId?: string;
  awbNumber?: string;
  amountPaid?: number;
  originalAmount?: number;
  deductionAmount?: number;
  finalTotalAmount?: number;
  adjustedAmount?: number;
  codAmount?: number;
  priceAdjustment?: number;
  city?: string;
  state?: string;
  pincode?: string;
  deliveryMethod?: string;
  expectedDeliveryStart?: string;
  expectedDeliveryEnd?: string;
  dispatchDate?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryPincode?: string;
}

const TABS = [
  { id: "new", label: "New Orders" },
  { id: "drafts", label: "Draft Orders" },
  { id: "abandoned", label: "Abandoned Carts" },
  { id: "chats", label: "🤖 AI Chats" },
  { id: "placed", label: "Order Placed" },
  { id: "delivered", label: "Delivered" },
  { id: "profits", label: "📊 My Profits" },
];

function generateWhatsAppLink(phone: string, text: string) {
  if (!phone) return "#";
  const cleanPhone = phone.replace(/\D/g, "");
  const finalPhone = cleanPhone.length > 10 ? cleanPhone : "91" + cleanPhone;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
}

export function AdminOrdersDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new");
  const [search, setSearch] = useState("");
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  const [counts, setCounts] = useState({ new: 0, drafts: 0, abandoned: 0, placed: 0, delivered: 0 });

  
  const fetchTabCounts = async () => {
    try {
        const cNew = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["Fully Paid", "Advance Paid", "Fampay", "Received"])));
        const cDrafts1 = await getCountFromServer(collection(db, "draft_orders"));
        const cDrafts2 = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["pending advance payment", "pending full payment", "pending_cart", "draft"])));
        const cAban = await getCountFromServer(collection(db, "abandoned_carts"));
        const cPlaced = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "Order Placed")));
        const cDelivered = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "Delivered")));
        
        setCounts({
            new: cNew.data().count,
            drafts: cDrafts1.data().count + cDrafts2.data().count,
            abandoned: cAban.data().count,
            placed: cPlaced.data().count,
            delivered: cDelivered.data().count
        });
    } catch (e) {
        console.warn("Failed to fetch order counts", e);
    }
  };

  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);
  const [lastDocs, setLastDocs] = useState<any[]>([]); // stack of previous last docs
  const [currentLastDoc, setCurrentLastDoc] = useState<any>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Reset pagination when tab changes
  React.useEffect(() => {
    setPage(1);
    setLastDocs([]);
    setCurrentLastDoc(null);
    setHasNextPage(true);
    refreshOrders(true);
  }, [activeTab]);


  const refreshOrders = async (reset = false, goBack = false) => {
    setIsLoadingOrders(true);
    if (reset) fetchTabCounts();
    try {
        let fetchedOrders: Order[] = [];

        // ABANDONED CARTS
        if (activeTab === "abandoned") {
            const q = query(collection(db, "abandoned_carts"), limit(200));
            let snapshot;
            try { snapshot = await getDocs(q); }
            catch (e: any) { 
                if (e.message?.includes("Quota")) snapshot = await getDocsFromCache(q); 
                else throw e;
            }
            
            fetchedOrders = snapshot.docs.map(doc => {
                 const data = doc.data() as any;
                 let productName = data.productName || "Order";
                 if (!data.productName && data.items) productName = data.items.map((i: any) => i.name).join(", ");
                 else if (!data.productName && data.cartItems) productName = data.cartItems.map((i: any) => i.name).join(", ");
                 return { id: doc.id, ...data, status: "abandoned", productName } as Order;
            });
            fetchedOrders.sort((a, b) => {
                const aTime = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
                const bTime = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
                return bTime - aTime;
            });
        } 
        // DRAFT ORDERS (Both old draft_orders and new pending orders)
        else if (activeTab === "drafts") {
            let oldDrafts: any[] = [];
            try {
                const qOld = query(collection(db, "draft_orders"), orderBy("createdAt", "desc"), limit(100));
                let snapOld;
                try { snapOld = await getDocs(qOld); } catch(e: any) { snapOld = await getDocsFromCache(qOld); }
                oldDrafts = snapOld.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch(e) { console.warn("Failed to fetch old drafts", e); }
            
            let newDrafts: any[] = [];
            try {
                const qNew = query(collection(db, "orders"), where("status", "in", ["pending advance payment", "pending full payment", "pending_cart", "draft"]), orderBy("createdAt", "desc"), limit(200));
                let snapNew;
                try { snapNew = await getDocs(qNew); } catch(e: any) { snapNew = await getDocsFromCache(qNew); }
                newDrafts = snapNew.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch(e) { console.warn("Failed to fetch new drafts", e); }

            fetchedOrders = [...oldDrafts, ...newDrafts].map(data => {
                 let productName = data.productName || "Order";
                 if (!data.productName && data.cartItems) productName = data.cartItems.map((i: any) => i.name).join(", ");
                 return { ...data, status: "pending draft", productName } as Order;
            });
            fetchedOrders.sort((a, b) => {
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });
        }
        // ALL OTHER TABS
        else {
            let conditions: any[] = [];
            if (activeTab === "new") conditions.push(where("status", "in", ["Fully Paid", "Advance Paid", "Fampay", "Received"]));
            else if (activeTab === "placed") conditions.push(where("status", "==", "Order Placed"));
            else if (activeTab === "delivered") conditions.push(where("status", "==", "Delivered"));
            else if (activeTab === "cancelled") conditions.push(where("status", "==", "cancelled"));
            
            conditions.push(orderBy("createdAt", "desc"));
            conditions.push(limit(300));
            
            const q = query.apply(null, [collection(db, "orders"), ...conditions] as any);
            let snapshot;
            try {
                snapshot = await getDocs(q);
            } catch (fetchErr: any) {
                if (fetchErr.message?.includes("Quota")) {
                    try { snapshot = await getDocsFromCache(q); } 
                    catch (cacheErr) {
                        const allDocs = await getDocsFromCache(collection(db, "orders"));
                        let validDocs = allDocs.docs;
                        if (activeTab === "new") validDocs = validDocs.filter(d => ["Fully Paid", "Advance Paid", "Fampay", "Received"].includes(d.data().status));
                        else if (activeTab === "placed") validDocs = validDocs.filter(d => d.data().status === "Order Placed");
                        else if (activeTab === "delivered") validDocs = validDocs.filter(d => d.data().status === "Delivered");
                        else if (activeTab === "cancelled") validDocs = validDocs.filter(d => d.data().status === "cancelled");
                        validDocs.sort((a, b) => {
                           const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
                           const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
                           return bTime - aTime;
                        });
                        snapshot = { docs: validDocs } as any;
                    }
                } else throw fetchErr;
            }

            fetchedOrders = snapshot.docs.map(doc => {
                 const data = doc.data() as any;
                 return { id: doc.id, ...data, productName: data.productName || "Order" } as Order;
            });
        }

        setCurrentOrders(fetchedOrders);
        setHasNextPage(false);
        if (reset) {
            setLastDocs([]);
        }
    } catch (e: any) {
        console.warn("Failed to fetch tab orders", e);
        if (e.message?.includes("Quota")) {
           // We might still fail if cache is empty
           console.log("Could not even load from cache due to quota/offline.");
        }
    } finally {
        setIsLoadingOrders(false);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
        setPage(p => p + 1);
        refreshOrders(false, false);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
        setPage(p => p - 1);
        refreshOrders(false, true);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (orderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this item? This cannot be undone.",
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "orders", orderId)).catch(() => {});
      await deleteDoc(doc(db, "abandoned_carts", orderId)).catch(() => {});
      await deleteDoc(doc(db, "draft_orders", orderId)).catch(() => {});
      refreshOrders();
    } catch (e: any) {
      console.error(e);
      alert("Failed to delete item. " + e.message);
    }
  };

  const handleUpdateTracking = async (
    orderId: string,
    trackingId: string,
    courierName: string,
    trackingUrl?: string
  ) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { trackingId, courierName, trackingUrl: trackingUrl || "" });
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update tracking");
    }
  };

  const handleUpdateOrderCost = async (
    orderId: string,
    costs: {
      productCost: number;
      shippingCost: number;
      additionalCost: number;
    },
  ) => {
    try {
      await updateDoc(doc(db, "orders", orderId), costs);
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update costs");
    }
  };

  const handleUpdatePrice = async (orderId: string, currentAdjustedAmount: number) => {
    const newPrice = prompt(
      "Enter the new adjusted amount (FINAL AMOUNT BEFORE ADDING EXISTING ADVANCE PAYMENT):",
      currentAdjustedAmount.toString(),
    );
    if (newPrice && !isNaN(Number(newPrice))) {
      try {
        const order = currentOrders.find(o => o.id === orderId);
        if (!order) return;
        
        const calc = getOrderCalculations(order);
        const adjustedAmount = Number(newPrice);
        const deductionAmount = calc.originalAmount - adjustedAmount;
        const finalTotalAmount = adjustedAmount + calc.amountPaid;
        const codAmount = adjustedAmount;
        
        const updateData: any = {
          adjustedAmount,
          deductionAmount,
          priceAdjustment: deductionAmount,
          finalTotalAmount,
          codAmount,
          amountPaid: calc.amountPaid,
          originalAmount: calc.originalAmount,
        };
        
        await updateDoc(doc(db, "orders", orderId), updateData);
        refreshOrders();
      } catch (e) {
        console.error(e);
        alert("Failed to update price");
      }
    }
  };

  const handleUpdateCustomizationStatus = async (orderId: string, status: string) => {
    try {
      const order = currentOrders.find(o => o.id === orderId);
      if (!order) return;
      
      const calc = getOrderCalculations(order);
      let deductionAmount = order.deductionAmount || 0;
      const wasYes = order.customizationStatus !== "NO";
      
      if (status === "NO" && wasYes) {
          deductionAmount = 199;
      } else if (status === "YES" && !wasYes) {
          deductionAmount = 0;
      }
      
      const adjustedAmount = calc.originalAmount - deductionAmount;
      const finalTotalAmount = adjustedAmount + calc.amountPaid;
      const codAmount = adjustedAmount;
      
      const updateData: any = {
        customizationStatus: status,
        adjustedAmount,
        deductionAmount,
        priceAdjustment: deductionAmount,
        finalTotalAmount,
        codAmount,
        amountPaid: calc.amountPaid,
        originalAmount: calc.originalAmount,
      };
      
      await updateDoc(doc(db, "orders", orderId), updateData);
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update customization status");
    }
  };

  // Filter orders into categories


  // Apply search
  let displayOrders = currentOrders;
  if (search) {
    const searchLower = search.toLowerCase();
    displayOrders = displayOrders.filter(
      (o) =>
        (o.orderNumber && o.orderNumber.toString().includes(searchLower)) ||
        o.id.toLowerCase().includes(searchLower) ||
        (o.phone && o.phone.toLowerCase().includes(searchLower)) ||
        (o.fullName && o.fullName.toLowerCase().includes(searchLower)) ||
        o.productName.toLowerCase().includes(searchLower),
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Mobile-first Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-black text-[#1E2A44] uppercase tracking-widest flex items-center gap-2">
              Operations
            </h2>
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A44] text-sm font-medium"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto px-2 scrollbar-hide border-t border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex-shrink-0 ${
                activeTab === tab.id
                  ? "border-[#1E2A44] text-[#1E2A44]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {tab.id === "new" && counts.new > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-[10px]">
                  {counts.new}
                </span>
              )}
              {tab.id === "drafts" && counts.drafts > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-[10px]">
                  {counts.drafts}
                </span>
              )}
              {tab.id === "abandoned" && counts.abandoned > 0 && (
                <span className="ml-2 bg-rose-100 text-rose-800 py-0.5 px-2 rounded-full text-[10px]">
                  {counts.abandoned}
                </span>
              )}
              {tab.id === "placed" && counts.placed > 0 && (
                <span className="ml-2 bg-emerald-100 text-emerald-800 py-0.5 px-2 rounded-full text-[10px]">
                  {counts.placed}
                </span>
              )}
              {tab.id === "delivered" && counts.delivered > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-800 py-0.5 px-2 rounded-full text-[10px]">
                  {counts.delivered}
                </span>
              )}
            </button>
          ))}
          <div className="relative flex items-center shrink-0">
             <select 
               className="ml-2 pl-3 pr-8 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 rounded-md shadow-sm outline-none cursor-pointer hover:bg-gray-50 appearance-none"
               value={activeTab === "cancelled" ? "cancelled" : "more"}
               onChange={(e) => {
                 if(e.target.value === "cancelled") setActiveTab("cancelled");
               }}
             >
               <option value="more" disabled>MORE ▼</option>
               <option value="cancelled">❌ Cancelled Orders</option>
             </select>
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {activeTab === "profits" ? (
          <AdminProfitsDashboard updateOrderCost={handleUpdateOrderCost} />
        ) : activeTab === "chats" ? (
          <AdminChatsList />
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              No {activeTab} orders found.
            </p>
          </div>
        ) : (
          displayOrders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              onUpdateStatus={(s) => handleUpdateStatus(order.id, s)}
              onDelete={() => handleDelete(order.id)}
              onUpdateTracking={(t, c) => handleUpdateTracking(order.id, t, c)}
              onUpdatePrice={(p) => handleUpdatePrice(order.id, p)}
              onUpdateCustomizationStatus={(s) => handleUpdateCustomizationStatus(order.id, s)}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!["profits", "chats"].includes(activeTab) && (currentOrders.length > 0) && (
        <div className="flex justify-between items-center max-w-3xl mx-auto px-4 py-4">
            <button 
                onClick={handlePrevPage} 
                disabled={page === 1 || isLoadingOrders}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
                ← Previous
            </button>
            <span className="text-sm font-bold text-gray-500">
                Page {page}
            </span>
            <button 
                onClick={handleNextPage} 
                disabled={!hasNextPage || isLoadingOrders}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
                Next →
            </button>
        </div>
      )}
    </div>
  );
}

function AdminOrderCard({
  order,
  activeTab,
  onUpdateStatus,
  onDelete,
  onUpdateTracking,
  onUpdatePrice,
  onUpdateCustomizationStatus,
}: {
  order: Order;
  activeTab: string;
  onUpdateStatus: (s: string) => void;
  onDelete: () => void;
  onUpdateTracking: (t: string, c: string, url: string) => void;
  onUpdatePrice: (p: number) => void;
  onUpdateCustomizationStatus: (status: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [trackingId, setTrackingId] = useState(order.trackingId || "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");
  const [courierName, setCourierName] = useState(order.courierName || "");
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const calc = getOrderCalculations(order);
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [fulfillmentSuccess, setFulfillmentSuccess] = useState("");
  const [fulfillmentErr, setFulfillmentErr] = useState("");
  const navigate = useNavigate();
  const { products } = useProducts();


  const [isShippingDelhivery, setIsShippingDelhivery] = useState(false);
  
  const handleDelhiveryShipment = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (order.delhiveryAwb || order.delhiveryShipmentId || order.awbNumber || order.trackingId) {
      alert(`SHIPMENT ALREADY CREATED\n\nAWB:\n${order.delhiveryAwb || order.delhiveryShipmentId || order.awbNumber || order.trackingId}`);
      return;
    }

    if (!confirm(`Are you sure you want to Fulfill with Delhivery for Order ${order.orderNumber ? `#${order.orderNumber}` : "Order number unavailable"}?`)) {
      return;
    }
    
    setIsShippingDelhivery(true);
    try {
      const response = await fetch("/api/delhivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", orderId: order.id })
      });

      const data = await response.json();
      if (!data.success) {
        const fullErr = `DELHIVERY SHIPMENT FAILED\n\nReason:\n${data.error}\n\nHTTP:\n${data.delhiveryStatus || 400}\n\nResponse:\n${JSON.stringify(data.delhiveryResponse || {}, null, 2)}`;
        throw new Error(fullErr);
      }

      const awb = data.awb;
      
      // Update order in Firestore
      
      
      
      await updateDoc(doc(db, "orders", order.id), {
         awbNumber: awb,
         delhiveryShipmentId: awb,
         shippingProvider: "Delhivery",
         shippingStatus: "Manifested",
         courierName: "Delhivery",
         trackingId: awb,
         trackingUrl: `https://www.delhivery.com/track/package/${awb}`,
         shipmentCreatedAt: new Date().toISOString()
      });
      
      alert("Success! Delhivery shipment created. AWB: " + awb);
      window.location.reload(); // Refresh to show new state
    } catch (err: any) {
      console.error(err);
      alert(err.message); setFulfillmentErr(err.message);
    } finally {
      setIsShippingDelhivery(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const product = products.find((p) => p.name === order.productName || p.id === (order as any).productId);
    if (product) {
      navigate(`/product/${product.slug}`);
    } else {
      const pid = (order as any).productId;
      if (pid) {
        navigate(`/product/${encodeURIComponent(pid)}`);
      }
    }
  };

  const orderDate = (() => {
    if (!order.createdAt) return "Just now";
    try {
      const d = typeof order.createdAt?.toDate === 'function' 
        ? order.createdAt.toDate() 
        : new Date(order.createdAt);
      if (isNaN(d.getTime())) return "Just now";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch(e) {
      return "Just now";
    }
  })();

  const customerName = order.fullName || "Guest Customer";
  const paymentLink = `https://jerseyunicorn.com/checkout?order=${order.id}`;

  // Heuristic for older orders that missed the quantity field
  let effectiveQuantity = order.quantity;
  if (!effectiveQuantity) {
    if (order.price >= 1800) {
      if (order.price % 1499 === 0) effectiveQuantity = order.price / 1499;
      else if (order.price % 1099 === 0) effectiveQuantity = order.price / 1099;
      else if (order.price % 999 === 0) effectiveQuantity = order.price / 999;
      else if (order.price % 1149 === 0) effectiveQuantity = order.price / 1149;
      else
        effectiveQuantity = Math.max(
          1,
          Math.round(
            order.price /
              (order.productName?.toLowerCase().includes("player")
                ? 1499
                : 999),
          ),
        );
    } else {
      effectiveQuantity = 1;
    }
  }

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleWhatsApp = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    window.open(generateWhatsAppLink(order.phone || "", text), "_blank");
  };

  // WhatsApp Templates
  const displayOrderNumber = order.orderNumber ? `#${order.orderNumber}` : "Order number unavailable";
  const templates = {
    orderReceived: `Hey ${customerName} 👋\n\nYour Jersey Unicorn order ${displayOrderNumber} has been received successfully ⚽\n\nWe’ll update you once shipped 🚚`,
    draftReminder: `Hey ${customerName},\n\nYour Jersey Unicorn order ${displayOrderNumber} is waiting for confirmation ⚽\n\nComplete your order here:\n${paymentLink}`,
    codConfirm: `Please complete the ₹50 confirmation payment to process your COD order ${displayOrderNumber} ⚽\n\nLink: ${paymentLink}`,
    shipped: `Your Jersey Unicorn order ${displayOrderNumber} has been shipped 🚚\n\nTracking ID: ${trackingId}\nCourier: ${courierName}`,
    delivery: `Your Jersey Unicorn order ${displayOrderNumber} has been delivered ⚽🔥\n\nTag us on Instagram @jerseyunicorn1 to get featured ❤️`,
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden mb-4">
      {/* Compact Header (Always visible) */}
      <div
        className="p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={handleImageClick}
        >
          {order.image ? (
            <img
              src={order.image}
              alt="Product"
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          ) : (
            <Package className="h-6 w-6 m-auto text-gray-400 mt-5" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-[#1E2A44] text-sm truncate pr-2 flex items-center gap-2">
                <span className="text-[#38D9A9]">{order.orderNumber ? `#${order.orderNumber}` : "Order number unavailable"}</span>
                {customerName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {order.productName}
              </p>
            </div>
            <div className="text-right">
              <div className="flex justify-end items-center gap-2">
                <p className="font-black text-[#1B1B1B] text-sm">
                  ₹{(order.finalTotalAmount !== undefined ? order.finalTotalAmount : ((order.price || 0) + (order.paymentMode === "full" ? 0 : (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid !== undefined ? order.advancePaid : (order.paymentMode === "partial" || String(order.status).toLowerCase().includes("advance") ? 50 * effectiveQuantity : 0)))))).toLocaleString("en-IN")}
                </p>
                <button
                  title="Edit Price"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdatePrice(order.adjustedAmount ?? order.codAmount ?? order.remainingCodAmount ?? Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))));
                  }}
                  className="text-gray-400 hover:text-[#1E2A44] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {((order.paymentMode === "partial" ||
                String(order.status).toLowerCase().includes("advance") || String(order.status).toLowerCase() === "fampay") && order.paymentMode !== "full") && (
                <p className="text-[10px] font-bold text-red-600 mt-1 uppercase">
                  COD: ₹
                  {(
                      order.codAmount !== undefined ? order.codAmount : (order.adjustedAmount !== undefined ? order.adjustedAmount : (order.remainingCodAmount !== undefined ? order.remainingCodAmount : Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0))))))
                    ).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-gray-100 text-gray-600">
              {activeTab === "new" ? ((order.status === "Fampay" || order.status === "Advance Paid (Fampay)") ? "Fampay" : order.status || "Received") : activeTab}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
              {orderDate}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Actions & Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-4">
          {/* Detailed Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-gray-100">
            <div className="col-span-2 flex flex-col gap-2 bg-gray-50 p-3 rounded border border-gray-100">

              {/* Breakdown Fields */}
              {order.productSubtotal !== undefined && (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Product Subtotal</p>
                    <p className="font-semibold text-gray-800 text-sm">₹{order.productSubtotal.toLocaleString("en-IN")}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Delivery Type</p>
                    <p className="font-semibold text-gray-800 text-sm">{order.deliveryType || "NORMAL"}</p>
                  </div>

                  {order.fastDeliveryCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Fast Delivery Charge</p>
                      <p className="font-semibold text-gray-800 text-sm">₹{order.fastDeliveryCharge.toLocaleString("en-IN")}</p>
                    </div>
                  )}

                  {order.codHandlingCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">COD Handling Charge</p>
                      <p className="font-semibold text-gray-800 text-sm">₹{order.codHandlingCharge.toLocaleString("en-IN")}</p>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 my-1"></div>
                </>
              )}

              <div className="flex justify-between items-center">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  TOTAL ORDER VALUE
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-black text-gray-800 text-sm">
                    ₹{calc.finalTotalAmount.toLocaleString("en-IN")}
                  </p>
                  <button
                    title="Edit Total"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePrice(order.adjustedAmount ?? order.codAmount ?? order.remainingCodAmount ?? Math.max(0, (order.price || 0) - (order.amountPaid !== undefined ? order.amountPaid : (order.advancePaid || (order.paymentMode === "partial" ? 50 * effectiveQuantity : 0)))));
                    }}
                    className="text-gray-400 hover:text-[#1E2A44] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {calc.paymentMode === "full" ? (
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    PAYMENT
                  </p>
                  <p className="font-black text-green-600 text-sm">
                    FULLY PAID (₹{calc.amountPaid.toLocaleString("en-IN")})
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                      PAID / ADVANCE
                    </p>
                    <p className="font-black text-green-600 text-sm">
                      ₹{calc.amountPaid.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                      TO COLLECT (COD)
                    </p>
                    <p className="font-black text-red-600 text-sm">
                      ₹{calc.codAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  PRICE DEDUCTION
                </p>
                <p className="font-black text-gray-800 text-sm">
                  ₹{order.deductionAmount || order.priceAdjustment || (order.customizationStatus === "NO" ? "199" : "0")}
                </p>
              </div>
            </div>
            
            <div className="col-span-2">
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                Items
              </p>
              {order.cartItems && order.cartItems.length > 0 ? (
                <div className="space-y-1">
                  {order.cartItems.map((item: any, idx: number) => (
                    <p key={idx} className="font-semibold text-gray-800">
                      {item.quantity}x {item.name} (Size: {item.size})
                    </p>
                  ))}
                </div>
              ) : (
                <p className="font-semibold text-gray-800">
                  {effectiveQuantity}x Size: {order.size}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                Customization
              </p>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-gray-800">
                  {order.customization || "None"}
                </p>
                {order.customization && (
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] font-bold text-gray-500 uppercase">Status:</span>
                     <select 
                       className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 border border-gray-200 outline-none cursor-pointer"
                       value={order.customizationStatus || "YES"}
                       onChange={(e) => onUpdateCustomizationStatus(e.target.value)}
                       onClick={(e) => e.stopPropagation()}
                     >
                       <option value="YES">YES</option>
                       <option value="NO">NO</option>
                     </select>
                     
                   </div>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                Phone
              </p>
              <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                <span className="font-semibold text-gray-800">
                  {order.phone || "No Phone provided"}
                </span>
                {order.phone && (
                  <button
                    onClick={(e) => handleCopy(e, order.phone!)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            {order.address && (
              <div className="col-span-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Address
                </p>
                <div className="flex items-start justify-between bg-gray-50 px-2 py-1.5 rounded gap-2">
                  <span className="font-semibold text-gray-800 leading-tight">
                    {order.address}
                  </span>
                  <button
                    onClick={(e) => handleCopy(e, order.address!)}
                    className="text-gray-400 hover:text-gray-600 mt-0.5"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons based on Tab */}
          <div className="space-y-2">
            {fulfillmentErr && (
              <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-md border border-red-100 break-words">
                ⚠️ {fulfillmentErr}
              </p>
            )}
            {fulfillmentSuccess && (
              <p className="text-[11px] font-bold text-green-600 bg-green-50 p-2 rounded-md border border-green-100 break-words">
                ✅ {fulfillmentSuccess}
              </p>
            )}
            {activeTab === "new" && (
              <>
                {(order.awbNumber || order.delhiveryShipmentId || order.trackingId) ? (
                  <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                    <p className="text-xs font-bold text-green-700 uppercase mb-1">Shipment Created</p>
                    <p className="text-[11px] text-green-600 mb-2 font-mono">AWB: {order.awbNumber || order.delhiveryShipmentId || order.trackingId}</p>
                    <div className="flex gap-2">
                       <a href={order.trackingUrl || `https://www.delhivery.com/track/package/${order.awbNumber || order.delhiveryShipmentId || order.trackingId}`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">Track</a>
                       <a href={`/api/delhivery?action=label&awb=${order.awbNumber || order.delhiveryShipmentId || order.trackingId}`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">View Label</a>
                    </div>
                  </div>
                ) : (
                <button
                  onClick={handleDelhiveryShipment}
                  disabled={isShippingDelhivery}
                  className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 disabled:opacity-50"
                >
                  <Package className="h-4 w-4" /> {isShippingDelhivery ? "Manifesting..." : "Fulfill with Delhivery"}
                </button>
                )}
                <button
                  onClick={() => onUpdateStatus("Fampay")}
                  className="w-full py-2.5 bg-[#1E2A44] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2"
                >
                  <Check className="h-4 w-4" /> Fampay
                </button>
                <button
                  onClick={() => onUpdateStatus("Order Placed")}
                  className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2"
                >
                  <Check className="h-4 w-4" /> Move to Order Placed
                </button>
                <button
                  onClick={(e) => handleWhatsApp(e, templates.orderReceived)}
                  className="w-full py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2"
                >
                  <MessageCircle className="h-4 w-4" /> Order Received
                </button>

                {showTrackingForm ? (
                  <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm space-y-3 mb-2">
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                    >
                      <option value="">Select Courier</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="BlueDart">BlueDart</option>
                      <option value="DTDC">DTDC</option>
                      <option value="XpressBees">XpressBees</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="India Post">India Post</option>
                      <option value="Ekart">Ekart</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tracking Number"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowTrackingForm(false)}
                        className="flex-1 py-2 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onUpdateTracking(trackingId, courierName, trackingUrl);
                          onUpdateStatus("Shipped");
                          window.open(
                            generateWhatsAppLink(
                              order.phone || "",
                              templates.shipped,
                            ),
                            "_blank",
                          );
                          setShowTrackingForm(false);
                        }}
                        className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-1"
                      >
                        <Truck className="h-3 w-3" /> Save & Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTrackingForm(true)}
                    className="w-full py-2.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 border border-blue-200 mb-2"
                  >
                    <Truck className="h-4 w-4" /> Add Tracking
                  </button>
                )}

                <button
                  onClick={() => onUpdateStatus("Delivered")}
                  className="w-full py-2.5 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check className="h-4 w-4" /> Mark Delivered
                </button>
              </>
            )}

            {activeTab === "placed" && (
              <>
                
                <button
                  onClick={() => onUpdateStatus("Received")}
                  className="w-full py-2.5 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm border border-gray-200 mb-2 hover:bg-gray-200"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" /> Move to New
                  Orders
                </button>
                <button
                  onClick={() => onUpdateStatus("Delivered")}
                  className="w-full py-2.5 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900"
                >
                  <Check className="h-4 w-4" /> Mark Delivered
                </button>
              </>
            )}

            {activeTab === "drafts" && (
              <>
                <button
                  onClick={() => onUpdateStatus("Fampay")}
                  className="w-full py-2.5 bg-[#1E2A44] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2"
                >
                  <Check className="h-4 w-4" /> Fampay
                </button>
                <button
                  onClick={(e) => handleWhatsApp(e, templates.draftReminder)}
                  className="w-full py-2.5 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" /> Payment Reminder
                </button>
                <button
                  onClick={(e) => handleWhatsApp(e, templates.codConfirm)}
                  className="w-full py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" /> COD Reminder
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-full py-2.5 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 border border-red-200"
                >
                  <Trash2 className="h-4 w-4" /> Delete Draft
                </button>
              </>
            )}

            {activeTab === "abandoned" && (
              <>
                <button
                  onClick={(e) =>
                    handleWhatsApp(e, "Your Jersey Unicorn cart is waiting ⚽")
                  }
                  className="w-full py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" /> Send Reminder
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-full py-2.5 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 border border-red-200"
                >
                  <Trash2 className="h-4 w-4" /> Delete Abandoned
                </button>
              </>
            )}

            {activeTab === "cancelled" && (
              <>
                <button
                  onClick={() => onUpdateStatus("Received")}
                  className="w-full py-2.5 bg-green-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-green-700"
                >
                  <RefreshCw className="h-4 w-4" /> Restore Order
                </button>
              </>
            )}
            {activeTab === "delivered" && (
              <>
                <button
                  onClick={(e) => handleWhatsApp(e, templates.delivery)}
                  className="w-full py-2.5 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <Star className="h-4 w-4" /> Review Request
                </button>
                <button
                  onClick={(e) =>
                    handleWhatsApp(
                      e,
                      `Hey ${customerName} 👋\n\nIt's been a while!\n\nReady for your next t-shirt? Check out our new arrivals ⚽\n\nJersey Unicorn`,
                    )
                  }
                  className="w-full py-2.5 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw className="h-4 w-4" /> Reorder Reminder
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
