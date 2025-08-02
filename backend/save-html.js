const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function saveHTML() {
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        const url = 'https://www.amitravel.my/search/?_destination_home=pulau-redang-terengganu';
        console.log('Navigating to:', url);
        
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Wait for content to load
        await page.waitForTimeout(5000);

        // Save full page screenshot
        console.log('Taking screenshot...');
        await page.screenshot({
            path: 'page.png',
            fullPage: true
        });

        // Get page HTML
        console.log('Getting page HTML...');
        const html = await page.content();
        await fs.writeFile('page.html', html);

        // Get page structure
        console.log('Analyzing page structure...');
        const structure = await page.evaluate(() => {
            function getElementInfo(element, depth = 0) {
                if (depth > 5) return '...'; // Limit depth
                
                const info = {
                    tag: element.tagName.toLowerCase(),
                    id: element.id || undefined,
                    classes: Array.from(element.classList).join(' ') || undefined,
                    children: Array.from(element.children).map(child => getElementInfo(child, depth + 1))
                };
                
                // Clean up undefined properties
                Object.keys(info).forEach(key => info[key] === undefined && delete info[key]);
                return info;
            }
            
            return getElementInfo(document.body);
        });
        
        console.log('Saving page structure...');
        await fs.writeFile('structure.json', JSON.stringify(structure, null, 2));

        console.log('Files saved:');
        console.log('- page.png (Full page screenshot)');
        console.log('- page.html (Full page HTML)');
        console.log('- structure.json (Page structure)');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed');
        }
    }
}

saveHTML(); 