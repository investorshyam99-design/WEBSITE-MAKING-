import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log("Navigating to home");
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  console.log("Setting cart in localStorage");
  await page.evaluate(() => {
    window.localStorage.setItem('cart', JSON.stringify([
      {
        id: "prod_1",
        price: 1000,
        quantity: 1,
        title: "Test Jersey",
        category: "player-version",
        image: "test.jpg",
        selectedSize: "M",
        customization: { name: "TEST", number: "10" }
      }
    ]));
  });
  
  console.log("Navigating to checkout");
  await page.goto('http://localhost:3000/checkout', { waitUntil: 'domcontentloaded' });
  
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Setting up global trigger for Razorpay success");
  await page.evaluate(() => {
    // We override window.Razorpay to capture the options and immediately call handler
    const originalRazorpay = window.Razorpay;
    Object.defineProperty(window, 'Razorpay', {
      get() {
        return function(options) {
          console.log("MOCKED RAZORPAY CONSTRUCTOR CALLED");
          this.open = function() {
            console.log("MOCKED RAZORPAY OPENED - CALLING HANDLER");
            // Call handler directly
            setTimeout(() => {
              options.handler({
                razorpay_payment_id: 'pay_test123',
                razorpay_order_id: 'order_test123',
                razorpay_signature: 'sig_test123'
              });
            }, 500);
          };
          this.on = function() {};
        };
      },
      set(val) {
         // ignore
      }
    });
  });
  
  console.log("Filling form");
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    if(inputs.length > 3) {
      inputs[0].value = 'Test User'; 
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[1].value = '9999999999'; 
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[2].value = '400001'; 
      inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[3].value = 'Test House'; 
      inputs[3].dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Clicking checkout button");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const checkoutBtn = btns.find(b => b.textContent.includes('Proceed to Pay'));
    if (checkoutBtn) checkoutBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 5000));
  console.log("Done");
  await browser.close();
})();
