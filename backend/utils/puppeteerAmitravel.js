const puppeteer = require('puppeteer');
const { getCoordinatesFromAddress } = require('./geocoding');
const path = require('path');

const formatPrice = (priceText) => {
    if (!priceText) return 'RM 0';
    const matches = priceText.match(/[\d,]+/);
    if (matches) {
        return `RM ${matches[0]}`;
    }
    return 'RM 0';
};

const scrapeAmitravelByPage = async (url, island) => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        defaultViewport: { width: 1920, height: 1080 }
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`Navigating to ${url}`);
        await page.goto(url, {
            waitUntil: ['networkidle0', 'domcontentloaded'],
            timeout: 60000
        });

        await page.waitForTimeout(3000);

        // Click "Load More" until button disappears
        const loadMoreSelector = '.facetwp-load-more';
        let clickCount = 0;

        while (true) {
            const button = await page.$(loadMoreSelector);
            if (!button) {
                console.log('No more "Load More" button found.');
                break;
            }

            try {
                await Promise.all([
                    page.click(loadMoreSelector),
                    page.waitForTimeout(3000) // wait for content to load
                ]);
                clickCount++;
                console.log(`Clicked "Load More" ${clickCount} time(s)`);
            } catch (err) {
                console.log('Could not click "Load More", stopping.');
                break;
            }
        }

        const selectors = [
            '.list',
            '.package',
            '.package-item',
            '[class*="package"]',
            'article'
        ];

        let foundSelector = null;
        for (const selector of selectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                console.log(`Found ${elements.length} elements with selector: ${selector}`);
                foundSelector = selector;
                break;
            }
        }

        if (!foundSelector) {
            console.log('No package elements found with standard selectors, trying alternative approach');

            const packages = await page.evaluate((island) => {
                function cleanResortName(title) {
                    let resort = title.replace(/\d+D\d+N\s+/g, '');
                    resort = resort.replace(/\([^)]+\)/g, '');
                    resort = resort.replace(/pulau\s+(?:redang|perhentian|tioman)/gi, '');
                    resort = resort.replace(/(?:redang|perhentian|tioman)\s+island/gi, '');
                    resort = resort.replace(/package|snorkeling|tour/gi, '');

                    const atMatch = resort.match(/(?:at|in)\s+([^,\.]+)(?:,|\.|$)/i);
                    if (atMatch) resort = atMatch[1];

                    if (!resort.match(/resort|hotel|chalet|villa|lodge|inn/i)) {
                        const resortKeywords = ['resort', 'hotel', 'chalet', 'villa', 'lodge', 'inn'];
                        const pattern = new RegExp(`([\\w\\s]+(?:${resortKeywords.join('|')}))[\\s,\\.]`, 'i');
                        const match = resort.match(pattern);
                        if (match) resort = match[1];
                    }

                    resort = resort.trim().replace(/,+$/, '').replace(/\s+/g, ' ').trim();
                    return resort || 'Unknown Resort';
                }

                function extractPrice(text) {
                    const patterns = [
                        /RM\s*[\d,]+/i,
                        /MYR\s*[\d,]+/i,
                        /(?:price|from)\s*:\s*RM\s*[\d,]+/i,
                        /[\d,]+\.00/
                    ];
                    for (const pattern of patterns) {
                        const match = text.match(pattern);
                        if (match) {
                            const numbers = match[0].match(/[\d,]+/)[0];
                            return `RM ${numbers}`;
                        }
                    }
                    return 'RM 0';
                }

                const results = [];
                const elements = document.querySelectorAll('div, article, section');

                elements.forEach(element => {
                    const text = element.textContent;
                    if (text.toLowerCase().includes(island.toLowerCase()) &&
                        (text.toLowerCase().includes('package') || text.toLowerCase().includes('resort'))) {

                        let title = '';
                        const heading = element.querySelector('h1, h2, h3, h4, h5');
                        if (heading) title = heading.textContent.trim();

                        const price = extractPrice(text);

                        let image = '';
                        const img = element.querySelector('img');
                        if (img && img.src) image = img.src;

                        let link = '';
                        const anchor = element.querySelector('a');
                        if (anchor && anchor.href) link = anchor.href;

                        let description = '';
                        const paragraphs = element.querySelectorAll('p');
                        if (paragraphs.length) {
                            description = Array.from(paragraphs)
                                .map(p => p.textContent.trim())
                                .filter(text => text.length > 20)
                                .join(' ');
                        }

                        if (title) {
                            const resort = cleanResortName(title);
                            results.push({
                                title,
                                price,
                                resort,
                                image,
                                link,
                                description,
                                provider: 'AMI Travel',
                                destination: island,
                                lastScraped: new Date().toISOString(),
                                location: {
                                    type: "Point",
                                    coordinates: [0, 0]
                                }
                            });
                        }
                    }
                });

                return results;
            }, island);

            console.log(`Found ${packages.length} packages using alternative approach`);
            return packages;
        }

        const packages = await page.evaluate((selector, island) => {
            function cleanResortName(title) {
                let resort = title.replace(/\d+D\d+N\s+/g, '');
                resort = resort.replace(/\([^)]+\)/g, '');
                resort = resort.replace(/pulau\s+(?:redang|perhentian|tioman)/gi, '');
                resort = resort.replace(/(?:redang|perhentian|tioman)\s+island/gi, '');
                resort = resort.replace(/package|snorkeling|tour/gi, '');

                const atMatch = resort.match(/(?:at|in)\s+([^,\.]+)(?:,|\.|$)/i);
                if (atMatch) resort = atMatch[1];

                if (!resort.match(/resort|hotel|chalet|villa|lodge|inn/i)) {
                    const resortKeywords = ['resort', 'hotel', 'chalet', 'villa', 'lodge', 'inn'];
                    const pattern = new RegExp(`([\\w\\s]+(?:${resortKeywords.join('|')}))[\\s,\\.]`, 'i');
                    const match = resort.match(pattern);
                    if (match) resort = match[1];
                }

                resort = resort.trim().replace(/,+$/, '').replace(/\s+/g, ' ').trim();
                return resort || 'Unknown Resort';
            }

            function extractPrice(text) {
                const patterns = [
                    /RM\s*[\d,]+/i,
                    /MYR\s*[\d,]+/i,
                    /(?:price|from)\s*:\s*RM\s*[\d,]+/i,
                    /[\d,]+\.00/
                ];
                for (const pattern of patterns) {
                    const match = text.match(pattern);
                    if (match) {
                        const numbers = match[0].match(/[\d,]+/)[0];
                        return `RM ${numbers}`;
                    }
                }
                return 'RM 0';
            }

            const items = document.querySelectorAll(selector);
            return Array.from(items).map(item => {
                const getTextContent = (selectors) => {
                    for (const sel of selectors) {
                        const element = item.querySelector(sel);
                        if (element) {
                            const text = element.textContent.trim();
                            if (text) return text;
                        }
                    }
                    return '';
                };

                const getAttr = (selectors, attr) => {
                    for (const sel of selectors) {
                        const element = item.querySelector(sel);
                        if (element && element.getAttribute(attr)) {
                            return element.getAttribute(attr);
                        }
                    }
                    return '';
                };

                const title = getTextContent([
                    '.package-title', 'h1', 'h2', 'h3', 'h4', '.title', 'a'
                ]);

                const priceText = getTextContent([
                    '.price', '.package-price', '[class*="price"]'
                ]);

                const price = extractPrice(priceText || item.textContent);
                const description = getTextContent([
                    '.description', '.package-description', 'p'
                ]);

                const image = getAttr(['img', '.package-image img', '[class*="image"] img'], 'src');
                const link = getAttr(['a', '.package-link', '[class*="more"]'], 'href');
                const resort = cleanResortName(title);

                return {
                    title,
                    price,
                    resort,
                    image,
                    link,
                    description,
                    provider: 'AMI Travel',
                    destination: island,
                    lastScraped: new Date().toISOString(),
                    location: {
                        type: "Point",
                        coordinates: [0, 0]
                    }
                };
            }).filter(pkg => pkg.title &&
                pkg.title.toLowerCase().includes(island.toLowerCase()));
        }, foundSelector, island);

        console.log(`Successfully extracted ${packages.length} packages`);
        return packages;

    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;
    } finally {
        await browser.close();
        console.log('Browser closed');
    }
};

module.exports = scrapeAmitravelByPage;
