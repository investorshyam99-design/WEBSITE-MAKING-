const https = require('https');
const fs = require('fs');

https.get('https://i.imgur.com/xVGnPXO.jpeg', (res) => {
  let data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => fs.writeFileSync('public/logo-source.jpg', Buffer.concat(data)));
});
