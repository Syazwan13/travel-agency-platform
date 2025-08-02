const scrapeAmitravelByPage = require('../utils/puppeteerAmitravel');
const AmiTravel = require('../models/amiTravelSchema');
const ProviderContact = require('../models/providerContactModel');
const DetailPageScraper = require('../utils/detailPageScraper');

const islandPages = {
  Redang: 'https://www.amitravel.my/search/?_destination_home=pulau-redang-terengganu&_travel_type=island-hopping-tour',
  Perhentian: 'https://www.amitravel.my/search/?_destination_home=pulau-perhentian-terengganu&_travel_type=island-hopping-tour',
  Tioman: 'https://www.amitravel.my/search/?_destination_home=pulau-tioman&_travel_type=island-hopping-tour'
};

const scrapeAndSaveAmitravel = async (req, res) => {
  const { island, batch } = req.query;
  console.log('Received scraping request:', { island, batch });

  try {
    const results = [];

    const targets = batch === 'true'
      ? Object.entries(islandPages)
      : [[island, islandPages[island]]];

    if (!targets.length || (island && !islandPages[island])) {
      console.log('Invalid request parameters:', { island, batch, availableIslands: Object.keys(islandPages) });
      return res.status(400).json({ error: 'Invalid island or query' });
    }

    for (const [isl, url] of targets) {
      console.log(`Starting scrape for ${isl} at URL: ${url}`);
      try {
        const data = await scrapeAmitravelByPage(url, isl);
        console.log(`Successfully scraped ${data.length} packages for ${isl}`);
        
        console.log(`Deleting existing packages for ${isl}`);
        const deleteResult = await AmiTravel.deleteMany({ destination: isl });
        console.log(`Deleted ${deleteResult.deletedCount} existing packages for ${isl}`);

        console.log(`Processing ${data.length} packages for ${isl} using bulk upsert operations`);

        // Enhance packages with detail page data (includes/excludes)
        console.log(`Enhancing packages with detail page data...`);
        const detailScraper = new DetailPageScraper();

        for (let i = 0; i < data.length; i++) {
          const packageData = data[i];
          if (packageData.link) {
            try {
              console.log(`Scraping detail page ${i + 1}/${data.length}: ${packageData.title}`);
              const detailData = await detailScraper.scrapeDetailPage(packageData.link, 'AmiTravel');

              if (detailData.success) {
                if (detailData.inclusions && detailData.inclusions.length > 0) {
                  packageData.inclusions = detailData.inclusions;
                }
                if (detailData.exclusions && detailData.exclusions.length > 0) {
                  packageData.exclusions = detailData.exclusions;
                }
                if (detailData.duration) {
                  packageData.duration = detailData.duration;
                }
                console.log(`✅ Enhanced ${packageData.title} with ${detailData.inclusions?.length || 0} inclusions, ${detailData.exclusions?.length || 0} exclusions`);
              }
            } catch (error) {
              console.error(`❌ Error enhancing ${packageData.title}:`, error.message);
            }

            // Add delay between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        await detailScraper.closeBrowser();

        // Get the AmiTravel provider ObjectId
        const amiTravelProvider = await ProviderContact.findOne({ 
          providerName: { $in: ['AmiTravel', 'AMI Travel', 'Ami Travel'] }
        });
        
        if (!amiTravelProvider) {
          throw new Error('AmiTravel provider not found in database');
        }

        // Fix provider field in all packages (convert from string to ObjectId)
        data.forEach(packageData => {
          packageData.provider = amiTravelProvider._id;
        });

        // Use upsert operations to handle duplicates gracefully
        const bulkOps = data.map(packageData => ({
          updateOne: {
            filter: { destination: packageData.destination, title: packageData.title },
            update: { $set: packageData },
            upsert: true
          }
        }));

        if (bulkOps.length > 0) {
          const result = await AmiTravel.bulkWrite(bulkOps, { ordered: false });
          console.log(`Bulk operation result: ${result.upsertedCount} new, ${result.modifiedCount} updated, ${result.matchedCount} matched`);
        }
        
        results.push(...data);
    } catch (error) {
        console.error(`Error scraping ${isl}:`, error);
        throw error;  // Re-throw to be caught by outer try-catch
      }
    }

    console.log(`Successfully scraped total of ${results.length} packages`);
    res.json({
      message: `Scraped ${results.length} packages.`,
      details: targets.map(([isl]) => ({
        island: isl,
        count: results.filter(r => r.destination === isl).length
      }))
    });
  } catch (err) {
    console.error('Scraping failed:', err);
    res.status(500).json({ 
      error: 'Scraping failed',
      details: err.message
    });
  }
};

module.exports = { scrapeAndSaveAmitravel };