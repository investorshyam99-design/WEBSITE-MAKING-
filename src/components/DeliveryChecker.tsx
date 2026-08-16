import React, { useState, useEffect } from 'react';
import { calculateDeliveryEstimate, formatDateRange, DeliveryMethod } from '../lib/delivery';
import { useShop } from '../context/ShopContext';
import { MapPin, Truck, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { checkPincodeServiceability } from '../services/pincode';

interface DeliveryCheckerProps {
  customizationEnabled: boolean;
}

export function DeliveryChecker({ customizationEnabled }: DeliveryCheckerProps) {
  const { deliveryMethod, setDeliveryMethod, deliveryPincode, setDeliveryPincode, setDeliveryLocation, deliveryTat, setDeliveryTat } = useShop();
  const [pincodeInput, setPincodeInput] = useState(deliveryPincode);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<{city?: string, state?: string} | null>(null);

  // If context has pincode on mount, assume it was checked
  useEffect(() => {
    if (deliveryPincode && /^[1-9][0-9]{5}$/.test(deliveryPincode)) {
      setIsServiceable(true);
    }
  }, [deliveryPincode]);

  const handleCheck = async () => {
    if (!/^[1-9][0-9]{5}$/.test(pincodeInput)) {
      alert("Please enter a valid 6-digit Indian Pincode.");
      return;
    }
    
    setIsChecking(true);
    setPincodeMessage(null);
    setLocationInfo(null);
    setIsServiceable(null);
    
    try {
      const result = await checkPincodeServiceability(pincodeInput);
      setIsServiceable(result.isServiceable);
      
      if (result.isServiceable) {
        setDeliveryPincode(pincodeInput);
        if (result.city && result.state) {
          const loc = { city: result.city, district: result.district, state: result.state };
          setLocationInfo(loc);
          setDeliveryLocation(loc);
        }
        if (result.tat) {
          setDeliveryTat(result.tat);
          if (!result.tat.express.available && deliveryMethod === 'FAST') {
             setDeliveryMethod('NORMAL');
          }
        }
      } else {
        setPincodeMessage(result.message || "Sorry, delivery is unavailable to this pincode.");
      }
    } catch (error) {
      setPincodeMessage("Delivery estimate temporarily unavailable. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const estimateNormal = calculateDeliveryEstimate({
    pincode: deliveryPincode,
    deliveryMethod: 'NORMAL',
    customization: customizationEnabled,
    tat: deliveryTat || undefined
  });

  const estimateExpress = calculateDeliveryEstimate({
    pincode: deliveryPincode,
    deliveryMethod: 'FAST',
    customization: customizationEnabled,
    tat: deliveryTat || undefined
  });

  return (
    <div className="mb-6 p-4 md:p-5 bg-white border border-gray-200 shadow-sm rounded-xl flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-gray-700" />
        <h3 className="text-sm font-black text-[#1B1B1B] uppercase tracking-widest">Delivery To</h3>
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          value={pincodeInput}
          onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit Pincode"
          inputMode="numeric"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1E2A44] transition-all bg-gray-50"
        />
        <button 
          onClick={handleCheck}
          disabled={pincodeInput.length !== 6 || isChecking}
          className="bg-[#1E2A44] text-white px-5 rounded-lg font-black text-xs tracking-widest uppercase disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap min-w-[90px]"
        >
          {isChecking ? "Checking" : "Check"}
        </button>
      </div>

      {isServiceable === false && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm font-bold tracking-wide">{pincodeMessage}</span>
        </div>
      )}

      {isServiceable && deliveryPincode && (
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-start gap-2 text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-100">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wide">Delivery available to {deliveryPincode} {locationInfo && `(${locationInfo.city}, ${locationInfo.state})`}</span>
              {customizationEnabled && (
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest mt-1">Includes 2-3 days processing for customization</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Select Delivery Option</h4>
            
            {/* NORMAL DELIVERY OPTION */}
            <label className={`relative flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${deliveryMethod === 'NORMAL' ? 'border-[#1E2A44] bg-[#F8FAFC]' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="flex items-center h-5">
                <input 
                  type="radio" 
                  name="delivery_method" 
                  value="NORMAL" 
                  checked={deliveryMethod === 'NORMAL'}
                  onChange={() => setDeliveryMethod('NORMAL')}
                  className="w-4 h-4 text-[#1E2A44] border-gray-300 focus:ring-[#1E2A44]"
                />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center w-full mb-1">
                  <span className="text-sm font-black text-[#1B1B1B] uppercase tracking-wider flex items-center gap-1.5"><Truck className="w-4 h-4" /> Normal</span>
                  <span className="text-sm font-bold text-gray-700">FREE</span>
                </div>
                <span className="text-xs text-gray-500 font-medium tracking-wide">Expected delivery: {formatDateRange(estimateNormal.estimatedStartDate, estimateNormal.estimatedEndDate)}</span>
              </div>
            </label>

            {/* FAST DELIVERY OPTION */}
            {estimateExpress.isExpressAvailable ? (
              <label className={`relative flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${deliveryMethod === 'FAST' ? 'border-[#1E2A44] bg-[#F8FAFC]' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center h-5">
                  <input 
                    type="radio" 
                    name="delivery_method" 
                    value="FAST" 
                    checked={deliveryMethod === 'FAST'}
                    onChange={() => setDeliveryMethod('FAST')}
                    className="w-4 h-4 text-[#1E2A44] border-gray-300 focus:ring-[#1E2A44]"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className="text-sm font-black text-[#1B1B1B] uppercase tracking-wider flex items-center gap-1.5"><Zap className="w-4 h-4 text-orange-500" /> Fast</span>
                    <span className="text-sm font-bold text-[#1B1B1B]">+₹50</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium tracking-wide">Expected delivery: {formatDateRange(estimateExpress.estimatedStartDate, estimateExpress.estimatedEndDate)}</span>
                </div>
              </label>
            ) : (
               <div className="p-3 rounded-lg border-2 border-gray-100 bg-gray-50 opacity-70">
                 <div className="flex justify-between items-center w-full mb-1">
                    <span className="text-sm font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Zap className="w-4 h-4 text-gray-400" /> Fast</span>
                 </div>
                 <span className="text-xs text-red-500 font-medium tracking-wide">Fast delivery is unavailable for this pincode.</span>
               </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
