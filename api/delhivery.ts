import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0849052766",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:320269995644:web:88f1b87e16d535458a83f9",
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCPq999mn6aTViDVo7IdCFV2P7hO7YVMYs",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0849052766.firebaseapp.com",
  firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-f2809a7f-0532-4842-a146-4ab39cf8afb0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default async function handler(req: VercelRequest, res: VercelResponse) {

    const { action, awb, dest, pincode, orderData } = req.method === 'POST' ? req.body : req.query;

    const apiKey = process.env.DELHIVERY_API_TOKEN;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "DELHIVERY_API_TOKEN not configured" });
    }

    try {
      if (action === 'health') {
        const response = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=400001`, {
          method: "GET",
          headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" }
        });
        if (!response.ok) return res.json({ authenticated: false, apiReachable: true, error: "Delhivery authentication failed" });
        return res.json({ authenticated: true, apiReachable: true, serviceabilityApi: true, shipmentApi: true });
      }

      if (action === 'serviceability') {
        if (!pincode) return res.status(400).json({ success: false, error: "Pincode is required" });
        const response = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`, {
          method: "GET", headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (data?.delivery_codes?.length > 0) {
          const center = data.delivery_codes[0].postal_code;
          return res.json({
            success: true, isServiceable: true, city: center.city, state: center.state_code,
            district: center.district, prepaid: center.pre_paid === "Y", cod: center.cod === "Y"
          });
        }
        return res.json({ success: true, isServiceable: false, error: "Pincode valid but not serviceable." });
      }

      if (action === 'tat') {
        const origin = process.env.DELHIVERY_PICKUP_PINCODE || "410206";
        if (!dest) return res.status(400).json({ success: false, error: "Destination pincode is required" });
        
        let normalDays = 5, expressDays = 3, expressAvailable = true;
        
        // 1. Check Serviceability API first
        const servRes = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${dest}`, {
          headers: { "Authorization": `Token ${apiKey}` }
        });
        if (servRes.ok) {
          const servData: any = await servRes.json();
          if (servData?.delivery_codes?.length > 0) {
            const pinInfo = servData.delivery_codes[0].postal_code;
            if (pinInfo.pre_paid === "N" && pinInfo.cod === "N") {
              return res.json({ success: true, serviceable: false });
            }
          } else {
             // invalid pincode
             return res.json({ success: true, serviceable: false });
          }
        } else {
          return res.status(400).json({ success: false, error: "Delhivery Serviceability check failed" });
        }

        // 2. Zone lookup for fallback TAT
        const zoneRes = await fetch(`https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${dest}&o_pin=${origin}&cgm=500`, {
          headers: { "Authorization": `Token ${apiKey}` }
        });
        
        if (zoneRes.ok) {
          const zoneData: any = await zoneRes.json();
          if (zoneData?.[0]?.zone) {
            const zone = String(zoneData[0].zone).toUpperCase();
            if (zone.startsWith("A")) { normalDays = 2; expressDays = 1; }
            else if (zone.startsWith("B")) { normalDays = 3; expressDays = 2; }
            else if (zone.startsWith("C")) { normalDays = 4; expressDays = 2; }
            else if (zone.startsWith("D")) { normalDays = 5; expressDays = 3; }
            else if (zone.startsWith("E")) { normalDays = 7; expressDays = 5; expressAvailable = false; }
          }
        }
        
        return res.json({ 
          success: true, 
          serviceable: true,
          tat: { 
            normal: { days: normalDays, mode: "Surface" }, 
            express: { days: expressDays, mode: "Express", available: expressAvailable } 
          } 
        });
      }

      
      if (action === 'diagnostic') {
        if (!req.body.orderId) return res.status(400).json({ success: false, error: "Missing orderId" });
        const orderSnap = await getDoc(doc(db, 'orders', req.body.orderId));
        if (!orderSnap.exists()) return res.status(404).json({ success: false, error: "Order not found" });
        const order = orderSnap.data();
        const isCod = order.paymentMode === "partial";
        
        let productDesc = order.productName || "Jersey";
        if (order.category) productDesc += ` - ${order.category.replace("-", " ")}`;
        if (order.size) productDesc += ` - Size ${order.size}`;
        
        return res.json({
           success: true,
           diagnostic: {
              orderId: req.body.orderId,
              pickupLocation: (process.env.DELHIVERY_PICKUP_LOCATION || "").trim(),
              destinationPincode: order.pincode,
              paymentMode: isCod ? "COD" : "Prepaid",
              codAmount: isCod ? (order.codAmount || 0) : 0,
              product: productDesc,
              quantity: order.quantity || 1,
              weight: 500,
              endpointUsed: "https://track.delhivery.com/api/cmu/create.json"
           }
        });
      }

            if (action === 'create') {
        if (!req.body.orderId) return res.status(400).json({ success: false, error: "Missing orderId" });
        const orderId = req.body.orderId;
        
        // Fetch authoritative order record from database
        const orderSnap = await getDoc(doc(db, 'orders', orderId));
        if (!orderSnap.exists()) return res.status(404).json({ success: false, error: "Order Data Error: Order not found in database" });
        
        const order = orderSnap.data();
        
        // DUPLICATE SHIPMENT PROTECTION
        if (order.delhiveryAwb || order.delhiveryShipmentId || order.awbNumber || order.trackingId) {
           return res.status(400).json({ success: false, error: "Duplicate Shipment: Order already has an AWB or Tracking ID", awb: order.delhiveryAwb || order.awbNumber || order.trackingId });
        }
        
        // Validate required fields
        const required = ['fullName', 'phone', 'address', 'pincode', 'paymentMode'];
        for (const field of required) {
          if (order[field] === undefined || order[field] === null || order[field] === "") {
             return res.status(400).json({ success: false, error: `Order Data Error: Missing required field: ${field}` });
          }
        }
        
        let effectiveDeliveryType = "Surface";
        if (order.deliveryType) {
            const rawType = String(order.deliveryType).trim().toLowerCase();
            effectiveDeliveryType = (rawType === "fast" || rawType === "express") ? "Express" : "Surface";
        }
        console.log(`[Delhivery API] Final Delivery Type sent for order ${orderId}: ${effectiveDeliveryType}`);

        // WAREHOUSE VALIDATION
        const rawWarehouse = process.env.DELHIVERY_PICKUP_LOCATION || "";
        const pickupLocation = rawWarehouse.trim();
        
        console.log("[Delhivery Diagnostic] Raw WAREHOUSE:", `"${rawWarehouse}"`);
        console.log("[Delhivery Diagnostic] Trimmed WAREHOUSE:", `"${pickupLocation}"`);
        
        if (!pickupLocation) {
             return res.status(400).json({ success: false, error: "Delhivery Configuration Error: DELHIVERY_PICKUP_LOCATION environment variable is not set. Please configure the exact registered warehouse name." });
        }
        
        // CUSTOMER NAME LOGIC
        const nameParts = String(order.fullName).trim().split(" ");
        const firstName = nameParts[0] || "";
        let lastName = nameParts.slice(1).join(" ").trim();
        if (!lastName) {
            lastName = firstName;
        }
        const formattedName = `${firstName} ${lastName}`;
        
        if (!firstName) {
            return res.status(400).json({ success: false, error: "Order Data Error: First name is missing from fullName" });
        }
        
        // PAYMENT CALCULATION
        const totalOrderValue = Number(order.totalOrderValue ?? order.finalTotal ?? order.price ?? 0);
        const amountPaid = Number(order.amountPaid ?? order.advancePaid ?? 0);
        
        // Use existing payment calculation rules
        let calculatedCodAmount = Number(order.codAmount ?? order.remainingCodAmount ?? 0);
        if (order.codAmount === undefined && order.remainingCodAmount === undefined) {
            calculatedCodAmount = Math.max(0, totalOrderValue - amountPaid);
        }
        
        // Also ensure a fully prepaid order has 0 COD
        const isFullyPrepaid = order.paymentMode === "full" || String(order.status).toLowerCase().includes("full") || order.paymentMethod === "PREPAID" || order.paymentStatus === "FULLY_PAID" || amountPaid >= totalOrderValue;
        if (isFullyPrepaid) {
            calculatedCodAmount = 0;
        }

        const isCod = calculatedCodAmount > 0;
        
        if (isNaN(totalOrderValue) || isNaN(amountPaid) || isNaN(calculatedCodAmount)) {
            return res.status(400).json({ success: false, error: "Payment Calculation Error: One or more payment values are invalid (NaN)" });
        }
        
        console.log(`[Delhivery API] Payment Mode: ${isCod ? "COD" : "Prepaid"} | COD Amount: ${isCod ? calculatedCodAmount : 0}`);
        
        let productDesc = order.productName || "Jersey";
        if (order.category) productDesc += ` - ${order.category.replace("-", " ")}`;
        if (order.size) productDesc += ` - Size ${order.size}`;
        if (order.customization) {
           if (typeof order.customization === 'string') productDesc += ` - Customization: ${order.customization}`;
           else if (order.customization.name) productDesc += ` - Customization: ${order.customization.name} ${order.customization.number || ''}`;
        }
        
        const payload = {
          format: "json",
          data: {
            shipments: [{
              name: formattedName,
              add: order.address,
              pin: order.pincode,
              city: order.city || "",
              state: order.state || "",
              country: "India",
              phone: order.phone,
              order: String(order.orderNumber || orderId),
              payment_mode: isCod ? "COD" : "Prepaid",
              cod_amount: isCod ? calculatedCodAmount : 0,
              products_desc: productDesc,
              quantity: String(order.quantity || 1),
              weight: String(500), 
              shipment_length: 20, shipment_width: 20, shipment_height: 5,
              total_amount: totalOrderValue,
              shipping_mode: effectiveDeliveryType
            }],
            pickup_location: { name: pickupLocation }
          }
        };
        
        console.log("[Delhivery API Request Payload]:", JSON.stringify(payload.data, null, 2));
        const formData = new URLSearchParams(); 
        formData.append("format", "json"); 
        formData.append("data", JSON.stringify(payload.data));
        
        const response = await fetch("https://track.delhivery.com/api/cmu/create.json", {
          method: "POST", headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
        
        const data = await response.json();
        
        if (!data.success || data.error === true || !data.packages || data.packages.length === 0 || !data.packages[0].waybill || data.packages[0].status === "Fail") {
          console.error("[Delhivery API Error] Status:", response.status);
          console.error("[Delhivery API Error] Body:", JSON.stringify(data, null, 2));
          
          let errorMsg = "Failed to create shipment.";
          if (data.packages && data.packages.length > 0 && data.packages[0].remarks && data.packages[0].remarks.length > 0) {
            errorMsg = data.packages[0].remarks.join(" ");
          } else if (typeof data.error === "string") {
            errorMsg = data.error;
          } else if (data.rmk) {
            errorMsg = data.rmk;
          } else if (data.error !== undefined) {
            errorMsg = JSON.stringify(data.error);
          }
          
          errorMsg = String(errorMsg); // Ensure it is always a string
          
          if (errorMsg.includes('ClientWarehouse')) {
            const usedWarehouse = pickupLocation;
            errorMsg = `Delhivery pickup warehouse ('${usedWarehouse}') is not registered or active. Please check the exact warehouse name configured in your Delhivery account.\n\nActual Error: ${errorMsg}`;
          }
          
          return res.status(400).json({ 
             success: false, 
             error: `Delhivery API Error: ${errorMsg}`,
             delhiveryStatus: response.status,
             delhiveryResponse: data
          });
        }
        
        const awb = data.packages[0].waybill;
        
        // Save to DB
        await updateDoc(doc(db, 'orders', orderId), {
          delhiveryAwb: awb,
          delhiveryShipmentId: data.packages[0].client || "",
          delhiveryOrderId: String(order.orderNumber || orderId),
          delhiveryStatus: "Manifested",
          delhiveryTrackingUrl: `https://www.delhivery.com/track/package/${awb}`,
          delhiveryPickupLocation: pickupLocation,
          delhiveryCreatedAt: new Date().toISOString(),
          delhiveryUpdatedAt: new Date().toISOString(),
          // Standard generic shipping fields
          awbNumber: awb,
          shippingProvider: "Delhivery",
          shippingStatus: "Manifested",
          courierName: "Delhivery",
          trackingId: awb,
          trackingUrl: `https://www.delhivery.com/track/package/${awb}`,
          shipmentCreatedAt: new Date().toISOString()
        });
        
        return res.json({ success: true, awb, data });
      }
      if (action === 'label') {
        const response = await fetch(`https://track.delhivery.com/api/p/packing_slip?wbns=${awb}&pdf=true`, { headers: { "Authorization": `Token ${apiKey}` } });
        const data = await response.json(); return res.json(data);
      }

      if (action === 'track') {
        const response = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${awb}`, { headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" } });
        const data = await response.json(); return res.json(data);
      }

      return res.status(400).json({ success: false, error: "Invalid action" });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  
}
