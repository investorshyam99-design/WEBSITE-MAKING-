import React, { useState, useMemo } from "react";
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
  Loader2,
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
  { id: "placed", label: "Order Placed" },
  { id: "delivered", label: "Delivered" },
  { id: "rto", label: "RTO" },
  { id: "cancelled", label: "Cancelled" },
  { id: "profits", label: "📊 My Profits" },
  { id: "chats", label: "🤖 AI Chats" },
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
  const [editingPaymentOrder, setEditingPaymentOrder] = useState<any | null>(null);
  const [paymentEditTotal, setPaymentEditTotal] = useState<string>("");
  const [paymentEditPaid, setPaymentEditPaid] = useState<string>("");
  const [paymentEditCod, setPaymentEditCod] = useState<string>("");
  const [initialPaymentEditTotal, setInitialPaymentEditTotal] = useState<string>("");
  const [initialPaymentEditPaid, setInitialPaymentEditPaid] = useState<string>("");
  const [initialPaymentEditCod, setInitialPaymentEditCod] = useState<string>("");
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  const [counts, setCounts] = useState({ new: 0, drafts: 0, placed: 0, delivered: 0, rto: 0, cancelled: 0 });

  
  const fetchTabCounts = async () => {
    try {
        const cNew = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["Fully Paid", "Advance Paid", "Fampay", "Received"])));
        const cDrafts1 = await getCountFromServer(collection(db, "draft_orders"));
        const cDrafts2 = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["pending advance payment", "pending full payment", "pending_cart", "draft"])));
        const cPlaced = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "Order Placed")));
        const cDelivered = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "Delivered")));
        const cRto = await getCountFromServer(query(collection(db, "orders"), where("status", "==", "RTO")));
        const cCancelled = await getCountFromServer(query(collection(db, "orders"), where("status", "in", ["cancelled", "Cancelled"])));
        
        setCounts({
            new: cNew.data().count,
            drafts: cDrafts1.data().count + cDrafts2.data().count,
            placed: cPlaced.data().count,
            delivered: cDelivered.data().count,
            rto: cRto.data().count,
            cancelled: cCancelled.data().count
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

        // DRAFT ORDERS (Both old draft_orders and new pending orders)
        if (activeTab === "drafts") {
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
            else if (activeTab === "rto") conditions.push(where("status", "==", "RTO"));
            else if (activeTab === "cancelled") conditions.push(where("status", "in", ["cancelled", "Cancelled"]));
            
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
                        if (activeTab === "new") validDocs = validDocs.filter((d: any) => ["Fully Paid", "Advance Paid", "Fampay", "Received"].includes(d.data().status));
                        else if (activeTab === "placed") validDocs = validDocs.filter((d: any) => d.data().status === "Order Placed");
                        else if (activeTab === "delivered") validDocs = validDocs.filter((d: any) => d.data().status === "Delivered");
                        else if (activeTab === "rto") validDocs = validDocs.filter((d: any) => d.data().status === "RTO");
                        else if (activeTab === "cancelled") validDocs = validDocs.filter((d: any) => d.data().status === "cancelled" || d.data().status === "Cancelled");
                        validDocs.sort((a: any, b: any) => {
                           const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
                           const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
                           return bTime - aTime;
                        });
                        snapshot = { docs: validDocs } as any;
                    }
                } else throw fetchErr;
            }

            fetchedOrders = snapshot.docs.map((doc: any) => {
                 const data = doc.data() as any;
                 return { id: doc.id, ...data, productName: data.productName || "Order" } as Order;
            });
        }
        
        setCurrentOrders(fetchedOrders);
    } catch (err) {
        console.error("Error fetching orders:", err);
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

    const handleEditPayment = (order: any, calc: any) => {
    setEditingPaymentOrder(order);
    
    const initialTotal = String(calc.finalTotalAmount ?? 0);
    const initialPaid = String(calc.amountPaid ?? 0);
    const initialCod = String(calc.codAmount ?? 0);
    
    setInitialPaymentEditTotal(initialTotal);
    setInitialPaymentEditPaid(initialPaid);
    setInitialPaymentEditCod(initialCod);
    
    setPaymentEditTotal(initialTotal);
    setPaymentEditPaid(initialPaid);
    setPaymentEditCod(initialCod);
  };

  const handleSavePaymentEdit = async () => {
    if (!editingPaymentOrder) return;
    try {
      const newTotal = Number(paymentEditTotal);
      const newPaid = Number(paymentEditPaid);
      const newCod = Number(paymentEditCod);

      if (isNaN(newTotal) || isNaN(newPaid) || isNaN(newCod)) {
        alert("Please enter valid numbers");
        return;
      }
      
      if (newTotal < 0 || newPaid < 0 || newCod < 0) {
        alert("Payment values cannot be negative");
        return;
      }

      const updateData: any = {};
      
      // ONLY update fields that actually changed
      if (paymentEditTotal !== initialPaymentEditTotal) {
          updateData.totalOrderValue = newTotal;
          updateData.finalTotalAmount = newTotal;
      }
      if (paymentEditPaid !== initialPaymentEditPaid) {
          updateData.amountPaid = newPaid;
          updateData.advancePaid = newPaid;
      }
      if (paymentEditCod !== initialPaymentEditCod) {
          updateData.codAmount = newCod;
          updateData.adjustedAmount = newCod;
      }

      if (Object.keys(updateData).length > 0) {
          await updateDoc(doc(db, "orders", editingPaymentOrder.id), updateData);
          refreshOrders();
      }
      setEditingPaymentOrder(null);
    } catch (e) {
      console.error("Error updating payment", e);
      alert("Failed to update payment");
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


  const groupedOrders = useMemo(() => {
    const groups = new Map<string, Order[]>();
    
    displayOrders.forEach(order => {
      let groupId = "";
      if (order.phone) {
         let p = order.phone.replace(/\D/g, "");
         if (p.length > 10) p = p.slice(-10);
         groupId = "phone_" + p;
      } else if (order.userId && order.userId !== "guest") {
         groupId = "user_" + order.userId;
      } else if (order.fullName) {
         groupId = "name_" + order.fullName.toLowerCase().trim();
      } else {
         groupId = "order_" + order.id;
      }
      
      if (!groups.has(groupId)) {
         groups.set(groupId, []);
      }
      groups.get(groupId)!.push(order);
    });
    
    return Array.from(groups.entries()).map(([id, orders]) => ({
      id,
      customerName: orders[0].fullName || "Unknown Customer",
      phone: orders[0].phone || "",
      orders
    }));
  }, [displayOrders]);

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
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        {isLoadingOrders ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#1E2A44] mb-4" />
            <p className="text-gray-500 font-medium">Loading orders...</p>
          </div>
        ) : activeTab === "profits" ? (
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
          groupedOrders.map((group) => (
            <AdminCustomerGroupCard
              key={group.id}
              group={group}
              activeTab={activeTab}
              handleUpdateStatus={handleUpdateStatus}
              handleUpdateTracking={handleUpdateTracking}
              handleDelete={handleDelete}
              onEditPayment={handleEditPayment}
              handleUpdatePrice={handleUpdatePrice}
              handleUpdateCustomizationStatus={handleUpdateCustomizationStatus}
              refreshOrders={refreshOrders}
            />
          ))
        )}

        {/* Pagination Controls */}
        {!search && ["new", "placed", "delivered", "rto", "cancelled"].includes(activeTab) && (
          <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-bold uppercase text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-gray-700">Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className="px-4 py-2 text-sm font-bold uppercase text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Payment Edit Modal */}
      {editingPaymentOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-[#1B1B1B]">Edit Payment Totals</h3>
              <button 
                onClick={() => setEditingPaymentOrder(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Order Value</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold">₹</span>
                  </div>
                  <input
                    type="number"
                    value={paymentEditTotal}
                    onChange={e => setPaymentEditTotal(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-[#1B1B1B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Advance / Amount Paid</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold">₹</span>
                  </div>
                  <input
                    type="number"
                    value={paymentEditPaid}
                    onChange={e => setPaymentEditPaid(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-[#1B1B1B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">To Collect (COD Amount)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold">₹</span>
                  </div>
                  <input
                    type="number"
                    value={paymentEditCod}
                    onChange={e => setPaymentEditCod(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-[#1B1B1B]"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setEditingPaymentOrder(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePaymentEdit}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function AdminCustomerGroupCard({
  group,
  activeTab,
  handleUpdateStatus: onUpdateStatus,
  handleUpdateTracking: onUpdateTracking,
  handleDelete: onDelete,
  onEditPayment,
  handleUpdatePrice: onUpdatePrice,
  handleUpdateCustomizationStatus: onUpdateCustomizationStatus,
  refreshOrders,
}: any) {
  const [isFulfillingAll, setIsFulfillingAll] = useState(false);
  const [isMovingAll, setIsMovingAll] = useState(false);
  const [showConfirmFulfill, setShowConfirmFulfill] = useState(false);
  const [fulfillResults, setFulfillResults] = useState<{id: string, success: boolean, msg: string}[]>([]);
  const [moveResults, setMoveResults] = useState<{id: string, success: boolean, msg: string}[]>([]);

  // Calculate totals
  let totalOrderValue = 0;
  let totalPaid = 0;
  let totalCod = 0;

  group.orders.forEach((o: any) => {
    const calc = getOrderCalculations(o);
    totalOrderValue += (calc.finalTotalAmount || 0);
    totalPaid += (calc.amountPaid || 0);
    totalCod += (calc.codAmount || 0);
  });

  const handleFulfillAllClick = () => {
    // 1. Check for already fulfilled orders
    const unfulfilled = group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId));
    if (unfulfilled.length === 0) {
      alert("All orders in this group are already fulfilled.");
      return;
    }
    
    // 2. Validate shipping details consistency
    const first = unfulfilled[0];
    const basePhone = String(first.phone).replace(/\D/g, '').slice(-10);
    const baseAddress = String(first.address).toLowerCase().trim();
    const basePincode = String(first.pincode).toLowerCase().trim();
    const baseType = (first.deliveryType && (String(first.deliveryType).toLowerCase() === "fast" || String(first.deliveryType).toLowerCase() === "express")) ? "fast" : "normal";
    
    for (const o of unfulfilled) {
       const p = String(o.phone).replace(/\D/g, '').slice(-10);
       const a = String(o.address).toLowerCase().trim();
       const pin = String(o.pincode).toLowerCase().trim();
       const t = (o.deliveryType && (String(o.deliveryType).toLowerCase() === "fast" || String(o.deliveryType).toLowerCase() === "express")) ? "fast" : "normal";
       
       if (p !== basePhone || pin !== basePincode) {
           alert("Cannot combine shipments: customer shipping details differ.\n\nPlease fulfill them separately.");
           return;
       }
       if (t !== baseType) {
           alert("These orders have different delivery types and cannot be combined into one shipment.\n\nPlease fulfill them separately.");
           return;
       }
    }
    
    setShowConfirmFulfill(true);
  };

  const handleFulfillAllConfirm = async () => {
    setShowConfirmFulfill(false);
    setIsFulfillingAll(true);
    setFulfillResults([]);
    
    const unfulfilled = group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId));
    
    if (unfulfilled.length === 0) {
       setIsFulfillingAll(false);
       return;
    }
    
    try {
        const response = await fetch("/api/delhivery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create_combined", orderIds: unfulfilled.map((o: any) => o.id) })
        });
        const data = await response.json();
        
        const results = [];
        if (!data.success) {
           results.push({ id: "Group", success: false, msg: data.error || "Failed" });
        } else {
           const awb = data.awb;
           for (const order of unfulfilled) {
               // Update local UI immediately for responsiveness (real-time listener will also fire)
               results.push({ id: order.orderNumber || order.id, success: true, msg: "AWB " + awb });
           }
        }
        setFulfillResults(results);
    } catch (err: any) {
        setFulfillResults([{ id: "Group", success: false, msg: err.message }]);
    }
    setIsFulfillingAll(false);
  };

  const handleMoveAllToPlaced = async () => {
    setIsMovingAll(true);
    setMoveResults([]);
    const results = [];
    for (const order of group.orders) {
      try {
        onUpdateStatus(order.id, "Order Placed");
        results.push({ id: order.orderNumber || order.id, success: true, msg: "Moved successfully" });
      } catch (err: any) {
        results.push({ id: order.orderNumber || order.id, success: false, msg: err.message });
      }
    }
    setMoveResults(results);
    setIsMovingAll(false);
  };
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false);
  
  const handleMarkAllDelivered = async () => {
    setIsMarkingDelivered(true);
    setMoveResults([]);
    const results = [];
    for (const order of group.orders) {
      if (String(order.status).toLowerCase() === "delivered") {
         results.push({ id: order.orderNumber || order.id, success: false, msg: "Already delivered" });
         continue;
      }
      try {
        onUpdateStatus(order.id, "Delivered");
        results.push({ id: order.orderNumber || order.id, success: true, msg: "Marked as Delivered" });
      } catch (err: any) {
        results.push({ id: order.orderNumber || order.id, success: false, msg: err.message });
      }
    }
    setMoveResults(results);
    setIsMarkingDelivered(false);
  };


  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Group Header */}
      <div className="bg-[#1E2A44] p-4 text-white">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-black text-lg tracking-wider uppercase">{group.customerName}</h3>
            <p className="text-xs text-blue-200 font-bold tracking-widest">{group.orders.length} ORDER{group.orders.length !== 1 ? 'S' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200 uppercase font-bold tracking-widest">Total Order Value: <span className="text-white">₹{totalOrderValue.toLocaleString("en-IN")}</span></p>
            <p className="text-xs text-blue-200 uppercase font-bold tracking-widest">Total Paid: <span className="text-white">₹{totalPaid.toLocaleString("en-IN")}</span></p>
            <p className="text-xs text-blue-200 uppercase font-bold tracking-widest">Total COD: <span className="text-white">₹{totalCod.toLocaleString("en-IN")}</span></p>
          </div>
        </div>

        {activeTab === "new" && group.orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={handleFulfillAllClick}
              disabled={isFulfillingAll}
              className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isFulfillingAll ? "Processing..." : "Fulfill With Delhivery — All Orders"}
            </button>
            <button
              onClick={handleMoveAllToPlaced}
              disabled={isMovingAll}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isMovingAll ? "Moving..." : "Move All Orders To Order Placed"}
            </button>
          </div>
        )}
        {activeTab === "placed" && group.orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={handleMarkAllDelivered}
              disabled={isMarkingDelivered}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isMarkingDelivered ? "Marking..." : "Mark All Orders Delivered"}
            </button>
          </div>
        )}
      </div>
      
      {/* Group Results */}
      {(fulfillResults.length > 0 || moveResults.length > 0) && (
        <div className="p-3 bg-gray-50 border-b border-gray-100 text-xs font-mono space-y-1">
           {fulfillResults.map((r, idx) => (
             <div key={"f"+idx} className={r.success ? "text-green-700" : "text-red-700"}>
               Order #{r.id} — {r.success ? "SUCCESS" : "FAILED"} — {r.msg}
             </div>
           ))}
           {moveResults.map((r, idx) => (
             <div key={"m"+idx} className={r.success ? "text-green-700" : "text-red-700"}>
               Order #{r.id} — {r.success ? "SUCCESS" : "FAILED"} — {r.msg}
             </div>
           ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmFulfill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-5">
            <h3 className="font-black text-lg uppercase tracking-wider text-gray-900 mb-1">{group.customerName}</h3>
            <div className="space-y-2 my-4 max-h-60 overflow-y-auto">
              {group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).map((o: any, idx: number) => {
                 const calc = getOrderCalculations(o);
                 return (
                   <div key={o.id} className="text-sm border-b border-gray-100 pb-2">
                     <span className="font-bold text-gray-800">{idx + 1}. #{o.orderNumber || o.id}</span> — {o.productName} — Size {o.size} {o.customization ? (typeof o.customization === 'string' ? `— Cust: ${o.customization}` : `— Cust: ${o.customization.name} ${o.customization.number || ''}`) : ''} — COD ₹{(calc.codAmount || 0).toLocaleString("en-IN")}
                   </div>
                 );
              })}
            </div>
            <div className="text-right mb-4 text-sm font-bold space-y-1">
              <p className="text-gray-600 uppercase">Total Items: {group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).length}</p>
              <p className="text-gray-600 uppercase">Total Order Value: ₹{group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).reduce((sum: number, o: any) => sum + (getOrderCalculations(o).finalTotalAmount || 0), 0).toLocaleString("en-IN")}</p>
              <p className="text-gray-600 uppercase">Total Paid/Advance: ₹{group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).reduce((sum: number, o: any) => sum + (getOrderCalculations(o).amountPaid || 0), 0).toLocaleString("en-IN")}</p>
              <p className="font-black text-indigo-700 text-lg uppercase">Total COD: ₹{group.orders.filter((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId)).reduce((sum: number, o: any) => sum + (getOrderCalculations(o).codAmount || 0), 0).toLocaleString("en-IN")}</p>
              <p className="text-gray-500 uppercase mt-2">Delivery Type: {(group.orders.find((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId))?.deliveryType?.toLowerCase() === 'fast' || group.orders.find((o: any) => !(o.delhiveryAwb || o.delhiveryShipmentId || o.awbNumber || o.trackingId))?.deliveryType?.toLowerCase() === 'express') ? 'FAST' : 'NORMAL'}</p>
              <p className="text-indigo-600 mt-2">ONE SHIPMENT <br/> ONE AWB</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmFulfill(false)}
                className="px-4 py-2 text-gray-600 font-bold uppercase text-xs hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleFulfillAllConfirm}
                className="px-4 py-2 bg-indigo-600 text-white font-bold uppercase text-xs rounded hover:bg-indigo-700 shadow-sm"
              >
                Confirm Fulfill All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Orders */}
      <div className="divide-y divide-gray-100">
        {group.orders.map((order: any) => (
          <div key={order.id} className="p-4 bg-gray-50/30">
            <AdminOrderCard
              order={order}
              activeTab={activeTab}
              onUpdateStatus={(s) => onUpdateStatus(order.id, s)}
              onDelete={() => onDelete(order.id)}
              onUpdateTracking={(t, c, url) => onUpdateTracking(order.id, t, c, url)}
              onUpdatePrice={(p) => onUpdatePrice(order.id, p)}
              onUpdateCustomizationStatus={(s) => onUpdateCustomizationStatus(order.id, s)}
              onEditPayment={onEditPayment}
            />
          </div>
        ))}
      </div>
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
  onEditPayment,
}: {
  order: Order;
  activeTab: string;
  onUpdateStatus: (s: string) => void;
  onDelete: () => void;
  onUpdateTracking: (t: string, c: string, url: string) => void;
  onUpdatePrice: (p: number) => void;
  onUpdateCustomizationStatus: (status: string) => void;
  onEditPayment: (order: Order, calc: any) => void;
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
                    title="Edit Payment"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPayment(order, calc);
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
                    <p className="text-[11px] text-green-600 mb-2 font-mono">TRACKING NUMBER: {order.awbNumber || order.delhiveryShipmentId || order.trackingId}</p>
                    <div className="flex gap-2">
                       <a href={order.trackingUrl || `https://www.delhivery.com/track/package/${order.awbNumber || order.delhiveryShipmentId || order.trackingId}`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">Track</a>
                       {(order.awbNumber || order.delhiveryShipmentId) && (<a href={`/api/delhivery?action=label&awb=${order.awbNumber || order.delhiveryShipmentId}`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">View Label</a>)}
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
                    <Truck className="h-4 w-4" /> {(order.awbNumber || order.delhiveryShipmentId || order.trackingId) ? "Update Tracking" : "Add Tracking"}
                  </button>
                )}

                <button
                  onClick={() => onUpdateStatus("Delivered")}
                  className="w-full py-2.5 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check className="h-4 w-4" /> Mark Delivered
                </button>

                <button
                  onClick={() => onUpdateStatus("RTO")}
                  className="w-full py-2.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 hover:bg-amber-700"
                >
                  <RefreshCw className="h-4 w-4" /> Move to RTO
                </button>
                <button
                  onClick={() => onUpdateStatus("Cancelled")}
                  className="w-full py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" /> Cancel Order
                </button>

              </>
            )}

            {activeTab === "placed" && (
              <>
                {(order.awbNumber || order.delhiveryShipmentId || order.trackingId) ? (
                  <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                    <p className="text-xs font-bold text-green-700 uppercase mb-1">Shipment Created</p>
                    <p className="text-[11px] text-green-600 mb-2 font-mono">TRACKING NUMBER: {order.awbNumber || order.delhiveryShipmentId || order.trackingId}</p>
                    <div className="flex gap-2">
                       <a href={order.trackingUrl || `https://www.delhivery.com/track/package/${order.awbNumber || order.delhiveryShipmentId || order.trackingId}`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">Track</a>
                       {(order.awbNumber || order.delhiveryShipmentId) && (
                         <a href={`/api/delhivery?action=label&awb=${order.awbNumber || order.delhiveryShipmentId}`} target="_blank" className="flex-1 py-1.5 bg-white border border-green-300 text-green-700 text-[10px] font-bold uppercase text-center rounded shadow-sm hover:bg-green-50">View Label</a>
                       )}
                    </div>
                  </div>
                ) : null}
                
                
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
                    <Truck className="h-4 w-4" /> {(order.awbNumber || order.delhiveryShipmentId || order.trackingId) ? "Update Tracking" : "Add Tracking"}
                  </button>
                )}

                
                <button
                  onClick={() => onUpdateStatus("Received")}
                  className="w-full py-2.5 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm border border-gray-200 mb-2 hover:bg-gray-200"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" /> Move to New Orders
                </button>
                <button
                  onClick={() => onUpdateStatus("Delivered")}
                  className="w-full py-2.5 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 mb-2"
                >
                  <Check className="h-4 w-4" /> Mark Delivered
                </button>
                
                <button
                  onClick={() => onUpdateStatus("RTO")}
                  className="w-full py-2.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 hover:bg-amber-700"
                >
                  <RefreshCw className="h-4 w-4" /> Move to RTO
                </button>
                <button
                  onClick={() => onUpdateStatus("Cancelled")}
                  className="w-full py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" /> Cancel Order
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
