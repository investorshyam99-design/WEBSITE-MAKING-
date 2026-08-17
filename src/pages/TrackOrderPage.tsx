import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Package, Search, Loader2, MapPin, Truck, CheckCircle2, Clock } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("awb") || searchParams.get("order") || "");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchTracking = async (queryVal: string) => {
    if (!queryVal) return;
    setLoading(true);
    setError("");
    setTrackingData(null);
    try {
      let awbToTrack = queryVal;

      // If it looks like an order number or we just want to check the DB first
      if (!queryVal.match(/^[0-9A-Z]{10,}$/i)) { // Rough check if it's NOT an AWB, maybe it's an order ID
        const q1 = query(collection(db, "orders"), where("orderNumber", "==", Number(queryVal)));
        const snap1 = await getDocs(q1);
        if (!snap1.empty && snap1.docs[0].data().awbNumber) {
           awbToTrack = snap1.docs[0].data().awbNumber;
        } else {
           const q2 = query(collection(db, "orders"), where("id", "==", queryVal));
           const snap2 = await getDocs(q2);
           if (!snap2.empty && snap2.docs[0].data().awbNumber) {
              awbToTrack = snap2.docs[0].data().awbNumber;
           }
        }
      }

      const res = await fetch(`/api/delhivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "track", awb: awbToTrack })
      });
      const data = await res.json();
      
      if (data && data.Error) {
         throw new Error(data.Error || "Tracking information not found.");
      }
      
      if (data && data.ShipmentData && data.ShipmentData.length > 0) {
         setTrackingData(data.ShipmentData[0].Shipment);
      } else {
         if (!data.success && data.error) throw new Error(data.error);
         throw new Error("No tracking information available for this ID.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch tracking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery && searchParams.get("awb")) {
      fetchTracking(searchQuery);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-[#1E2A44] mb-2 uppercase">Track Order</h1>
            <p className="text-gray-500 font-medium text-sm">Enter your Order Number or AWB to check delivery status.</p>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); fetchTracking(searchQuery); }}
            className="flex gap-2 mb-10"
          >
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Order # or AWB Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E2A44] focus:ring-0 outline-none transition-colors font-semibold"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 bg-[#1E2A44] hover:bg-[#2A3B5C] text-white font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "TRACK"}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-semibold mb-8">
              {error}
            </div>
          )}

          {trackingData && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#1E2A44] p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[#1E2A44]/60 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Delhivery AWB</p>
                    <h2 className="text-2xl font-black tracking-wide">{trackingData.AWB}</h2>
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded-lg text-sm font-bold uppercase tracking-wider">
                    {trackingData.Status?.Status || "Pending"}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Destination</p>
                    <p className="font-semibold">{trackingData.Destination}</p>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Expected Date</p>
                    <p className="font-semibold">{trackingData.ExpectedDeliveryDate ? new Date(trackingData.ExpectedDeliveryDate).toLocaleDateString() : "TBA"}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-[#1E2A44] uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Tracking History
                </h3>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {trackingData.Scans && trackingData.Scans.map((scan: any, i: number) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {i === 0 ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <MapPin className="w-4 h-4 text-gray-500" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                          <div className="font-bold text-slate-900">{scan.ScanDetail.ScanType || scan.ScanDetail.Scan}</div>
                          <time className="text-xs font-medium text-slate-500 uppercase">{new Date(scan.ScanDetail.ScanDateTime).toLocaleString()}</time>
                        </div>
                        <div className="text-sm text-slate-600">{scan.ScanDetail.Instructions || scan.ScanDetail.ScannedLocation}</div>
                      </div>
                    </div>
                  ))}
                  {!trackingData.Scans?.length && (
                    <div className="text-center text-gray-500 py-4 font-medium">
                      No tracking events available yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
