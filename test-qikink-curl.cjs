const https = require('https');

const req = https.request('https://sandbox.qikink.com/api/order/create', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let body = "";
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log("BODY:", body); });
});
req.end();
