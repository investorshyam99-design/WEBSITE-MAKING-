import React, { useState, useMemo, useEffect } from 'react';
import { IndianRupee, TrendingUp, Package, Trophy, Loader2, Edit3 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export function AdminProfitsDashboard({ orders, updateOrderCost }: { orders: any[]; updateOrderCost: (id: string, costs: any) => Promise<void> }) {
  const [dateFilter, setDateFilter] = useState('all'); // 'today', 'week', 'month', 'all'
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  
  // Cost inputs for editing
  const [productCost, setProductCost] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Manual Adjustments
  const [manualEntries, setManualEntries] = useState<Record<string, {revenue: number, cost: number}>>({});
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [manualRevInput, setManualRevInput] = useState('');
  const [manualCostInput, setManualCostInput] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);

  useEffect(() => {
    async function fetchManualStats() {
      try {
        const querySnapshot = await getDocs(collection(db, 'manual_profits_daily'));
        const entries: Record<string, {revenue: number, cost: number}> = {};
        querySnapshot.forEach(doc => {
          entries[doc.id] = doc.data() as {revenue: number, cost: number};
        });
        setManualEntries(entries);
      } catch (err) {
         console.error('Failed to fetch manual stats', err);
      }
    }
    fetchManualStats();
  }, []);

  const { manualRevenue, manualCost } = useMemo(() => {
    let mRev = 0;
    let mCost = 0;
    const now = new Date();
    Object.entries(manualEntries).forEach(([dateStr, data]) => {
      const date = new Date(dateStr); 
      
      let include = false;
      if (dateFilter === 'all') {
        include = true;
      } else if (dateFilter === 'today') {
        include = date.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
         const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
         include = date >= lastWeek;
      } else if (dateFilter === 'month') {
         include = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      
      if (include) {
         mRev += data.revenue || 0;
         mCost += data.cost || 0;
      }
    });
    return { manualRevenue: mRev, manualCost: mCost };
  }, [manualEntries, dateFilter]);

  const handleSaveManualStats = async () => {
    setIsSavingManual(true);
    try {
      const rev = Number(manualRevInput) || 0;
      const cst = Number(manualCostInput) || 0;
      const dateStr = new Date().toDateString(); // e.g. "Sun May 31 2026"
      await setDoc(doc(db, 'manual_profits_daily', dateStr), {
        revenue: rev,
        cost: cst,
      }, { merge: true });
      
      setManualEntries(prev => ({
        ...prev,
        [dateStr]: { ...prev[dateStr], revenue: rev, cost: cst }
      }));
      
      setIsEditingManual(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save manual adjustments');
    }
    setIsSavingManual(false);
  };


  const getEffectiveQuantity = (order: any) => {
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
    return effectiveQuantity || 1;
  };

  const filteredOrders = useMemo(() => {
    if (dateFilter === 'all') return orders;
    const now = new Date();
    return orders.filter(o => {
      if (!o.createdAt) return false;
      const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      if (dateFilter === 'today') {
        return date.toDateString() === now.toDateString();
      }
      if (dateFilter === 'week') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= lastWeek;
      }
      if (dateFilter === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, dateFilter]);

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalCosts = 0;
    let totalRazorpayCharges = 0;
    let netProfit = 0;
    
    // For calculating Best Selling Product
    const productCounts: Record<string, number> = {};

    filteredOrders.forEach(o => {
      if (!o.address || o.status?.toLowerCase().includes("draft") || o.status?.toLowerCase().includes("pending")) {
         return; // We only calculate for completed operations (payment received/delivered)
      }
      
      const effectiveQty = getEffectiveQuantity(o);
      const isDelivered = String(o.status).toLowerCase() === 'delivered';
      
      const pCost = Number(o.productCost || 0);
      const sCost = Number(o.shippingCost || 0);
      const aCost = Number(o.additionalCost || 0);
      const tCost = pCost + sCost + aCost;

      let revenue = 0;
      let razorpayFee = 0;

      if (o.paymentMode === 'full') {
        revenue = o.price || 0;
        razorpayFee = revenue * 0.0236;
      } else if (o.paymentMode === 'partial' || String(o.status).toLowerCase().includes('advance') || String(o.status).toLowerCase() === 'fampay') {
        const advanceReceived = 150 * effectiveQty;
        razorpayFee = advanceReceived * 0.0236;
        const codAmount = (o.price || 0) + (50 * effectiveQty) - advanceReceived;
        revenue = advanceReceived + codAmount;
      }

      totalRevenue += revenue;
      totalCosts += tCost;
      totalRazorpayCharges += razorpayFee;
      netProfit += (revenue - razorpayFee - tCost);

      if (o.productName) {
        productCounts[o.productName] = (productCounts[o.productName] || 0) + effectiveQty;
      }
    });

    let bestSellingProduct = 'None';
    let maxSold = 0;
    Object.entries(productCounts).forEach(([name, count]) => {
      if (count > maxSold) {
        maxSold = count;
        bestSellingProduct = name;
      }
    });

    return {
      totalRevenue: totalRevenue + manualRevenue,
      totalCosts: totalCosts + manualCost,
      totalRazorpayCharges,
      netProfit: netProfit + manualRevenue - manualCost,
      totalOrders: filteredOrders.length,
      averageProfit: filteredOrders.length > 0 ? (netProfit + manualRevenue - manualCost) / filteredOrders.length : 0,
      margin: (totalRevenue + manualRevenue) > 0 ? ((netProfit + manualRevenue - manualCost) / (totalRevenue + manualRevenue)) * 100 : 0,
      bestSellingProduct
    };
  }, [filteredOrders, manualRevenue, manualCost]);

  const handleSaveCosts = async (orderId: string) => {
    setIsSaving(true);
    await updateOrderCost(orderId, {
      productCost: Number(productCost),
      shippingCost: Number(shippingCost),
      additionalCost: Number(additionalCost)
    });
    setEditingOrderId(null);
    setIsSaving(false);
  };

  const openEditor = (order: any) => {
    setProductCost(order.productCost || '');
    setShippingCost(order.shippingCost || '');
    setAdditionalCost(order.additionalCost || '');
    setEditingOrderId(order.id);
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
        {[
          { id: 'today', label: 'Today' },
          { id: 'week', label: 'This Week' },
          { id: 'month', label: 'This Month' },
          { id: 'all', label: 'All Time' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setDateFilter(item.id)}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full ${dateFilter === item.id ? 'bg-[#722F37] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Revenue</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1B1B1B]">₹{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Net Profit</h3>
            <div className={`p-2 rounded-lg ${stats.netProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{stats.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Avg Profit</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1B1B1B]">₹{stats.averageProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Margin %</h3>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1B1B1B]">{stats.margin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-[#1B1B1B] mb-4">Profit Analytics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
             <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Total Revenue</p>
             <p className="text-lg font-black text-[#1B1B1B]">₹{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
             <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Total Costs</p>
             <p className="text-lg font-black text-gray-800">₹{stats.totalCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
             <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Razorpay Fees</p>
             <p className="text-lg font-black text-gray-600">₹{stats.totalRazorpayCharges.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
             <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Net Profit</p>
             <p className={`text-lg font-black ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{stats.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium">
           <span className="text-gray-500 uppercase font-bold tracking-wider">Best Selling Product:</span>
           <span className="text-[#1B1B1B] font-bold truncate max-w-[200px] text-right">{stats.bestSellingProduct}</span>
        </div>
        
        {/* Manual Adjustments Section */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">Manual Adjustments ({dateFilter === 'today' ? 'Today' : 'Filtered Period'})</h4>
             {!isEditingManual && (
               <button 
                 onClick={() => {
                   // When editing, default the input to *today's* existing manual values, not the filtered sum
                   const todayStr = new Date().toDateString();
                   const todayEntry = manualEntries[todayStr] || { revenue: 0, cost: 0 };
                   setManualRevInput(String(todayEntry.revenue));
                   setManualCostInput(String(todayEntry.cost));
                   setIsEditingManual(true);
                 }}
                 className="flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-800"
               >
                 <Edit3 className="w-3 h-3" /> Edit Today's Totals
               </button>
             )}
          </div>
          {isEditingManual ? (
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-bold uppercase text-gray-500">Today's Manual Revenue (+)</label>
                   <input type="number" value={manualRevInput} onChange={e => setManualRevInput(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded font-semibold" placeholder="0" />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold uppercase text-gray-500">Today's Manual Cost (+)</label>
                   <input type="number" value={manualCostInput} onChange={e => setManualCostInput(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded font-semibold" placeholder="0" />
                 </div>
               </div>
               <div className="flex justify-end gap-2 mt-4 text-xs">
                  <button onClick={() => setIsEditingManual(false)} className="px-4 py-2 uppercase font-bold text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                  <button onClick={handleSaveManualStats} disabled={isSavingManual} className="px-6 py-2 uppercase font-bold text-white bg-[#722F37] hover:bg-[#2A3A5A] rounded shadow flex items-center justify-center">
                    {isSavingManual ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Save Today's Adjustments
                  </button>
               </div>
             </div>
          ) : (
             <div className="flex gap-6 text-xs">
                <div>
                  <span className="text-gray-500 uppercase font-bold tracking-wider">Manual Revenue: </span>
                  <span className="font-bold text-green-600 ml-1">+₹{manualRevenue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase font-bold tracking-wider">Manual Cost: </span>
                  <span className="font-bold text-red-600 ml-1">+₹{manualCost.toLocaleString()}</span>
                </div>
             </div>
          )}
        </div>

      </div>

      {/* Order List */}
      <div className="space-y-4">
        {filteredOrders.filter(o => o.address && !o.status?.toLowerCase().includes("pending")).map(order => {
          const eq = getEffectiveQuantity(order);
          const isDelivered = String(order.status).toLowerCase() === 'delivered';
          const pCost = Number(order.productCost || 0);
          const sCost = Number(order.shippingCost || 0);
          const aCost = Number(order.additionalCost || 0);
          const tCost = pCost + sCost + aCost;
          
          let rev = 0;
          let rFee = 0;

          if (order.paymentMode === 'full') {
             rev = order.price || 0;
             rFee = rev * 0.0236;
          } else {
             const advance = 150 * eq;
             rFee = advance * 0.0236;
             const codAmount = (order.price || 0) + (50 * eq) - advance;
             rev = advance + codAmount;
          }
          
          const profit = rev - rFee - tCost;
          const hasCosts = pCost > 0 || sCost > 0 || aCost > 0;

          return (
            <div key={order.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50">
                <div className="flex gap-4 items-start">
                  {order.image && (
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 mt-1">
                      <img src={order.image} alt={order.productName || 'Product'} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[#722F37] text-sm">{order.fullName || "Guest Customer"}</p>
                    <p className="text-xs text-gray-500 mb-2 truncate max-w-xs md:max-w-sm">{order.productName}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-gray-200 text-gray-700">
                      {order.paymentMode === 'full' ? 'Prepaid (Full)' : 'COD (Partial)'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ml-2 ${isDelivered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.status || 'Received'}
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right mt-2 md:mt-0">
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Net Profit</p>
                   <p className={`text-xl font-black ${hasCosts ? (profit >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                     {hasCosts ? (profit >= 0 ? '+' : '') : ''}₹{hasCosts ? profit.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                   </p>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100">
                {editingOrderId === order.id ? (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-500">Product Cost</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-semibold"
                            value={productCost}
                            onChange={(e) => setProductCost(e.target.value)}
                            placeholder="₹450"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-500">Shipping Cost</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-semibold"
                            value={shippingCost}
                            onChange={(e) => setShippingCost(e.target.value)}
                            placeholder="₹70"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-gray-500">Additional Cost</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-semibold"
                            value={additionalCost}
                            onChange={(e) => setAdditionalCost(e.target.value)}
                            placeholder="₹0"
                          />
                        </div>
                     </div>
                     <div className="flex justify-end gap-2 text-xs">
                        <button onClick={() => setEditingOrderId(null)} className="px-4 py-2 uppercase font-bold text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                        <button onClick={() => handleSaveCosts(order.id)} disabled={isSaving} className="px-6 py-2 uppercase font-bold text-white bg-[#722F37] hover:bg-[#2A3A5A] rounded shadow flex items-center justify-center">
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Save Costs
                        </button>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4 w-full lg:flex-1">
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Order Amount</p>
                           <p className="font-semibold text-gray-800 text-sm">₹{rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Product Cost</p>
                           <p className="font-semibold text-red-600 text-sm">-₹{pCost.toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Shipping Cost</p>
                           <p className="font-semibold text-red-600 text-sm">-₹{sCost.toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Additional Cost</p>
                           <p className="font-semibold text-red-600 text-sm">-₹{aCost.toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Razorpay Fee</p>
                           <p className="font-semibold text-red-600 text-sm">-₹{rFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                    <button onClick={() => openEditor(order)} className="mt-4 lg:mt-0 px-5 py-2 text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-[#722F37] w-full lg:w-auto transition-colors ml-0 lg:ml-4">
                      Edit Costs
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
