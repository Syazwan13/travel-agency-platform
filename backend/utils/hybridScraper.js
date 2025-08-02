const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');

// Utility function to detect if content is JavaScript rendered
const isJavaScriptRendered = ($) => {
    // Common indicators that content might be JS rendered
    const hasReactRoot = $('#root').length > 0 || $('[data-reactroot]').length > 0;
    const hasAngularRoot = $('[ng-app]').length > 0 || $('[ng-controller]').length > 0;
    const hasVueRoot = $('#app').length > 0 || $('[data-v-app]').length > 0;
    const hasEmptyContent = $('body').text().trim().length === 0;
    const hasLoadingIndicators = $('[class*="loading"]').length > 0 || $('[class*="spinner"]').length > 0;
    const hasAjaxContainer = $('.facetwp-template').length > 0 && $('.facetwp-template').children().length === 0;

    return hasReactRoot || hasAngularRoot || hasVueRoot || hasEmptyContent || hasLoadingIndicators || hasAjaxContainer;
};

// Function to scrape with Axios + Cheerio
const scrapeWithAxios = async (url, selectors) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        const $ = cheerio.load(response.data);
        
        // Check if content might be JavaScript rendered
        if (isJavaScriptRendered($)) {
            throw new Error('Content appears to be JavaScript rendered');
        }

        return { $, isJSRendered: false };
    } catch (error) {
        throw error;
    }
};

// Function to scrape with Puppeteer
const scrapeWithPuppeteer = async (url, selectors) => {
    let browser;
    try {
        // Launch Puppeteer using Chrome's executable path
        browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Default Chrome path on Windows
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Set a reasonable timeout
        await page.setDefaultNavigationTimeout(30000);
        
        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Wait for specific elements that indicate the content is loaded
        await Promise.race([
            page.waitForSelector('.package-list-item', { timeout: 5000 }),
            page.waitForSelector('.package-item', { timeout: 5000 }),
            page.waitForSelector('article', { timeout: 5000 }),
            new Promise(resolve => setTimeout(resolve, 5000)) // Fallback timeout
        ]);
        
        // Get the page content
        const content = await page.content();
        const $ = cheerio.load(content);
        
        return { $, isJSRendered: true };
    } catch (error) {
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

// Main hybrid scraping function
const hybridScrape = async (url, selectors = {}) => {
    try {
        // First try with Axios + Cheerio
        try {
            const result = await scrapeWithAxios(url, selectors);
            return result;
        } catch (error) {
            console.log('Axios scraping failed or detected JS content, falling back to Puppeteer:', error.message);
            
            // If Axios fails or detects JS content, fallback to Puppeteer
            const result = await scrapeWithPuppeteer(url, selectors);
            return result;
        }
    } catch (error) {
        throw new Error(`Scraping failed: ${error.message}`);
    }
};

module.exports = {
    hybridScrape,
    isJavaScriptRendered
}; 