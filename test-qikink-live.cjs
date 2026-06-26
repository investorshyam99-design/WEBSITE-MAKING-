const https = require('https');

Function.prototype.makeReq = function(url) {
  const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
    console.log(`URL: ${url} STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let body = "";
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => { console.log("BODY:", body.substring(0, 100)); });
  });
  req.end();
}

Function.prototype.makeReq('https://api.qikink.com/api/order/create');
Function.prototype.makeReq('https://qikink.com/api/order/create');
