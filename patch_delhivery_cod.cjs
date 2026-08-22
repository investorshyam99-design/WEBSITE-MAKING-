const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We need to find the payment calculation block
  const oldBlock = `        // PAYMENT CALCULATION
        const totalOrderValue = Number(order.totalOrderValue ?? order.finalTotal ?? order.price ?? 0);
        const amountPaid = Number(order.amountPaid ?? order.advancePaid ?? 0);
        const storedCodAmount = Number(order.codAmount ?? order.remainingCodAmount ?? 0);
        
        const isCod = storedCodAmount > 0;
        
        if (isNaN(totalOrderValue) || isNaN(amountPaid) || isNaN(storedCodAmount)) {
            return res.status(400).json({ success: false, error: "Payment Calculation Error: One or more payment values are invalid (NaN)" });
        }
        
        console.log(\`[Delhivery API] Payment Mode: \${isCod ? "COD" : "Prepaid"} | COD Amount: \${isCod ? storedCodAmount : 0}\`);`;

  const newBlock = `        // PAYMENT CALCULATION
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
        
        console.log(\`[Delhivery API] Payment Mode: \${isCod ? "COD" : "Prepaid"} | COD Amount: \${isCod ? calculatedCodAmount : 0}\`);`;

  if (content.includes(oldBlock)) {
      content = content.replace(oldBlock, newBlock);
      content = content.replace(/storedCodAmount/g, 'calculatedCodAmount');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched payment logic in ${filePath}`);
  } else {
      console.log(`Could not find old payment block in ${filePath}`);
  }
}

patchFile('server.ts');
patchFile('api/delhivery.ts');
