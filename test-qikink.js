const http = require('http');

const data = JSON.stringify({
  order: {
    id: "test1",
    fullName: "Test User",
    address: "24 MIG muninagar colony, near Do talab Neera RO water,, Ujjain, Ujjain, Madhya Pradesh, Pincode: 456010",
    phone: "9516381483",
    paymentMode: "full",
    cartItems: [{
      productId: "JERSEY-PREMIUM",
      quantity: 1,
      selectedSize: "M",
      price: 1199
    }]
  }
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/qikink/send-order',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let body = "";
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log("BODY:", body); });
});

req.on('error', (e) => { console.error(`problem with request: ${e.message}`); });
req.write(data);
req.end();
