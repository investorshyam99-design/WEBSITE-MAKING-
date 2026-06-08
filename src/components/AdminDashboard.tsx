import React, { useState } from "react";
import { db } from "../lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
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
import { useProducts } from "../data/products";

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

const TABS = [
  { id: "new", label: "New Orders" },
  { id: "drafts", label: "Draft Orders" },
  { id: "abandoned", label: "Abandoned Carts" },
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

export function AdminDashboard({
  orders,
  refreshOrders,
}: {
  orders: Order[];
  refreshOrders: () => void;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new");
  const [search, setSearch] = useState("");

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
        "Are you sure you want to delete this order? This cannot be undone.",
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      refreshOrders();
    } catch (e: any) {
      console.error(e);
      alert("Failed to delete order. " + e.message);
    }
  };

  const handleUpdateTracking = async (
    orderId: string,
    trackingId: string,
    courierName: string,
  ) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { trackingId, courierName });
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

  const handleUpdatePrice = async (orderId: string, currentPrice: number) => {
    const newPrice = prompt(
      "Enter the new correct price (excluding COD charges):",
      currentPrice.toString(),
    );
    if (newPrice && !isNaN(Number(newPrice))) {
      try {
        await updateDoc(doc(db, "orders", orderId), {
          price: Number(newPrice),
        });
        refreshOrders();
      } catch (e) {
        console.error(e);
        alert("Failed to update price");
      }
    }
  };

  // Filter orders into categories
  const newOrders = orders.filter(
    (o) =>
      !o.status?.toLowerCase().includes("pending") &&
      o.status?.toLowerCase() !== "delivered" &&
      o.status?.toLowerCase() !== "order placed" &&
      o.address,
  );

  const draftOrders = orders.filter(
    (o) => o.status?.toLowerCase().includes("pending") && o.address,
  );

  const abandonedCarts = orders.filter(
    (o) => o.status?.toLowerCase().includes("pending") && !o.address,
  );

  const placedOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "order placed",
  );

  const deliveredOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "delivered",
  );

  let currentOrders = [];
  if (activeTab === "new") currentOrders = newOrders;
  if (activeTab === "drafts") currentOrders = draftOrders;
  if (activeTab === "abandoned") currentOrders = abandonedCarts;
  if (activeTab === "placed") currentOrders = placedOrders;
  if (activeTab === "delivered") currentOrders = deliveredOrders;

  // Apply search
  if (search) {
    const searchLower = search.toLowerCase();
    currentOrders = currentOrders.filter(
      (o) =>
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
              {tab.id === "new" && newOrders.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-[10px]">
                  {newOrders.length}
                </span>
              )}
              {tab.id === "drafts" && draftOrders.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-[10px]">
                  {draftOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {activeTab === "profits" ? (
          <AdminProfitsDashboard
            orders={orders}
            updateOrderCost={handleUpdateOrderCost}
          />
        ) : currentOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              No {activeTab} orders found.
            </p>
          </div>
        ) : (
          currentOrders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              onUpdateStatus={(s) => handleUpdateStatus(order.id, s)}
              onDelete={() => handleDelete(order.id)}
              onUpdateTracking={(t, c) => handleUpdateTracking(order.id, t, c)}
              onUpdatePrice={(p) => handleUpdatePrice(order.id, p)}
            />
          ))
        )}
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
}: {
  order: Order;
  activeTab: string;
  onUpdateStatus: (s: string) => void;
  onDelete: () => void;
  onUpdateTracking: (t: string, c: string) => void;
  onUpdatePrice: (p: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [trackingId, setTrackingId] = useState(order.trackingId || "");
  const [courierName, setCourierName] = useState(order.courierName || "");
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const navigate = useNavigate();
  const { products } = useProducts();

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const product = products.find((p) => p.name === order.productName);
    const pid = (order as any).productId || product?.id;
    if (pid) {
      navigate(`/product/${encodeURIComponent(pid)}`);
    }
  };

  const orderDate = order.createdAt?.toDate?.()
    ? order.createdAt
        .toDate()
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
    : "Just now";

  const customerName = order.fullName || "Guest Customer";
  const paymentLink = `https://jerseyunicorn.com/#/checkout?order=${order.id}`;

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
  const templates = {
    orderReceived: `Hey ${customerName} 👋\n\nYour Jersey Unicorn order has been received successfully ⚽\n\nWe’ll update you once shipped 🚚`,
    draftReminder: `Hey ${customerName},\n\nYour Jersey Unicorn order is waiting for confirmation ⚽\n\nComplete your order here:\n${paymentLink}`,
    codConfirm: `Please complete the ₹150 confirmation payment to process your COD order ⚽\n\nLink: ${paymentLink}`,
    shipped: `Your Jersey Unicorn order has been shipped 🚚\n\nTracking ID: ${trackingId}\nCourier: ${courierName}`,
    delivery: `Your Jersey Unicorn order has been delivered ⚽🔥\n\nTag us on Instagram @jerseyunicorn1 to get featured ❤️`,
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
              <p className="font-bold text-[#1E2A44] text-sm truncate pr-2">
                {customerName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {order.productName}
              </p>
            </div>
            <div className="text-right">
              <div className="flex justify-end items-center gap-2">
                <p className="font-black text-[#1B1B1B] text-sm">
                  ₹{(order.price || 0).toLocaleString("en-IN")}
                </p>
                <button
                  title="Edit Price"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdatePrice(order.price || 0);
                  }}
                  className="text-gray-400 hover:text-[#1E2A44] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {(order.paymentMode === "partial" ||
                String(order.status).toLowerCase().includes("advance")) && (
                <p className="text-[10px] font-bold text-red-600 mt-1 uppercase">
                  COD: ₹
                  {(
                    (order.price || 0) +
                    50 * effectiveQuantity -
                    150 * effectiveQuantity
                  ).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-gray-100 text-gray-600">
              {activeTab === "new" ? order.status || "Received" : activeTab}
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
            <div className="col-span-2 flex justify-between items-center bg-gray-50 px-3 py-2 rounded border border-gray-100">
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  Payment
                </p>
                <p className="font-semibold text-gray-800 uppercase text-[10px]">
                  {order.paymentMode === "full"
                    ? "Prepaid (Full)"
                    : order.paymentMode === "partial" ||
                        String(order.status).toLowerCase().includes("advance")
                      ? "Advance Paid (Partial)"
                      : order.paymentMode || "Unknown"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                  Paid
                </p>
                <p className="font-black text-green-600 text-sm">
                  ₹
                  {(order.paymentMode === "full"
                    ? order.price || 0
                    : order.paymentMode === "partial" ||
                        String(order.status).toLowerCase().includes("advance")
                      ? 150 * effectiveQuantity
                      : 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>
              {(order.paymentMode === "partial" ||
                String(order.status).toLowerCase().includes("advance")) && (
                <div className="text-right">
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                    To Collect (COD)
                  </p>
                  <p className="font-black text-red-600 text-sm">
                    ₹
                    {(
                      (order.price || 0) +
                      50 * effectiveQuantity -
                      150 * effectiveQuantity
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              )}
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
              <p className="font-semibold text-gray-800">
                {order.customization || "None"}
              </p>
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
            {activeTab === "new" && (
              <>
                <button
                  onClick={() => onUpdateStatus("Advance Paid (Fampay)")}
                  className="w-full py-2.5 bg-[#1E2A44] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2"
                >
                  <Check className="h-4 w-4" /> Received via Fampay
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
                          onUpdateTracking(trackingId, courierName);
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
                  onClick={() => onUpdateStatus("Advance Paid (Fampay)")}
                  className="w-full py-2.5 bg-[#1E2A44] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm mb-2"
                >
                  <Check className="h-4 w-4" /> Received via Fampay
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
                      `Hey ${customerName} 👋\n\nIt's been a while!\n\nReady for your next jersey? Check out our new arrivals ⚽\n\nJersey Unicorn`,
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
