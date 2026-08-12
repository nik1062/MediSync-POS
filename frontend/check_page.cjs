const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST_FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log('Page loaded successfully.');
    await browser.close();
  } catch (err) {
    console.error('SCRIPT_ERROR:', err);
    process.exit(1);
  }
})();
