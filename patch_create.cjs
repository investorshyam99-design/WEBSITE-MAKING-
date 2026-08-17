const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `          shipments: [{
            name: orderData.fullName, add: orderData.address, pin: orderData.pincode, city: orderData.city,
            state: orderData.state, country: "India", phone: orderData.phone, order: String(orderData.orderNumber),
            payment_mode: orderData.paymentMode === "full" ? "Pre-paid" : "COD",
            cod_amount: orderData.paymentMode === "full" ? 0 : orderData.codAmount,
            products_desc: orderData.productDesc, quantity: String(orderData.quantity || 1),
            weight: String(orderData.weight || 500), total_amount: orderData.finalTotal, shipping_mode: orderData.shippingMode || "Surface"
          }],`;

const replace = `          shipments: [{
            name: orderData.fullName, add: orderData.address, pin: orderData.pincode, city: orderData.city,
            state: orderData.state, country: "India", phone: orderData.phone, order: String(orderData.orderNumber),
            payment_mode: orderData.paymentMode === "full" ? "Prepaid" : "COD",
            cod_amount: orderData.paymentMode === "full" ? 0 : orderData.codAmount,
            products_desc: orderData.productDesc, quantity: String(orderData.quantity || 1),
            weight: String(orderData.weight || 500), 
            shipment_length: 20, shipment_width: 20, shipment_height: 5,
            total_amount: orderData.finalTotal, shipping_mode: orderData.shippingMode || "Surface"
          }],`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('server.ts', code);
    console.log('patched shipment payload');
} else {
    console.log('could not find shipment payload');
}
