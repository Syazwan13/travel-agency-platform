const puppeteer = require('puppeteer');

// Known resort URLs to scrape packages from
const resortUrls = [
  { url: 'https://www.holidaygogogo.com/aman-tioman-beach-resort-pulau-tioman/', resort: "Aman Tioman Beach Resort", island: "Tioman" },
  { url: 'https://www.holidaygogogo.com/paya-beach-spa-dive-resort-photo-gallery/', resort: "Paya Beach Spa & Dive Resort", island: "Tioman" },
  { url: 'https://www.holidaygogogo.com/the-barat-beach-resort-pulau-tioman/', resort: "The Barat Beach Resort", island: "Tioman" },
  { url: 'https://www.holidaygogogo.com/3d2n-tioman-snorkeling-tour-sun-beach-resort-gallery/', resort: "Sun Beach Resort", island: "Tioman" },
  { url: 'https://www.holidaygogogo.com/tunamaya-beach-spa-resort-pulau-tioman/', resort: "Tunamaya Beach & Spa Resort", island: "Tioman" },
  { url: 'https://www.holidaygogogo.com/berjaya-tioman-resort-pulau-tioman/', resort: "Berjaya Tioman Resort", island: "Tioman" },

  // New URLs for Pulau Redang
  { url: 'https://www.holidaygogogo.com/laguna-resort-pulau-redang/', resort: "Laguna Redang Resort", island: "Redang" },
  { url: 'https://www.holidaygogogo.com/redang-beach-resort-pulau-redang/', resort: "Redang Beach Resort", island: "Redang" },
  { url: 'https://www.holidaygogogo.com/redang-pelangi-resort-pulau-redang/', resort: "Redang Pelangi Resort", island: "Redang" },
  { url: 'https://www.holidaygogogo.com/redang-bay-resort-pulau-redang/', resort: "Redang Bay Resort", island: "Redang" },
  { url: 'https://www.holidaygogogo.com/redang-reef-resort-pulau-redang/', resort: "Redang Reef Resort", island: "Redang" },
  { url: 'https://www.holidaygogogo.com/redang-holiday-beach-villa-pulau-redang/', resort: "Redang Holiday Beach Villa", island: "Redang" },
  { url: 'https://www.holidaygogogo.com/redang-mutiara-beach-resort-pulau-redang/', resort: "Redang Mutiara Beach Resort", island: "Redang" },

  // New URLs for Perhentian
  { url: 'https://www.holidaygogogo.com/coral-view-island-resort/', resort: "Coral View Island Resort", island: "Perhentian" },
  { url: 'https://www.holidaygogogo.com/the-barat-beach-resort/', resort: "The Barat Beach Resort", island: "Perhentian" },
  { url: 'https://www.holidaygogogo.com/perhentian-island-resort/', resort: "Perhentian Island Resort", island: "Perhentian" },
  { url: 'https://www.holidaygogogo.com/shari-la-island-resort/', resort: "Shari-La Island Resort", island: "Perhentian" },
  { url: 'https://www.holidaygogogo.com/mimpi-perhentian-resort-pulau-perhentian/', resort: "Mimpi Perhentian Resort", island: "Perhentian" },
  { url: 'https://www.holidaygogogo.com/senja-bay-resort-pulau-perhentian/', resort: "Senja Bay Resort", island: "Perhentian" },
  { url: 'https://www.holidaygogogo.com/bubu-long-beach-resort/', resort: "Bubu Long Beach Resort", island: "Perhentian" },
  { url: 'https://www.holidaygogogo.com/samudra-beach-chalet-pulau-perhentian/', resort: "Samudra Beach Chalet", island: "Perhentian" }
];

// Known resort URL patterns to extract resort names
const resortUrlPatterns = [
  { pattern: /aman-tioman-beach-resort/i, resort: "Aman Tioman Beach Resort" },
  { pattern: /paya-beach-spa-dive-resort/i, resort: "Paya Beach Spa & Dive Resort" },
  { pattern: /the-barat-beach-resort/i, resort: "The Barat Beach Resort" },
  { pattern: /sun-beach-resort/i, resort: "Sun Beach Resort" },
  { pattern: /tunamaya-beach-spa-resort/i, resort: "Tunamaya Beach & Spa Resort" },
  { pattern: /berjaya-tioman-resort/i, resort: "Berjaya Tioman Resort" },
  { pattern: /redang-beach-resort/i, resort: "Redang Beach Resort" },
  { pattern: /laguna-redang-island-resort/i, resort: "Laguna Redang Island Resort" },
  { pattern: /redang-bay-resort/i, resort: "Redang Bay Resort" },
  { pattern: /redang-pelangi-resort/i, resort: "Redang Pelangi Resort" },
  { pattern: /redang-reef-resort/i, resort: "Redang Reef Resort" },
  { pattern: /perhentian-island-resort/i, resort: "Perhentian Island Resort" },
  { pattern: /barat-perhentian-resort/i, resort: "Barat Perhentian Resort" },
  { pattern: /perhentian-shari-la-island-resort/i, resort: "Perhentian Shari-La Island Resort" },
  { pattern: /perhentian-coral-view-island-resort/i, resort: "Perhentian Coral View Island Resort" }
];

