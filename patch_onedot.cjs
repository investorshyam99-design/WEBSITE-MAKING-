const fs = require('fs');
let file = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const regexOneDot = /\/\/ Fire Meta Pixel Purchase event with order ID/g;
const replacementOneDot = `// Attempt Auto-Ship via OneDot
              try {
                const productDesc = cart.map(item => \`\${item.name} - Size \${item.selectedSize} - Customization: \${item.customization ? "YES" : "NO"}\`).join(" | ");
                const orderData = {
                  orderNumber: nextOrderNumber,
                  fullName,
                  phone,
                  address: combinedAddress,
                  city: deliveryLocation?.city || city,
                  state: deliveryLocation?.state || state,
                  pincode,
                  paymentMode,
                  codAmount: paymentMode === "full" ? 0 : (total - advanceAmount),
                  productDesc,
                  quantity: itemsCount,
                  finalTotal: total,
                  weight: itemsCount * 500
                };
                const oneDotRes = await fetch("/api/shipping/onedot/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderData })
                });
                const data = await oneDotRes.json();
                if (data.success && data.awb) {
                  for (const id of createdOrderIds) {
                    await updateDoc(doc(db, "orders", id), {
                      awbNumber: data.awb,
                      oneDotShipmentId: data.awb,
                      shippingProvider: "OneDot Delivery",
                      shippingStatus: "Manifested",
                      courierName: "OneDot Delivery",
                      trackingId: data.awb,
                      shipmentCreatedAt: new Date().toISOString()
                    });
                  }
                } else {
                  alert("Shipment creation failed — retry (can be done from Admin dashboard).");
                }
              } catch (err) {
                console.error("OneDot Auto-ship error:", err);
                alert("Shipment creation failed — retry (can be done from Admin dashboard).");
              }
              
              // Fire Meta Pixel Purchase event with order ID`;

file = file.replace(regexOneDot, replacementOneDot);

fs.writeFileSync('src/components/CartModal.tsx', file);
