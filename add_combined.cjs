const fs = require('fs');
let file = 'api/delhivery.ts';
let content = fs.readFileSync(file, 'utf8');

const combinedLogic = `      if (action === 'create_combined') {
        const orderIds = req.body.orderIds;
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ success: false, error: "Missing or empty orderIds array" });
        }
        
        const orders = [];
        for (const id of orderIds) {
            const snap = await getDoc(doc(db, 'orders', id));
            if (!snap.exists()) return res.status(404).json({ success: false, error: \`Order Data Error: Order \${id} not found in database\` });
            const data = snap.data();
            data.id = id;
            orders.push(data);
        }

        // DUPLICATE SHIPMENT PROTECTION
        for (const order of orders) {
            if (order.delhiveryAwb || order.delhiveryShipmentId || order.awbNumber || order.trackingId) {
                return res.status(400).json({ success: false, error: \`Duplicate Shipment: Order \${order.orderNumber || order.id} already has an AWB or Tracking ID\`, awb: order.delhiveryAwb || order.awbNumber || order.trackingId });
            }
        }
        
        // Validate required fields and consistency
        const firstOrder = orders[0];
        const required = ['fullName', 'phone', 'address', 'pincode'];
        for (const field of required) {
            if (firstOrder[field] === undefined || firstOrder[field] === null || firstOrder[field] === "") {
               return res.status(400).json({ success: false, error: \`Order Data Error: Missing required field \${field} in first order\` });
            }
        }
        
        const basePhone = String(firstOrder.phone).replace(/\\D/g, '').slice(-10);
        const baseAddress = String(firstOrder.address).toLowerCase().trim();
        const basePincode = String(firstOrder.pincode).toLowerCase().trim();
        let baseType = (firstOrder.deliveryType && (String(firstOrder.deliveryType).toLowerCase() === "fast" || String(firstOrder.deliveryType).toLowerCase() === "express")) ? "Express" : "Surface";
        
        for (const order of orders) {
            const p = String(order.phone).replace(/\\D/g, '').slice(-10);
            if (p !== basePhone) return res.status(400).json({ success: false, error: \`Cannot combine shipments: customer shipping details differ. Phone numbers do not match (\${basePhone} vs \${p}).\` });
            if (String(order.pincode).toLowerCase().trim() !== basePincode) return res.status(400).json({ success: false, error: "Cannot combine shipments: customer shipping details differ. Pincodes do not match." });
            
            let t = (order.deliveryType && (String(order.deliveryType).toLowerCase() === "fast" || String(order.deliveryType).toLowerCase() === "express")) ? "Express" : "Surface";
            if (t !== baseType) return res.status(400).json({ success: false, error: "These orders have different delivery types and cannot be combined into one shipment." });
        }
        
        let combinedCodAmount = 0;
        let combinedTotalAmount = 0;
        let combinedQuantity = 0;
        let combinedDescLines = [];
        let combinedOrderNumbers = [];
        
        for (const order of orders) {
             const totalOrderValue = Number(order.totalOrderValue ?? order.finalTotal ?? order.price ?? 0);
             const amountPaid = Number(order.amountPaid ?? order.advancePaid ?? 0);
             let calculatedCodAmount = Number(order.codAmount ?? order.remainingCodAmount ?? 0);
             if (order.codAmount === undefined && order.remainingCodAmount === undefined) {
                 calculatedCodAmount = Math.max(0, totalOrderValue - amountPaid);
             }
             const isFullyPrepaid = order.paymentMode === "full" || String(order.status).toLowerCase().includes("full") || order.paymentMethod === "PREPAID" || order.paymentStatus === "FULLY_PAID" || amountPaid >= totalOrderValue;
             if (isFullyPrepaid) {
                 calculatedCodAmount = 0;
             }
             if (isNaN(totalOrderValue) || isNaN(calculatedCodAmount)) {
                 return res.status(400).json({ success: false, error: \`Payment Calculation Error in order \${order.orderNumber || order.id}\` });
             }
             
             combinedCodAmount += calculatedCodAmount;
             combinedTotalAmount += totalOrderValue;
             combinedQuantity += Number(order.quantity || 1);
             
             let pd = order.productName || "Jersey";
             if (order.size) pd += \` Size \${order.size}\`;
             if (order.customization) {
                 if (typeof order.customization === 'string') pd += \` Cust: \${order.customization}\`;
                 else if (order.customization.name) pd += \` Cust: \${order.customization.name} \${order.customization.number || ''}\`;
             }
             combinedDescLines.push(pd);
             combinedOrderNumbers.push(String(order.orderNumber || order.id));
        }

        const isCod = combinedCodAmount > 0;
        const productsDesc = combinedDescLines.join(" | ");
        const orderIdsStr = combinedOrderNumbers.join("-");

        // WAREHOUSE VALIDATION
        const rawWarehouse = process.env.DELHIVERY_PICKUP_LOCATION || "";
        const pickupLocation = rawWarehouse.trim();
        if (!pickupLocation) {
             return res.status(400).json({ success: false, error: "Delhivery Configuration Error: DELHIVERY_PICKUP_LOCATION environment variable is not set." });
        }

        const nameParts = String(firstOrder.fullName).trim().split(" ");
        const firstName = nameParts[0] || "";
        let lastName = nameParts.slice(1).join(" ").trim();
        if (!lastName) lastName = firstName;
        const formattedName = \`\${firstName} \${lastName}\`;

        const payload = {
          format: "json",
          data: {
            shipments: [{
              name: formattedName,
              add: firstOrder.address,
              pin: firstOrder.pincode,
              city: firstOrder.city || "",
              state: firstOrder.state || "",
              country: "India",
              phone: firstOrder.phone,
              order: orderIdsStr,
              payment_mode: isCod ? "COD" : "Prepaid",
              cod_amount: isCod ? combinedCodAmount : 0,
              products_desc: productsDesc.substring(0, 500),
              quantity: String(combinedQuantity),
              weight: String(500 * combinedQuantity),
              shipment_length: 20, shipment_width: 20, shipment_height: 5 * combinedQuantity,
              total_amount: combinedTotalAmount,
              shipping_mode: baseType
            }],
            pickup_location: { name: pickupLocation }
          }
        };

        const formData = new URLSearchParams(); 
        formData.append("format", "json"); 
        formData.append("data", JSON.stringify(payload.data));
        
        const response = await fetch("https://track.delhivery.com/api/cmu/create.json", {
          method: "POST", headers: { "Authorization": \`Token \${apiKey}\`, "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
        
        const data = await response.json();
        
        if (!data.success || data.error === true || !data.packages || data.packages.length === 0 || !data.packages[0].waybill || data.packages[0].status === "Fail") {
          let errorMsg = "Failed to create combined shipment.";
          if (data.packages && data.packages.length > 0 && data.packages[0].remarks && data.packages[0].remarks.length > 0) {
            errorMsg = data.packages[0].remarks.join(" ");
          } else if (typeof data.error === "string") {
            errorMsg = data.error;
          } else if (data.rmk) {
            errorMsg = data.rmk;
          } else if (data.error !== undefined) {
            errorMsg = JSON.stringify(data.error);
          }
          errorMsg = String(errorMsg);
          return res.status(400).json({ success: false, error: \`Delhivery API Error: \${errorMsg}\`, delhiveryResponse: data });
        }
        
        const awb = data.packages[0].waybill;
        
        for (const order of orders) {
            await updateDoc(doc(db, 'orders', order.id), {
              delhiveryAwb: awb,
              delhiveryShipmentId: data.packages[0].client || "",
              delhiveryOrderId: orderIdsStr,
              delhiveryStatus: "Manifested",
              delhiveryTrackingUrl: \`https://www.delhivery.com/track/package/\${awb}\`,
              delhiveryPickupLocation: pickupLocation,
              delhiveryCreatedAt: new Date().toISOString(),
              delhiveryUpdatedAt: new Date().toISOString(),
              awbNumber: awb,
              shippingProvider: "Delhivery",
              shippingStatus: "Manifested",
              courierName: "Delhivery",
              trackingId: awb,
              trackingUrl: \`https://www.delhivery.com/track/package/\${awb}\`,
              shipmentCreatedAt: new Date().toISOString()
            });
        }
        
        return res.json({ success: true, awb, data });
      }
`;

const replaceStr = "      if (action === 'label') {";
if (content.indexOf(replaceStr) === -1) {
    throw new Error("Could not find action === 'label'");
}

content = content.replace(replaceStr, combinedLogic + "\\n" + replaceStr);
fs.writeFileSync(file, content, 'utf8');
console.log("Combined route added!");
