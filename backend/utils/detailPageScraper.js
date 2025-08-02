const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Enhanced detail page scraper for getting inclusions and duration
 * Supports multiple travel providers with different page structures
 */
class DetailPageScraper {
  constructor() {
    this.browser = null;
    this.requestDelay = 2000; // 2 seconds between requests
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Extract duration from text using various patterns
   */
  extractDuration(text) {
    if (!text) return null;
    
    const patterns = [
      /(\d+)\s*[dD]\s*(\d+)\s*[nN]/i,  // 3D2N format
      /(\d+)\s*days?\s*(\d+)\s*nights?/i,  // 3 days 2 nights
      /(\d+)\s*days?/i,  // 3 days
      /(\d+)\s*nights?/i,  // 2 nights
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[2]) {
          return `${match[1]}D${match[2]}N`;
        } else {
          return match[0].trim();
        }
      }
    }
    
    return null;
  }

  /**
   * Extract inclusions from various HTML structures
   */
  extractInclusions($, selectors = []) {
    const defaultSelectors = [
      // Direct inclusion selectors
      '.inclusions li',
      '.package-includes li',
      '.includes li',
      '.what-included li',
      '.package-inclusion li',
      '[class*="inclusion"] li',
      '[class*="include"] li',
      '.itinerary-includes li',
      '.tour-includes li',

      // Text-based selectors for includes sections
      'h3:contains("Package Includes") + ul li',
      'h3:contains("Includes") + ul li',
      'h4:contains("Package Includes") + ul li',
      'h4:contains("Includes") + ul li',
      'div:contains("Package Includes") + ul li',
      'div:contains("Includes") + ul li',
      'p:contains("Package Includes") + ul li',

      // Specific selectors for the HTML structure shown in user example
      'h3:contains("Package Includes:") + ul li',
      'h3:contains("Packages Includes:") + ul li',

      // Chinese selectors
      'h3:contains("包含") + ul li',
      'h4:contains("包含") + ul li',
      'div:contains("包含") + ul li',

      // Generic selectors that might contain includes
      'ul:has(li:contains("accommodation")) li',
      'ul:has(li:contains("transfer")) li',
      'ul:has(li:contains("breakfast")) li',
      'ul:has(li:contains("meal")) li'
    ];

    const allSelectors = [...defaultSelectors, ...selectors];
    const inclusions = new Set();

    // Also look for sections with "includes" in the heading
    this.extractFromSections($, 'inclusions', inclusions);

    for (const selector of allSelectors) {
      try {
        $(selector).each((i, el) => {
          const text = $(el).text().trim();

          // For specific includes sections, be more permissive
          const isInIncludesSection = selector.includes('includes') ||
                                    selector.includes('Includes') ||
                                    selector.includes('inclusion');

          const isValid = isInIncludesSection ?
            this.isBasicValidText(text) :
            this.isValidInclusionText(text);

          if (isValid) {
            const cleaned = this.cleanText(text);
            if (cleaned && !this.isExclusionText(cleaned)) {
              inclusions.add(cleaned);
            }
          }
        });
      } catch (error) {
        console.log(`Error with selector ${selector}:`, error.message);
      }
    }

    return Array.from(inclusions);
  }

  /**
   * Extract exclusions from various HTML structures
   */
  extractExclusions($, selectors = []) {
    const defaultSelectors = [
      // Direct exclusion selectors
      '.exclusions li',
      '.package-excludes li',
      '.excludes li',
      '.what-excluded li',
      '.package-exclusion li',
      '[class*="exclusion"] li',
      '[class*="exclude"] li',
      '.not-included li',

      // Text-based selectors for excludes sections
      'h3:contains("Package Excludes") + ul li',
      'h3:contains("Excludes") + ul li',
      'h3:contains("Not Included") + ul li',
      'h3:contains("Exclusions") + ul li',
      'h4:contains("Package Excludes") + ul li',
      'h4:contains("Excludes") + ul li',
      'h4:contains("Not Included") + ul li',
      'h4:contains("Exclusions") + ul li',
      'div:contains("Package Excludes") + ul li',
      'div:contains("Excludes") + ul li',
      'div:contains("Not Included") + ul li',
      'div:contains("Exclusions") + ul li',
      'p:contains("Package Excludes") + ul li',
      'p:contains("Not Included") + ul li',

      // Specific selectors for the HTML structure shown in user example
      'h3:contains("Packages Excludes:") + ul li',
      'h3:contains("Package Excludes:") + ul li',
      '#package-excludes h3:contains("Excludes") + ul li',
      '#package-excludes ul li',

      // Chinese selectors
      'h3:contains("不包含") + ul li',
      'h4:contains("不包含") + ul li',
      'div:contains("不包含") + ul li',

      // Generic selectors that might contain excludes
      'ul:has(li:contains("not included")) li',
      'ul:has(li:contains("exclude")) li',
      'ul:has(li:contains("additional")) li',
      'ul:has(li:contains("extra")) li'
    ];

    const allSelectors = [...defaultSelectors, ...selectors];
    const exclusions = new Set();

    // Also look for sections with "excludes" in the heading
    this.extractFromSections($, 'exclusions', exclusions);

    for (const selector of allSelectors) {
      try {
        $(selector).each((i, el) => {
          const text = $(el).text().trim();

          // For specific excludes sections, be more permissive
          const isInExcludesSection = selector.includes('excludes') ||
                                    selector.includes('Excludes') ||
                                    selector.includes('#package-excludes');

          const isValid = isInExcludesSection ?
            this.isBasicValidText(text) :
            this.isValidExclusionText(text);

          if (isValid) {
            const cleaned = this.cleanText(text);
            if (cleaned) {
              exclusions.add(cleaned);
            }
          }
        });
      } catch (error) {
        console.log(`Error with selector ${selector}:`, error.message);
      }
    }

    return Array.from(exclusions);
  }

  /**
   * Extract items from sections based on heading text
   */
  extractFromSections($, type, itemsSet) {
    const includeKeywords = ['include', '包含', 'what\'s included', 'package includes'];
    const excludeKeywords = ['exclude', 'not included', 'exclusion', '不包含', 'package excludes'];

    const keywords = type === 'inclusions' ? includeKeywords : excludeKeywords;

    // Look for headings that contain our keywords
    $('h1, h2, h3, h4, h5, h6, .heading, .title').each((i, heading) => {
      const headingText = $(heading).text().toLowerCase();

      for (const keyword of keywords) {
        if (headingText.includes(keyword.toLowerCase())) {
          // Found a relevant heading, look for lists after it
          let nextElement = $(heading).next();
          let attempts = 0;

          while (nextElement.length && attempts < 5) {
            if (nextElement.is('ul, ol')) {
              nextElement.find('li').each((j, li) => {
                const text = $(li).text().trim();
                const isValid = type === 'inclusions' ?
                  this.isValidInclusionText(text) :
                  this.isValidExclusionText(text);

                if (isValid) {
                  const cleaned = this.cleanText(text);
                  if (cleaned) {
                    itemsSet.add(cleaned);
                  }
                }
              });
              break;
            }
            nextElement = nextElement.next();
            attempts++;
          }
          break;
        }
      }
    });
  }

  /**
   * Check if text is valid inclusion text
   */
  isValidInclusionText(text) {
    if (!text || text.length < 5 || text.length > 300) return false;

    const lowerText = text.toLowerCase();

    // Skip if it's clearly an exclusion
    if (this.isExclusionText(text)) return false;

    // Skip navigation and header text
    const navigationPatterns = [
      'itinerary:', 'includes:', 'price:', 'ask questions:', 'related tours',
      'package:', 'tour:', 'promo:', 'book now', 'contact us', 'home',
      'about us', 'services', 'destinations', 'gallery', 'blog'
    ];

    if (navigationPatterns.some(pattern => lowerText.includes(pattern))) {
      return false;
    }

    // Common inclusion indicators
    const inclusionIndicators = [
      'accommodation', 'transfer', 'breakfast', 'lunch', 'dinner', 'meal',
      'snorkeling', 'diving', 'equipment', 'guide', 'tour', 'activity',
      'boat', 'ferry', 'jetty', 'night', 'day', 'complimentary', 'welcome drink'
    ];

    return inclusionIndicators.some(indicator => lowerText.includes(indicator)) &&
           !lowerText.includes('not') && !lowerText.includes('exclude') &&
           !lowerText.includes('strongly recommended') && !lowerText.includes('other expenses');
  }

  /**
   * Basic text validation for items in clearly marked sections
   */
  isBasicValidText(text) {
    if (!text || text.length < 3 || text.length > 300) return false;

    const lowerText = text.toLowerCase();

    // Skip obvious navigation and header text
    const skipPatterns = [
      'click here', 'read more', 'view more', 'see all', 'home', 'about',
      'contact', 'book now', 'enquire', 'package:', 'tour:', 'includes:', 'excludes:'
    ];

    return !skipPatterns.some(pattern => lowerText.includes(pattern));
  }

  /**
   * Check if text is valid exclusion text
   */
  isValidExclusionText(text) {
    if (!text || text.length < 5 || text.length > 300) return false;

    const lowerText = text.toLowerCase();

    // Skip navigation and header text
    const navigationPatterns = [
      'itinerary:', 'includes:', 'excludes:', 'price:', 'ask questions:', 'related tours',
      'package:', 'tour:', 'promo:', 'book now', 'contact us', 'home',
      'about us', 'services', 'destinations', 'gallery', 'blog'
    ];

    if (navigationPatterns.some(pattern => lowerText.includes(pattern))) {
      return false;
    }

    // Common exclusion indicators
    const exclusionIndicators = [
      'not included', 'exclude', 'additional', 'extra', 'personal',
      'optional', 'supplement', 'surcharge', 'own expense', 'travel insurance',
      'strongly recommended', 'other expenses', 'not stated'
    ];

    return exclusionIndicators.some(indicator => lowerText.includes(indicator));
  }

  /**
   * Check if text indicates exclusion
   */
  isExclusionText(text) {
    const lowerText = text.toLowerCase();
    return lowerText.includes('exclude') ||
           lowerText.includes('not included') ||
           lowerText.includes('additional') ||
           lowerText.includes('extra') ||
           lowerText.includes('不包含');
  }

  /**
   * Clean and normalize text
   */
  cleanText(text) {
    return text
      .replace(/^[•\-\*\+✓✗×]\s*/, '') // Remove bullet points and checkmarks
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^[✓✗×]\s*/, '') // Remove checkmarks
      .trim();
  }

  /**
   * Scrape HolidayGoGo detail page
   */
  async scrapeHolidayGoGoDetail(url) {
    try {
      console.log(`🔍 Scraping HolidayGoGo detail: ${url}`);

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      // Extract duration from title or content
      const title = $('h1, .title, .package-title').first().text();
      const content = $('body').text();
      const duration = this.extractDuration(title) || this.extractDuration(content);

      // Extract inclusions with HolidayGoGo specific selectors
      const holidayGoGoInclusionSelectors = [
        '.package-details .inclusions li',
        '.tour-details .includes li',
        '.itinerary .include li',
        'div:contains("Package Include") + ul li',
        'div:contains("包含") + ul li',
        'h3:contains("Includes") + ul li',
        'h4:contains("Includes") + ul li'
      ];

      const inclusions = this.extractInclusions($, holidayGoGoInclusionSelectors);

      // Extract exclusions with HolidayGoGo specific selectors
      const holidayGoGoExclusionSelectors = [
        '.package-details .exclusions li',
        '.tour-details .excludes li',
        '.itinerary .exclude li',
        'div:contains("Package Exclude") + ul li',
        'div:contains("不包含") + ul li',
        'h3:contains("Excludes") + ul li',
        'h4:contains("Excludes") + ul li'
      ];

      const exclusions = this.extractExclusions($, holidayGoGoExclusionSelectors);

      return {
        duration: duration || null,
        inclusions: inclusions.length > 0 ? inclusions : null,
        exclusions: exclusions.length > 0 ? exclusions : null,
        success: true
      };

    } catch (error) {
      console.error(`❌ Error scraping HolidayGoGo detail ${url}:`, error.message);
      return { duration: null, inclusions: null, exclusions: null, success: false, error: error.message };
    }
  }

  /**
   * Scrape AmiTravel detail page
   */
  async scrapeAmiTravelDetail(url) {
    try {
      console.log(`🔍 Scraping AmiTravel detail: ${url}`);
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

      const result = await page.evaluate(() => {
        // Extract duration
        const extractDuration = (text) => {
          if (!text) return null;
          const patterns = [
            /(\d+)\s*[dD]\s*(\d+)\s*[nN]/i,
            /(\d+)\s*days?\s*(\d+)\s*nights?/i,
            /(\d+)\s*days?/i,
            /(\d+)\s*nights?/i,
          ];
          
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
              if (match[2]) {
                return `${match[1]}D${match[2]}N`;
              } else {
                return match[0].trim();
              }
            }
          }
          return null;
        };

        const title = document.querySelector('h1, .title, .package-title')?.textContent || '';
        const bodyText = document.body.textContent;
        const duration = extractDuration(title) || extractDuration(bodyText);

        // Helper functions
        const cleanText = (text) => {
          return text
            .replace(/^[•\-\*\+✓✗×]\s*/, '')
            .replace(/^\d+\.\s*/, '')
            .replace(/^[✓✗×]\s*/, '')
            .trim();
        };

        const isValidInclusionText = (text) => {
          if (!text || text.length < 5 || text.length > 200) return false;
          const lowerText = text.toLowerCase();

          // Skip common non-inclusion text
          const skipPatterns = [
            'package include', 'include:', 'includes:', 'what include',
            'package exclude', 'exclude:', 'excludes:', 'not include',
            'price:', 'duration:', 'itinerary:', 'description:', 'note:',
            'terms', 'condition', 'policy', 'booking', 'payment', 'refund',
            'cancellation', 'change', 'departure', 'responsibility', 'admin fee',
            'utilized', 'personal reason', 'tour member', 'tour fare',
            'allowed', 'charged', 'reduction', 'sightseeing', 'within',
            'before', 'made', 'will be', 'can be', 'any other', 'due to',
            'planning your own', 'ask questions', 'related tours'
          ];

          if (skipPatterns.some(pattern => lowerText.includes(pattern))) {
            return false;
          }

          // Items that are clearly exclusions (costs/fees/personal items)
          const exclusionKeywords = [
            'personal charges', 'optional tour', 'land transfer', 'travel insurance',
            'tourism tax', 'jetty fees', 'equipment rental', 'rm', 'fees', 'charges',
            'personal', 'optional', 'additional cost', 'extra cost', 'own expense',
            'phone call', 'mini bar', 'laundry'
          ];

          if (exclusionKeywords.some(keyword => lowerText.includes(keyword))) {
            return false;
          }

          const inclusionIndicators = [
            'accommodation', 'transfer', 'breakfast', 'lunch', 'dinner', 'meal',
            'snorkeling', 'diving', 'guide', 'activity', 'boat', 'ferry',
            'entrance', 'ticket', 'transport', 'hotel', 'resort', 'welcome drink',
            'complimentary', 'free', 'included', 'night', 'tea break'
          ];

          return inclusionIndicators.some(indicator => lowerText.includes(indicator)) &&
                 !lowerText.includes('not') && !lowerText.includes('exclude') &&
                 !lowerText.includes('additional') && !lowerText.includes('extra') &&
                 !lowerText.includes('if ') && !lowerText.includes('any ') &&
                 !lowerText.includes('will ') && !lowerText.includes('can ') &&
                 !lowerText.includes('rm') && !lowerText.includes('fee');
        };

        const isValidExclusionText = (text) => {
          if (!text || text.length < 5 || text.length > 200) return false;
          const lowerText = text.toLowerCase();

          // Skip policy/terms text that's too long or complex
          const skipPatterns = [
            'package exclude', 'exclude:', 'excludes:', 'not include',
            'price:', 'duration:', 'itinerary:', 'description:', 'note:',
            'terms', 'condition', 'policy', 'booking', 'payment', 'refund',
            'cancellation', 'change', 'departure', 'responsibility', 'admin fee',
            'utilized', 'tour member', 'tour fare', 'sightseeing',
            'within', 'before', 'made', 'will be', 'can be', 'any other',
            'due to', 'allowed', 'charged', 'reduction', 'participant',
            'planning your own', 'ask questions', 'related tours'
          ];

          if (skipPatterns.some(pattern => lowerText.includes(pattern))) {
            return false;
          }

          const exclusionIndicators = [
            'not included', 'exclude', 'additional', 'extra', 'personal',
            'optional', 'supplement', 'surcharge', 'own expense', 'own cost',
            'not cover', 'separate', 'payable', 'charge', 'airport transfer',
            'travel insurance', 'marine park', 'entrance fee', 'tips',
            'laundry', 'phone call', 'mini bar', 'room service',
            'personal charges', 'optional tour', 'land transfer', 'tourism tax',
            'jetty fees', 'equipment rental', 'rm', 'fees', 'charges'
          ];

          return exclusionIndicators.some(indicator => lowerText.includes(indicator)) &&
                 !lowerText.includes('if ') && !lowerText.includes('any ') &&
                 !lowerText.includes('will ') && !lowerText.includes('can ') &&
                 !lowerText.includes('participant') && !lowerText.includes('member');
        };

        // Extract inclusions
        const inclusions = [];
        const inclusionSelectors = [
          '.package-includes li',
          '.inclusions li',
          '.itinerary-includes li',
          '.tour-includes li',
          'h3:contains("Package Includes") + ul li',
          'h3:contains("Includes") + ul li',
          'h4:contains("Package Includes") + ul li',
          'h4:contains("Includes") + ul li',
          'div:contains("Package Includes") + ul li',
          'div:contains("Includes") + ul li',
          // AmiTravel specific selectors
          '.entry-content ul li',
          '.post-content ul li',
          '.content ul li',
          'article ul li',
          '.single-post ul li'
        ];

        inclusionSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const text = el.textContent.trim();
              if (isValidInclusionText(text)) {
                const cleaned = cleanText(text);
                if (cleaned && !cleaned.toLowerCase().includes('exclude')) {
                  inclusions.push(cleaned);
                }
              }
            });
          } catch (e) {
            console.log('Inclusion selector error:', e);
          }
        });

        // Extract exclusions
        const exclusions = [];
        const exclusionSelectors = [
          '.package-excludes li',
          '.exclusions li',
          '.excludes li',
          '.not-included li',
          'h3:contains("Package Excludes") + ul li',
          'h3:contains("Excludes") + ul li',
          'h3:contains("Not Included") + ul li',
          'h4:contains("Package Excludes") + ul li',
          'h4:contains("Excludes") + ul li',
          'h4:contains("Not Included") + ul li',
          'div:contains("Package Excludes") + ul li',
          'div:contains("Excludes") + ul li',
          'div:contains("Not Included") + ul li',
          // AmiTravel specific selectors
          '.entry-content ul li',
          '.post-content ul li',
          '.content ul li',
          'article ul li',
          '.single-post ul li'
        ];

        exclusionSelectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const text = el.textContent.trim();
              if (isValidExclusionText(text)) {
                const cleaned = cleanText(text);
                if (cleaned) {
                  exclusions.push(cleaned);
                }
              }
            });
          } catch (e) {
            console.log('Exclusion selector error:', e);
          }
        });

        // Additional approach: Look for text patterns in the page content
        const pageText = document.body.textContent || '';
        const lines = pageText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        let inIncludesSection = false;
        let inExcludesSection = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase();

          // Check for section headers
          if (line.includes('package include') || line.includes('what include') || line === 'includes:') {
            inIncludesSection = true;
            inExcludesSection = false;
            continue;
          }

          if (line.includes('package exclude') || line.includes('not include') || line === 'excludes:') {
            inExcludesSection = true;
            inIncludesSection = false;
            continue;
          }

          // Reset sections on new headers
          if (line.includes('price') || line.includes('itinerary') || line.includes('description')) {
            inIncludesSection = false;
            inExcludesSection = false;
            continue;
          }

          // Extract items from sections
          if (inIncludesSection && isValidInclusionText(lines[i])) {
            const cleaned = cleanText(lines[i]);
            if (cleaned && !inclusions.includes(cleaned)) {
              inclusions.push(cleaned);
            }
          }

          if (inExcludesSection && isValidExclusionText(lines[i])) {
            const cleaned = cleanText(lines[i]);
            if (cleaned && !exclusions.includes(cleaned)) {
              exclusions.push(cleaned);
            }
          }
        }

        return {
          duration,
          inclusions: [...new Set(inclusions)], // Remove duplicates
          exclusions: [...new Set(exclusions)] // Remove duplicates
        };
      });

      await page.close();

      return {
        duration: result.duration || null,
        inclusions: result.inclusions.length > 0 ? result.inclusions : null,
        exclusions: result.exclusions && result.exclusions.length > 0 ? result.exclusions : null,
        success: true
      };

    } catch (error) {
      console.error(`❌ Error scraping AmiTravel detail ${url}:`, error.message);
      return { duration: null, inclusions: null, exclusions: null, success: false, error: error.message };
    }
  }

  /**
   * Scrape PulauMalaysia detail page
   */
  async scrapePulauMalaysiaDetail(url) {
    try {
      console.log(`🔍 Scraping PulauMalaysia detail: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Extract duration
      const title = $('h1, .title, .package-title').first().text();
      const content = $('body').text();
      const duration = this.extractDuration(title) || this.extractDuration(content);

      // Extract inclusions with PulauMalaysia specific selectors
      const pulauMalaysiaInclusionSelectors = [
        '.package-details .inclusions li',
        '.tour-inclusions li',
        '.package-include li',
        'div:contains("Package Include") + ul li',
        'div:contains("Termasuk") + ul li',
        'h3:contains("Includes") + ul li',
        'h4:contains("Includes") + ul li'
      ];

      const inclusions = this.extractInclusions($, pulauMalaysiaInclusionSelectors);

      // Extract exclusions with PulauMalaysia specific selectors
      const pulauMalaysiaExclusionSelectors = [
        '.package-details .exclusions li',
        '.tour-exclusions li',
        '.package-exclude li',
        'div:contains("Package Exclude") + ul li',
        'div:contains("Tidak Termasuk") + ul li',
        'h3:contains("Excludes") + ul li',
        'h4:contains("Excludes") + ul li'
      ];

      const exclusions = this.extractExclusions($, pulauMalaysiaExclusionSelectors);

      return {
        duration: duration || null,
        inclusions: inclusions.length > 0 ? inclusions : null,
        exclusions: exclusions.length > 0 ? exclusions : null,
        success: true
      };

    } catch (error) {
      console.error(`❌ Error scraping PulauMalaysia detail ${url}:`, error.message);
      return { duration: null, inclusions: null, exclusions: null, success: false, error: error.message };
    }
  }

  /**
   * Main method to scrape detail page based on provider
   */
  async scrapeDetailPage(url, provider) {
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, this.requestDelay));

    switch (provider.toLowerCase()) {
      case 'holidaygogogo':
      case 'holiday gogo':
        return await this.scrapeHolidayGoGoDetail(url);
      
      case 'ami travel':
      case 'amitravel':
        return await this.scrapeAmiTravelDetail(url);
      
      case 'pulau malaysia':
      case 'pulaumalaysia':
        return await this.scrapePulauMalaysiaDetail(url);
      
      default:
        // Generic scraping for unknown providers
        return await this.scrapeHolidayGoGoDetail(url);
    }
  }
}

module.exports = DetailPageScraper;
