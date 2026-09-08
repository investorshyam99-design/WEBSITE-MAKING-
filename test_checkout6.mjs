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
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    window.alert = (msg) => console.log("ALERT:", msg);
    
    Object.defineProperty(window, 'Razorpay', {
      get() {
        return function(options) {
          console.log("MOCKED RAZORPAY CONSTRUCTOR CALLED");
          this.open = function() {
            console.log("MOCKED RAZORPAY OPENED - CALLING HANDLER");
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
      set(val) {}
    });
  });
  
  console.log("Filling Delivery Checker Pincode");
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    // Find the one with placeholder pincode
    let pinInput = Array.from(inputs).find(i => i.placeholder.toLowerCase().includes('pincode'));
    if(pinInput) {
      pinInput.value = '400001';
      pinInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  console.log("Clicking Check Pincode");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    let checkBtn = btns.find(b => b.textContent.toLowerCase().includes('check'));
    if(checkBtn) {
      checkBtn.click();
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));

  console.log("Filling rest of the form");
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    let nameInput = Array.from(inputs).find(i => i.placeholder.toLowerCase().includes('name'));
    if(nameInput) {
      nameInput.value = 'Test User';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    let phoneInput = Array.from(inputs).find(i => i.placeholder.toLowerCase().includes('phone') || i.type === 'tel');
    if(phoneInput) {
      phoneInput.value = '9999999999';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    let houseInput = Array.from(inputs).find(i => i.placeholder.toLowerCase().includes('house'));
    if(houseInput) {
      houseInput.value = 'Test House';
      houseInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Clicking checkout button");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const checkoutBtn = btns.find(b => b.textContent.includes('Proceed to Pay'));
    if (checkoutBtn) checkoutBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 8000));
  console.log("Done");
  await browser.close();
})();
