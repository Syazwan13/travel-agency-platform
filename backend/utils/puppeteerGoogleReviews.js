const puppeteer = require('puppeteer');

async function scrapeGoogleReviews(resortName, maxReviews = 10) {
  const browser = await puppeteer.launch({ headless: "new", args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    // Go to Google Maps
    await page.goto('https://www.google.com/maps', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('input#searchboxinput');
    await page.type('input#searchboxinput', resortName);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);

    // Click the first result if needed
    // Wait for the reviews button
    await page.waitForSelector('button[jsaction*="pane.rating.moreReviews"]', { timeout: 10000 });
    await page.click('button[jsaction*="pane.rating.moreReviews"]');
    await page.waitForTimeout(3000);

    // Scroll to load more reviews
    let lastHeight = await page.evaluate('document.querySelector(".m6QErb.DxyBCb.kA9KIf.dS8AEf").scrollHeight');
    let reviewsLoaded = 0;
    while (reviewsLoaded < maxReviews) {
      await page.evaluate('document.querySelector(".m6QErb.DxyBCb.kA9KIf.dS8AEf").scrollTo(0, document.querySelector(".m6QErb.DxyBCb.kA9KIf.dS8AEf").scrollHeight)');
      await page.waitForTimeout(1500);
      let newHeight = await page.evaluate('document.querySelector(".m6QErb.DxyBCb.kA9KIf.dS8AEf").scrollHeight');
      if (newHeight === lastHeight) break;
      lastHeight = newHeight;
      reviewsLoaded = await page.evaluate('document.querySelectorAll(".jftiEf.fontBodyMedium").length');
    }

    // Extract reviews
    const reviews = await page.evaluate((maxReviews) => {
      const reviewEls = Array.from(document.querySelectorAll('.jftiEf.fontBodyMedium')).slice(0, maxReviews);
      return reviewEls.map(el => {
        const name = el.querySelector('.d4r55')?.innerText || '';
        const rating = parseFloat(el.querySelector('.kvMYJc')?.getAttribute('aria-label')?.replace(/[^\d.]/g, '')) || null;
        const text = el.querySelector('.wiI7pd')?.innerText || '';
        const date = el.querySelector('.rsqaWe')?.innerText || '';
        return { name, rating, text, date };
      });
    }, maxReviews);

    return reviews;
  } catch (err) {
    console.error('Error scraping Google reviews:', err);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeGoogleReviews }; 