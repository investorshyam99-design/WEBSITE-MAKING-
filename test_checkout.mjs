import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  // Go to homepage
  console.log("Navigating to home");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Wait for products to load, click on first product link
  console.log("Navigating to product");
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const productLink = links.find(l => l.href.includes('/product/'));
    if (productLink) productLink.click();
  });
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  // Click Add to Cart
  console.log("Adding to cart");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Add to Cart') || b.textContent.includes('Buy Now'));
    if (addBtn) addBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Go to Checkout
  console.log("Going to checkout");
  await page.goto('http://localhost:3000/checkout', { waitUntil: 'networkidle0' });
  
  // Try navigating back to account to simulate "success"
  console.log("Simulating checkout success navigation");
  await page.evaluate(() => {
     // clear cart
     window.localStorage.removeItem("cart");
  });
  
  await page.goto('http://localhost:3000/account', { waitUntil: 'networkidle0' });
  
  console.log("Done");
  await browser.close();
})();
