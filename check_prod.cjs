const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('https://ais-pre-p7xyeepoiedyonbce6punu-852883968150.asia-southeast1.run.app/product/real-madrid-third-2026-2027-jersey-player', { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (e) {
    console.log("Goto error:", e.message);
  }
  
  const content = await page.content();
  console.log("HTML length:", content.length);
  if (content.includes('Product not found')) {
      console.log('Found "Product not found" in HTML');
  }
  
  await browser.close();
})();
