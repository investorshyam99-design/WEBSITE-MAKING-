const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the delivery type logic
  const oldDeliveryLogic = /const rawType = String\(order\.deliveryType \|\| ""\)\.toLowerCase\(\);\s*const effectiveDeliveryType = \(rawType === "fast" \|\| rawType === "express"\) \? "Express" : "Surface";/g;
  
  const newDeliveryLogic = `let effectiveDeliveryType = "Surface";
        if (order.deliveryType) {
            const rawType = String(order.deliveryType).trim().toLowerCase();
            effectiveDeliveryType = (rawType === "fast" || rawType === "express") ? "Express" : "Surface";
        }
        console.log(\`[Delhivery API] Final Delivery Type sent for order \${orderId}: \${effectiveDeliveryType}\`);`;

  content = content.replace(oldDeliveryLogic, newDeliveryLogic);
  
  const oldPaymentCalc = /\/\/ PAYMENT CALCULATION[\s\S]*?(?=let productDesc = order\.productName)/g;
  
  const newPaymentCalc = `// PAYMENT CALCULATION
        const totalOrderValue = Number(order.totalOrderValue ?? order.finalTotal ?? order.price ?? 0);
        const amountPaid = Number(order.amountPaid ?? order.advancePaid ?? 0);
        const storedCodAmount = Number(order.codAmount ?? order.remainingCodAmount ?? 0);
        
        const isCod = storedCodAmount > 0;
        
        if (isNaN(totalOrderValue) || isNaN(amountPaid) || isNaN(storedCodAmount)) {
            return res.status(400).json({ success: false, error: "Payment Calculation Error: One or more payment values are invalid (NaN)" });
        }
        
        console.log(\`[Delhivery API] Payment Mode: \${isCod ? "COD" : "Prepaid"} | COD Amount: \${isCod ? storedCodAmount : 0}\`);
        
        `;

  content = content.replace(oldPaymentCalc, newPaymentCalc);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${filePath}`);
}

patchFile('server.ts');
patchFile('api/delhivery.ts');
