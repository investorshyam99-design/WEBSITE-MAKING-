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
    console.log('PAGE ERROR MESSAGE:', err.message);
    console.log('PAGE ERROR STACK:', err.stack);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.localStorage.setItem('cart', JSON.stringify([{
      id: 'prod1',
      name: 'Test Jersey',
      price: 999,
      quantity: 1,
      selectedSize: 'M',
      category: 'player-version'
    }]));
  });

  await page.goto('http://localhost:3000/checkout', { waitUntil: 'networkidle0' });
  await page.type('input[placeholder="Full Name"]', 'Test User');
  await page.type('input[placeholder="Mobile Number"]', '9999999999');
  await page.type('input[placeholder="Enter Pincode"]', '400001');
  await page.click('button:has-text("Check Pincode")');
  await new Promise(r => setTimeout(r, 1000));
  await page.type('input[placeholder="Address (House No, Area, Street)"]', '123 Test St');
  await page.type('input[placeholder="City"]', 'Mumbai');
  await page.type('input[placeholder="State"]', 'Maharashtra');
  
  const checkoutBtn = await page.$('button.bg-[#1E2A44]');
  await checkoutBtn.click();
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
