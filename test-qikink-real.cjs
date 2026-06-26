const http = require('http');

const data = JSON.stringify({
  order: {
    "id": "A1B2C3D4",
    "fullName": "Jerseyunicorn1",
    "address": "24 MIG muninagar colony, near Do talab Neera RO water,, Ujjain , Ujjain, Madhya Pradesh, Pincode: 456010",
    "phone": "9516381483",
    "paymentMode": "full",
    "cartItems": [
      {
        "productId": "Argentina-Messi-10-Dark-Blue-Acidwash-Unisex-Oversized-T-shirt",
        "quantity": 1,
        "selectedSize": "M",
        "price": 1499,
        "product": {
          "id": "Argentina-Messi-10-Dark-Blue-Acidwash-Unisex-Oversized-T-shirt"
        }
      }
    ]
  }
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/qikink/send-order',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
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
