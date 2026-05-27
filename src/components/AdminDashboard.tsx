import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Package, Search, Filter, Phone, MapPin, Copy, 
  MessageCircle, Truck, ExternalLink, ChevronDown, Check, Trash2, Edit
} from 'lucide-react';

interface Order {
  id: string;
  userId: string;
  productName: string;
  image?: string;
  size: string;
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

const ORDER_STATUSES = [
  "Order Received",
  "Pending COD Confirmation",
  "Pending Advance Payment",
  "Pending Full Payment",
  "Payment Received",
  "Processing",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
  "Exchange Requested"
];

function generateWhatsAppLink(phone: string, text: string) {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/\D/g, '');
  const finalPhone = cleanPhone.length > 10 ? cleanPhone : '91' + cleanPhone;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
}

export function AdminDashboard({ orders, refreshOrders }: { orders: Order[], refreshOrders: () => void }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this draft order?")) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to delete order");
    }
  };

  const handleUpdateTracking = async (orderId: string, trackingId: string, courierName: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { trackingId, courierName });
      refreshOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to update tracking");
    }
  };

  const handleDeleteAllDrafts = async () => {
    const draftOrders = orders.filter(o => o.status?.toLowerCase().includes("pending"));
    if (draftOrders.length === 0) {
      alert("No draft orders to delete.");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete all ${draftOrders.length} draft orders? This cannot be undone.`)) return;
    
    try {
      const promises = draftOrders.map(order => deleteDoc(doc(db, 'orders', order.id)));
      await Promise.all(promises);
      refreshOrders();
      alert(`Successfully deleted ${draftOrders.length} draft orders.`);
    } catch (e) {
      console.error(e);
      alert("Failed to delete some draft orders.");
    }
  };

  const handleDeleteAllOrders = async () => {
    if (orders.length === 0) {
      alert("No orders to delete.");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ALL ${orders.length} orders? This action CANNOT be undone.`)) return;
    
    try {
      const promises = orders.map(order => deleteDoc(doc(db, 'orders', order.id)));
      await Promise.all(promises);
      refreshOrders();
      alert(`Successfully deleted all ${orders.length} orders.`);
    } catch (e) {
      console.error(e);
      alert("Failed to delete some orders.");
    }
  };

  const filteredOrders = orders.filter(o => {
    const searchLower = search.toLowerCase();
    const matchSearch = 
      (o.id.toLowerCase().includes(searchLower)) ||
      (o.phone && o.phone.toLowerCase().includes(searchLower)) ||
      (o.fullName && o.fullName.toLowerCase().includes(searchLower)) ||
      (o.productName.toLowerCase().includes(searchLower));

    const isPending = o.status?.toLowerCase().includes("pending");
    
    if (statusFilter === 'Drafts') {
      return matchSearch && isPending;
    } else if (statusFilter === 'Placed') {
      return matchSearch && !isPending;
    } else if (statusFilter !== 'All') {
       return matchSearch && o.status === statusFilter;
    }
    
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border md:rounded-xl p-4 md:p-6 shadow-sm sticky top-0 z-10 md:static">
        <h2 className="text-xl font-black text-[#1E2A44] uppercase tracking-widest mb-4">Admin Dashboard</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID, Name, Phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A44]"
            />
          </div>
          <div className="flex-shrink-0 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#1E2A44] font-medium text-gray-700"
            >
              <option value="All">All Orders</option>
              <option value="Placed">Placed Orders</option>
              <option value="Drafts">Drafts / Incomplete</option>
              <option disabled>──────────</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
          <button 
            onClick={handleDeleteAllOrders}
            className="flex-shrink-0 bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-colors shadow-sm"
          >
            <Trash2 className="h-5 w-5" /> 
            <span className="hidden md:inline">Delete All Orders</span>
          </button>
          <button 
            onClick={handleDeleteAllDrafts}
            className="flex-shrink-0 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-colors"
          >
            <Trash2 className="h-5 w-5" /> 
            <span className="hidden md:inline">Delete All Drafts</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#1E2A44] text-white p-4 rounded-lg">
            <p className="text-xs uppercase tracking-wider opacity-70">Total Orders</p>
            <p className="text-2xl font-black">{orders.length}</p>
          </div>
          <div className="bg-green-50 text-green-800 border border-green-100 p-4 rounded-lg">
            <p className="text-xs uppercase tracking-wider opacity-70">Placed</p>
            <p className="text-2xl font-black">{orders.filter(o => !o.status?.toLowerCase().includes("pending")).length}</p>
          </div>
          <div className="bg-amber-50 text-amber-800 border border-amber-100 p-4 rounded-lg">
            <p className="text-xs uppercase tracking-wider opacity-70">Drafts</p>
            <p className="text-2xl font-black">{orders.filter(o => o.status?.toLowerCase().includes("pending")).length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
             <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
             <p className="text-gray-500 font-medium">No orders found matching the criteria.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <AdminOrderCard 
              key={order.id} 
              order={order} 
              onUpdateStatus={(s) => handleUpdateStatus(order.id, s)}
              onDelete={() => handleDelete(order.id)}
              onUpdateTracking={(t, c) => handleUpdateTracking(order.id, t, c)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AdminOrderCard({ 
  order, 
  onUpdateStatus, 
  onDelete,
  onUpdateTracking
}: { 
  order: Order, 
  onUpdateStatus: (s: string) => void,
  onDelete: () => void,
  onUpdateTracking: (t: string, c: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDraft = order.status?.toLowerCase().includes("pending");
  const [trackingId, setTrackingId] = useState(order.trackingId || '');
  const [courierName, setCourierName] = useState(order.courierName || '');

  const orderDate = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Just now";

  const customerName = order.fullName || "Guest Customer";
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // WhatsApp Templates
  const templates = {
    orderReceived: `Hey ${customerName} 👋\n\nYour Jersey Unicorn order has been received successfully ⚽\n\n🛍 Product: ${order.productName}\n📏 Size: ${order.size}\n\nWe’ll update you once your order is confirmed and shipped 🚚\n\nThank you for shopping with Jersey Unicorn ❤️`,
    codConfirm: `Hey ${customerName} 👋\n\nYour COD order for ${order.productName} is awaiting confirmation.\n\nTo process your order, please complete the ₹150 confirmation payment below:\n🔗 [Insert Payment Link]\n\nRemaining amount will be payable at delivery 🚚\n\nThank you ⚽\nJersey Unicorn`,
    paymentSuccess: `Payment received successfully ✅\n\nYour Jersey Unicorn order is now being processed ⚽\n\nWe’ll share tracking details once your order is shipped 🚚`,
    shipped: `Your Jersey Unicorn order has been shipped 🚚\n\n📦 Courier: ${courierName || '[Courier]'}\n🔎 Tracking ID: ${trackingId || '[ID]'}\n\nTrack your shipment here:\n[Insert Tracking Link]\n\nThank you for shopping with Jersey Unicorn ⚽`,
    delivery: `Your Jersey Unicorn order has been delivered ⚽🔥\n\nWe hope you love your jersey ❤️\n\n📸 Tag us on Instagram @jerseyunicorn1 to get featured.\n\nThank you for being part of the football culture ⚽`,
  };

  const handleUpdateStatusWithWhatsApp = (newStatus: string, templateKey: keyof typeof templates) => {
    onUpdateStatus(newStatus);
    window.open(generateWhatsAppLink(order.phone || '', templates[templateKey]), '_blank');
  };

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${isDraft ? 'border-amber-200' : 'border-gray-200'}`}>
      {/* Header Summary */}
      <div 
        className={`p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${isDraft ? 'bg-amber-50/30' : 'bg-gray-50/50'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
            {order.image ? (
              <img src={order.image} alt="Product" className="w-full h-full object-cover" />
            ) : (
               <Package className="h-6 w-6 m-auto text-gray-400 mt-3" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-black text-[#1E2A44] truncate">{order.id.slice(0,8).toUpperCase()}</p>
               <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isDraft ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                 {order.status || 'Received'}
               </span>
            </div>
            <p className="text-sm text-gray-500 font-medium truncate">{customerName} • {order.phone || 'No Phone'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-6 md:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
          <div className="text-left md:text-right">
            <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Amount</p>
            <p className="font-black text-[#1B1B1B]">₹{(order.price || 0).toLocaleString("en-IN")}</p>
          </div>
          <div className="text-left md:text-right hidden sm:block">
            <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Date</p>
            <p className="text-sm font-semibold text-gray-700">{orderDate.split(',')[0]}</p>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 md:p-6 border-t border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Details */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-gray-400 tracking-widest">Customer Details</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                <div className="flex items-start justify-between group">
                  <div>
                    <p className="text-sm font-bold text-[#1B1B1B] flex items-center gap-2">
                       {customerName}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" /> {order.phone || 'No Phone provided'}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleCopy(order.phone || '')} className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">
                      <Copy className="h-4 w-4" />
                    </button>
                    {order.phone && (
                       <a href={generateWhatsAppLink(order.phone, 'Hi!')} target="_blank" rel="noreferrer" className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                        <MessageCircle className="h-4 w-4" />
                       </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between group pt-3 border-t border-gray-200">
                  <div className="max-w-[80%]">
                    <p className="text-sm text-gray-600 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                      <span className="leading-relaxed">{order.address || 'No Address provided'}</span>
                    </p>
                  </div>
                  <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleCopy(order.address || '')} className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details & Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-gray-400 tracking-widest">Order Details</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                <p className="font-bold text-[#1B1B1B] text-lg leading-tight mb-3 uppercase tracking-tight">{order.productName}</p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Size</p>
                    <p className="font-medium">{order.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Custom</p>
                    <p className="font-medium">{order.customization || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Payment</p>
                    <p className="font-medium capitalize">{order.paymentMode || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Time</p>
                    <p className="font-medium">{orderDate}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-gray-500 uppercase tracking-wider text-[10px] font-bold mb-2">Tracking Timeline</p>
                  <div className="flex items-center text-xs font-semibold text-gray-400">
                     <span className="text-green-600">Created</span>
                     <span className="mx-2">&gt;</span>
                     <span className={order.status.includes('Received') || !isDraft ? "text-green-600" : ""}>Paid</span>
                     <span className="mx-2">&gt;</span>
                     <span className={order.status === 'Packed' || order.status === 'Shipped' || order.status === 'Delivered' ? "text-green-600" : ""}>Packed</span>
                     <span className="mx-2">&gt;</span>
                     <span className={order.status === 'Shipped' || order.status === 'Delivered' ? "text-green-600" : ""}>Shipped</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <hr className="border-gray-100" />

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Status & Tracking */}
            <div className="space-y-4">
               <h4 className="text-xs uppercase font-bold text-gray-400 tracking-widest">Update Order</h4>
               <div className="space-y-3">
                 <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Status</label>
                    <select 
                      value={order.status}
                      onChange={(e) => onUpdateStatus(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2A44] font-medium"
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>

                 {!isDraft && (
                    <div className="bg-blue-50/50 p-3 rounded border border-blue-100 space-y-3">
                      <div className="flex items-center gap-2 text-blue-800 text-sm font-bold">
                        <Truck className="h-4 w-4" /> Tracking Information
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={courierName}
                          onChange={e => setCourierName(e.target.value)}
                          className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:outline-none focus:border-blue-400"
                        >
                          <option value="">Select Courier</option>
                          <option value="Delhivery">Delhivery</option>
                          <option value="BlueDart">BlueDart</option>
                          <option value="DTDC">DTDC</option>
                          <option value="XpressBees">XpressBees</option>
                          <option value="Ecom Express">Ecom Express</option>
                          <option value="India Post">India Post</option>
                          <option value="Other">Other</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Tracking ID" 
                          value={trackingId}
                          onChange={e => setTrackingId(e.target.value)}
                          className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          onUpdateTracking(trackingId, courierName);
                          handleUpdateStatusWithWhatsApp("Shipped", "shipped");
                        }}
                        className="w-full py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                      >
                        <Truck className="h-4 w-4" /> Save & Send WhatsApp
                      </button>
                    </div>
                 )}

                 {isDraft && (
                   <div className="flex gap-2">
                     <button
                       onClick={() => handleUpdateStatusWithWhatsApp("Processing", "paymentSuccess")}
                       className="flex-1 py-2.5 bg-green-600 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-green-700 transition-colors flex justify-center items-center gap-1 border border-green-700"
                     >
                       <Check className="h-4 w-4" /> Mark Processing
                     </button>
                     <button
                       onClick={onDelete}
                       className="flex-1 py-2.5 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded hover:bg-red-100 transition-colors flex justify-center items-center gap-1 border border-red-200"
                     >
                       <Trash2 className="h-4 w-4" /> Delete Draft
                     </button>
                   </div>
                 )}
               </div>
            </div>

            {/* WhatsApp Automation */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-gray-400 tracking-widest flex justify-between items-center">
                 <span>WhatsApp Automation</span>
                 <MessageCircle className="h-4 w-4 text-green-500" />
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {isDraft ? (
                  <>
                    <button onClick={() => handleUpdateStatusWithWhatsApp("Pending COD Confirmation", "codConfirm")} className="w-full text-left py-3 px-4 bg-gray-50 border border-gray-200 rounded hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#075E54] text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group">
                      COD Confirm Flow <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:text-[#25D366]" />
                    </button>
                    <button onClick={() => handleUpdateStatusWithWhatsApp("Order Received", "orderReceived")} className="w-full text-left py-3 px-4 bg-gray-50 border border-gray-200 rounded hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#075E54] text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group">
                      Order Received <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:text-[#25D366]" />
                    </button>
                  </>
                ) : (
                  <>
                     <button onClick={() => handleUpdateStatusWithWhatsApp("Processing", "paymentSuccess")} className="w-full text-left py-3 px-4 bg-gray-50 border border-gray-200 rounded hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#075E54] text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group truncate">
                      Processing Msg <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:text-[#25D366]" />
                    </button>
                    <button onClick={() => {
                        onUpdateTracking(trackingId, courierName);
                        handleUpdateStatusWithWhatsApp("Shipped", "shipped");
                      }} className="w-full text-left py-3 px-4 bg-gray-50 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group truncate">
                      Shipping Msg <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:text-blue-500" />
                    </button>
                    <button onClick={() => handleUpdateStatusWithWhatsApp("Delivered", "delivery")} className="w-full text-left py-3 px-4 bg-gray-50 border border-gray-200 rounded hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#075E54] text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group truncate">
                      Delivered Msg <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:text-[#25D366]" />
                    </button>
                    <a href={generateWhatsAppLink(order.phone || '', 'Hi!')} target="_blank" rel="noreferrer" className="w-full text-left py-3 px-4 bg-gray-50 border border-gray-200 rounded hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#075E54] text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group truncate">
                      Chat Manually <MessageCircle className="h-4 w-4 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:text-[#25D366]" />
                    </a>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
