import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('checkout.razorpay.com/v1/checkout.js')) {
      request.respond({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.Razorpay = function(options) {
            this.open = function() {
              setTimeout(() => {
                options.handler({
                  razorpay_payment_id: 'pay_test123',
                  razorpay_order_id: 'order_test123',
                  razorpay_signature: 'sig_test123'
                });
              }, 500);
            };
          };
        `
      });
    } else {
      request.continue();
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR STACK:', err.stack);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  await page.evaluate(() => {
    window.localStorage.setItem('cart', JSON.stringify([{
      id: 'FCB-H-2324',
      name: 'FC Barcelona Home Jersey',
      price: 999,
      quantity: 1,
      selectedSize: 'M',
      category: 'player-version'
    }]));
  });

  await page.goto('http://localhost:3000/checkout', { waitUntil: 'domcontentloaded' });
  
  // wait for react to render
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Current URL:", page.url());
  
  const element = await page.$('input[placeholder="Full Name"]');
  if (!element) {
     console.log("Element not found. Dumping HTML.");
     const html = await page.content();
     console.log(html.substring(0, 1000));
  } else {
     console.log("Element found, proceeding...");
     await page.type('input[placeholder="Full Name"]', 'Test User');
     await page.type('input[placeholder="Mobile Number"]', '9999999999');
     await page.type('input[placeholder="Enter Pincode"]', '400001');
     
     await page.evaluate(() => {
       [...document.querySelectorAll('button')].find(b => b.innerText.includes('Check Pincode'))?.click();
     });
     
     await new Promise(r => setTimeout(r, 1000));
     await page.type('input[placeholder="Address (House No, Area, Street)"]', '123 Test St');
     await page.type('input[placeholder="City"]', 'Mumbai');
     await page.type('input[placeholder="State"]', 'Maharashtra');
     
     await page.evaluate(() => {
       [...document.querySelectorAll('button')].find(b => b.innerText.includes('SECURELY'))?.click();
     });
     
     await new Promise(r => setTimeout(r, 4000));
  }
  
  console.log("Done");
  await browser.close();
  process.exit(0);
})();