// Special title patterns for specific resorts
const specialTitlePatterns = [
  { pattern: /perhentian\s+shari-la\s+island\s+resort/i, resort: "Perhentian Shari-La Island Resort" },
  { pattern: /shari-la\s+island\s+resort/i, resort: "Perhentian Shari-La Island Resort" },
  { pattern: /shari\s+la\s+island\s+resort/i, resort: "Perhentian Shari-La Island Resort" },
];

// Function to scrape packages from a specific resort URL
const scrapeResortPage = async (browser, resortUrl, resortName, island) => {
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36');

    console.log(`Navigating to resort page: ${resortUrl}`);
    await page.goto(resortUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Scroll to load all content
    await page.evaluate(async () => {
      await new Promise(resolve => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });

    // Find all package links in the "Related Tours & Packages" section
    const packages = await page.evaluate((resortName, island) => {
      // First, try to find the "Related Tours & Packages" section
      const relatedSection = Array.from(document.querySelectorAll('h3, h2, h4')).find(
        el => el.textContent.includes('Related Tours') || el.textContent.includes('Related Package')
      );
      
      let packageLinks = [];
      
      if (relatedSection) {
        // Find the closest container that might hold the packages
        let container = relatedSection.parentElement;
        for (let i = 0; i < 3 && container; i++) {
          // Look for package links in this container
          const links = Array.from(container.querySelectorAll('a[href*="package"]'));
          if (links.length > 0) {
            packageLinks = links;
            break;
          }
          container = container.parentElement;
        }
      }
      
      // If we couldn't find packages in the related section, try a more general approach
      if (packageLinks.length === 0) {
        packageLinks = Array.from(document.querySelectorAll('a[href*="snorkeling-package"], a[href*="resort-package"]'))
          .filter(link => {
            // Filter out navigation links
            const href = link.getAttribute('href');
            return href && 
              href.includes(island.toLowerCase()) && 
              !href.includes('holiday-tour-package') &&
              !href.includes('tours-sdn-bhd') &&
              !href.includes('holidaygogogo-tour') &&
              link.querySelector('.title, .price');
          });
      }
      
      const results = [];

      packageLinks.forEach(link => {
        const titleEl = link.querySelector('.title') || link;
        const priceEl = link.querySelector('.price');
        const imgEl = link.querySelector('img');

        const fullTitle = titleEl?.textContent?.trim() || '';
        const priceRaw = priceEl?.textContent?.trim() || '';
        const image = imgEl?.src || '';
        const packageUrl = link.href;
        
        // Extract price
        const priceMatch = priceRaw.match(/RM\s*([\d,]+)/i) || priceRaw.match(/([\d,]+)/);
        const price = priceMatch ? `RM ${priceMatch[1]}` : 'RM 0';

        // Only add packages with non-empty titles and that contain specific keywords
        if (fullTitle && packageUrl && 
            (fullTitle.toLowerCase().includes('package') || 
             fullTitle.toLowerCase().includes('tour') ||
             fullTitle.toLowerCase().includes('snorkeling') ||
             fullTitle.toLowerCase().includes('diving')) &&
            !fullTitle.includes('Malaysia Tours') &&
            !fullTitle.includes('Overseas Tours') &&
            !fullTitle.includes('See All') &&
            !fullTitle.includes('More Tours')) {
          
          results.push({
            title: fullTitle,
            price,
            image,
            link: packageUrl,
            description: '',
            resort: resortName,
            provider: 'HolidayGoGoGo',
            destination: island,
            lastScraped: new Date().toISOString(),
            location: {
              type: "Point",
              coordinates: [0, 0]
            }
          });
        }
      });

      return results;
    }, resortName, island);

    await page.close();
    
    if (packages.length > 0) {
      console.log(`✅ Found ${packages.length} packages for ${resortName}`);
      packages.forEach(pkg => {
        console.log(`- ${pkg.title}`);
      });
      return packages;
    } else {
      console.log(`❌ No packages found for ${resortName}`);
      return [];
    }
  } catch (err) {
    console.error(`❌ Error scraping resort page ${resortUrl}:`, err);
    return [];
  }
};

const scrapeHolidaygogoByPage = async (url, island) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    // First, scrape from specific resort URLs
    let allPackages = [];
    const relevantResorts = resortUrls.filter(r => r.island.toLowerCase() === island.toLowerCase());
    
    console.log(`Found ${relevantResorts.length} specific resort URLs for ${island}`);
    
    for (const { url: resortUrl, resort } of relevantResorts) {
      const resortPackages = await scrapeResortPage(browser, resortUrl, resort, island);
      allPackages = [...allPackages, ...resortPackages];
    }
    
    // Then scrape the main island page as before
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36');

    console.log(`Navigating to main island page: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    await page.evaluate(async () => {
      await new Promise(resolve => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });

    const mainPagePackages = await page.evaluate((island) => {
      const anchors = document.querySelectorAll('a[href*="snorkeling-package"], a[href*="resort-package"]');
      const results = [];

      anchors.forEach(anchor => {
        const titleEl = anchor.querySelector('.title b');
        const priceEl = anchor.querySelector('li.price b');
        const imgEl = anchor.querySelector('img');

        const fullTitle = titleEl?.textContent.trim() || '';
        const priceRaw = priceEl?.textContent.trim() || '';
        const image = imgEl?.src || '';
        const link = anchor.href;
        const priceMatch = priceRaw.match(/[\d,]+/);
        const price = priceMatch ? `RM ${priceMatch[0]}` : 'RM 0';

        // Only add packages with non-empty titles
        if (fullTitle && link) {
          results.push({
            title: fullTitle,
            price,
            image,
            link,
            description: '',
            rawResort: fullTitle,
            packageUrl: link,
            provider: 'HolidayGoGoGo',
            destination: island,
            lastScraped: new Date().toISOString(),
            location: {
              type: "Point",
              coordinates: [0, 0]
            }
          });
        }
      });

      return results;
    }, island);

    // Extract resort names using multiple strategies
    const extractResortName = (title, packageUrl) => {
      if (!title) return 'Unknown Resort';
      
      // Strategy 1: Check if the package URL contains a known resort name pattern
      for (const { pattern, resort } of resortUrlPatterns) {
        if (packageUrl && pattern.test(packageUrl)) {
          console.log(`Found resort from URL: ${resort} (${packageUrl})`);
          return resort;
        }
      }
      
      // Strategy 2: Check for special title patterns
      for (const { pattern, resort } of specialTitlePatterns) {
        if (pattern.test(title)) {
          console.log(`Found resort from special title pattern: ${resort}`);
          return resort;
        }
      }
      
      // Strategy 3: Extract from title
      let clean = title
        .replace(/\(\d{4}[^)]+\)/gi, '') // Remove (2025 Promo), (CNY LIMITED OFFER!)
        .replace(/\d+[dD]\d+[nN]/g, '')  // Remove 3D2N
        .replace(/snorkeling package|package|snorkeling/gi, '')
        .replace(/^\s*from\s*/i, '')
        .trim();

      // Look for specific resort name patterns in the title
      const resortPatterns = [
        // Full resort name pattern
        /([A-Za-z\s]+(?:Beach|Island|Dive|Spa|Beach\s+&\s+Spa|Beach\s+Spa)\s+Resort)/i,
        // Island + word + Resort (e.g., "Redang Beach Resort")
        new RegExp(`${island}\\s+([\\w\\s]+)\\s+Resort`, 'i'),
        // word + Island + Resort (e.g., "Perhentian Island Resort")
        new RegExp(`([\\w\\s]+)\\s+${island}\\s+Resort`, 'i'),
        // Generic Resort pattern (e.g., "Laguna Resort")
        /(\w+)\s+Resort/i,
        // Villa pattern
        /(\w+)\s+Villa/i,
        // Chalet pattern
        /(\w+)\s+Chalet/i,
        // Hotel pattern
        /(\w+)\s+Hotel/i
      ];
      
      for (const pattern of resortPatterns) {
        const match = clean.match(pattern);
        if (match) {
          console.log(`Found resort from title pattern: ${match[0]}`);
          return match[0].trim();
        }
      }
      
      // Strategy 4: Extract any capitalized words that might be a resort name
      const capitalizedWords = clean.match(/[A-Z][a-z]+(\s+[A-Z][a-z]+)*/g);
      if (capitalizedWords && capitalizedWords.length > 0) {
        // Join the first 2 words if they exist
        const resortName = capitalizedWords.slice(0, 2).join(' ') + ' Resort';
        console.log(`Found resort from capitalized words: ${resortName}`);
        return resortName;
      }
      
      // Fallback: Use the island name + "Resort"
      console.log(`Using fallback resort name: ${island} Resort`);
      return `${island} Resort`;
    };

    // Process main page packages
    mainPagePackages.forEach(pkg => {
      const resort = extractResortName(pkg.rawResort, pkg.packageUrl);
      pkg.resort = resort;
      delete pkg.rawResort;
      delete pkg.packageUrl;
    });

    console.log(`✅ Found ${mainPagePackages.length} packages from main ${island} page`);
    
    // Combine packages and remove duplicates
    const combinedPackages = [...allPackages, ...mainPagePackages];
    
    // Remove duplicates based on title and resort
    const uniquePackages = [];
    const seen = new Set();
    
    combinedPackages.forEach(pkg => {
      const key = `${pkg.title}-${pkg.resort}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePackages.push(pkg);
      }
    });
    
    console.log(`✅ Total unique packages for ${island}: ${uniquePackages.length}`);
    
    return uniquePackages;

  } catch (err) {
    console.error('❌ Error scraping HolidayGoGoGo:', err);
    return [];
  } finally {
    await browser.close();
  }
};

module.exports = scrapeHolidaygogoByPage;
