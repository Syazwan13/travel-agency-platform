const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DetailPageScraper = require('../utils/detailPageScraper');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const { PulauMalaysiaPackage } = require('../models/pulauMalaysiaSchema');
const ProviderContact = require('../models/providerContactModel');

/**
 * Enhanced Package Data Updater
 * Updates existing packages with inclusions and duration from detail pages
 * Removes unnecessary description and features fields
 */
class PackageDataEnhancer {
  constructor() {
    this.scraper = new DetailPageScraper();
    this.stats = {
      processed: 0,
      updated: 0,
      failed: 0,
      skipped: 0
    };
  }

  async connectDB() {
    try {
      const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_CLOUD;
      if (!mongoUri) {
        throw new Error('MongoDB connection string not found. Please set MONGODB_URI or DATABASE_CLOUD in .env file');
      }
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }

  /**
   * Check if package needs enhancement
   */
  needsEnhancement(pkg) {
    const missingDuration = !pkg.duration || pkg.duration === '';
    const missingInclusions = !pkg.inclusions || pkg.inclusions.length === 0;
    const missingExclusions = !pkg.exclusions || pkg.exclusions.length === 0;
    const hasUnnecessaryFields = pkg.description || pkg.features;

    return missingDuration || missingInclusions || missingExclusions || hasUnnecessaryFields;
  }

  /**
   * Clean package data by removing unnecessary fields
   */
  cleanPackageData(pkg) {
    const updates = {};
    let hasChanges = false;

    // Remove description and features fields
    if (pkg.description !== undefined) {
      updates.$unset = updates.$unset || {};
      updates.$unset.description = "";
      hasChanges = true;
    }

    if (pkg.features !== undefined) {
      updates.$unset = updates.$unset || {};
      updates.$unset.features = "";
      hasChanges = true;
    }

    return { updates, hasChanges };
  }

  /**
   * Update AmiTravel packages
   */
  async updateAmiTravelPackages(limit = null) {
    console.log('\n🔄 Processing AmiTravel packages...');
    
    const query = { link: { $exists: true, $ne: '' } };
    const packages = limit ? 
      await AmiTravel.find(query).limit(limit) : 
      await AmiTravel.find(query);

    console.log(`📦 Found ${packages.length} AmiTravel packages to process`);

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      this.stats.processed++;

      console.log(`\n[${i + 1}/${packages.length}] Processing: ${pkg.title}`);

      try {
        if (!this.needsEnhancement(pkg)) {
          console.log('⏭️  Package already has complete data, skipping...');
          this.stats.skipped++;
          continue;
        }

        const updates = { $set: {} };
        let hasUpdates = false;

        // Clean unnecessary fields
        const cleanResult = this.cleanPackageData(pkg);
        if (cleanResult.hasChanges) {
          Object.assign(updates, cleanResult.updates);
          hasUpdates = true;
        }

        // Scrape detail page for missing data
        if (!pkg.duration || !pkg.inclusions || pkg.inclusions.length === 0 || !pkg.exclusions || pkg.exclusions.length === 0) {
          console.log(`🔍 Scraping detail page: ${pkg.link}`);

          const detailData = await this.scraper.scrapeDetailPage(pkg.link, 'AmiTravel');

          if (detailData.success) {
            if (detailData.duration && !pkg.duration) {
              updates.$set.duration = detailData.duration;
              hasUpdates = true;
              console.log(`✅ Found duration: ${detailData.duration}`);
            }

            if (detailData.inclusions && (!pkg.inclusions || pkg.inclusions.length === 0)) {
              updates.$set.inclusions = detailData.inclusions;
              hasUpdates = true;
              console.log(`✅ Found ${detailData.inclusions.length} inclusions`);
            }

            if (detailData.exclusions && (!pkg.exclusions || pkg.exclusions.length === 0)) {
              updates.$set.exclusions = detailData.exclusions;
              hasUpdates = true;
              console.log(`✅ Found ${detailData.exclusions.length} exclusions`);
            }
          } else {
            console.log(`⚠️  Failed to scrape detail page: ${detailData.error}`);
          }
        }

        // Update package if we have changes
        if (hasUpdates) {
          await AmiTravel.updateOne({ _id: pkg._id }, updates);
          this.stats.updated++;
          console.log('✅ Package updated successfully');
        } else {
          this.stats.skipped++;
          console.log('⏭️  No updates needed');
        }

      } catch (error) {
        console.error(`❌ Error processing package ${pkg.title}:`, error.message);
        this.stats.failed++;
      }

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 Progress: ${i + 1}/${packages.length} processed`);
        this.printStats();
      }
    }
  }

  /**
   * Update HolidayGoGo packages
   */
  async updateHolidayGoGoPackages(limit = null) {
    console.log('\n🔄 Processing HolidayGoGo packages...');
    
    const query = { link: { $exists: true, $ne: '' } };
    const packages = limit ? 
      await HolidayGoGoPackage.find(query).limit(limit) : 
      await HolidayGoGoPackage.find(query);

    console.log(`📦 Found ${packages.length} HolidayGoGo packages to process`);

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      this.stats.processed++;

      console.log(`\n[${i + 1}/${packages.length}] Processing: ${pkg.title}`);

      try {
        if (!this.needsEnhancement(pkg)) {
          console.log('⏭️  Package already has complete data, skipping...');
          this.stats.skipped++;
          continue;
        }

        const updates = { $set: {} };
        let hasUpdates = false;

        // Clean unnecessary fields
        const cleanResult = this.cleanPackageData(pkg);
        if (cleanResult.hasChanges) {
          Object.assign(updates, cleanResult.updates);
          hasUpdates = true;
        }

        // Scrape detail page for missing data
        if (!pkg.duration || !pkg.inclusions || pkg.inclusions.length === 0 || !pkg.exclusions || pkg.exclusions.length === 0) {
          console.log(`🔍 Scraping detail page: ${pkg.link}`);

          const detailData = await this.scraper.scrapeDetailPage(pkg.link, 'HolidayGoGo');

          if (detailData.success) {
            if (detailData.duration && !pkg.duration) {
              updates.$set.duration = detailData.duration;
              hasUpdates = true;
              console.log(`✅ Found duration: ${detailData.duration}`);
            }

            if (detailData.inclusions && (!pkg.inclusions || pkg.inclusions.length === 0)) {
              updates.$set.inclusions = detailData.inclusions;
              hasUpdates = true;
              console.log(`✅ Found ${detailData.inclusions.length} inclusions`);
            }

            if (detailData.exclusions && (!pkg.exclusions || pkg.exclusions.length === 0)) {
              updates.$set.exclusions = detailData.exclusions;
              hasUpdates = true;
              console.log(`✅ Found ${detailData.exclusions.length} exclusions`);
            }
          } else {
            console.log(`⚠️  Failed to scrape detail page: ${detailData.error}`);
          }
        }

        // Update package if we have changes
        if (hasUpdates) {
          await HolidayGoGoPackage.updateOne({ _id: pkg._id }, updates);
          this.stats.updated++;
          console.log('✅ Package updated successfully');
        } else {
          this.stats.skipped++;
          console.log('⏭️  No updates needed');
        }

      } catch (error) {
        console.error(`❌ Error processing package ${pkg.title}:`, error.message);
        this.stats.failed++;
      }

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 Progress: ${i + 1}/${packages.length} processed`);
        this.printStats();
      }
    }
  }

  /**
   * Update PulauMalaysia packages
   */
  async updatePulauMalaysiaPackages(limit = null) {
    console.log('\n🔄 Processing PulauMalaysia packages...');
    
    const query = { link: { $exists: true, $ne: '' } };
    const packages = limit ? 
      await PulauMalaysiaPackage.find(query).limit(limit) : 
      await PulauMalaysiaPackage.find(query);

    console.log(`📦 Found ${packages.length} PulauMalaysia packages to process`);

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      this.stats.processed++;

      console.log(`\n[${i + 1}/${packages.length}] Processing: ${pkg.title}`);

      try {
        if (!this.needsEnhancement(pkg)) {
          console.log('⏭️  Package already has complete data, skipping...');
          this.stats.skipped++;
          continue;
        }

        const updates = { $set: {} };
        let hasUpdates = false;

        // Clean unnecessary fields
        const cleanResult = this.cleanPackageData(pkg);
        if (cleanResult.hasChanges) {
          Object.assign(updates, cleanResult.updates);
          hasUpdates = true;
        }

        // Scrape detail page for missing data
        if (!pkg.duration || !pkg.inclusions || pkg.inclusions.length === 0 || !pkg.exclusions || pkg.exclusions.length === 0) {
          console.log(`🔍 Scraping detail page: ${pkg.link}`);

          const detailData = await this.scraper.scrapeDetailPage(pkg.link, 'PulauMalaysia');

          if (detailData.success) {
            if (detailData.duration && !pkg.duration) {
              updates.$set.duration = detailData.duration;
              hasUpdates = true;
              console.log(`✅ Found duration: ${detailData.duration}`);
            }

            if (detailData.inclusions && (!pkg.inclusions || pkg.inclusions.length === 0)) {
              updates.$set.inclusions = detailData.inclusions;
              hasUpdates = true;
              console.log(`✅ Found ${detailData.inclusions.length} inclusions`);
            }

            if (detailData.exclusions && (!pkg.exclusions || pkg.exclusions.length === 0)) {
              updates.$set.exclusions = detailData.exclusions;
              hasUpdates = true;
              console.log(`✅ Found ${detailData.exclusions.length} exclusions`);
            }
          } else {
            console.log(`⚠️  Failed to scrape detail page: ${detailData.error}`);
          }
        }

        // Update package if we have changes
        if (hasUpdates) {
          await PulauMalaysiaPackage.updateOne({ _id: pkg._id }, updates);
          this.stats.updated++;
          console.log('✅ Package updated successfully');
        } else {
          this.stats.skipped++;
          console.log('⏭️  No updates needed');
        }

      } catch (error) {
        console.error(`❌ Error processing package ${pkg.title}:`, error.message);
        this.stats.failed++;
      }

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 Progress: ${i + 1}/${packages.length} processed`);
        this.printStats();
      }
    }
  }

  printStats() {
    console.log('\n📊 Current Statistics:');
    console.log(`   Processed: ${this.stats.processed}`);
    console.log(`   Updated: ${this.stats.updated}`);
    console.log(`   Skipped: ${this.stats.skipped}`);
    console.log(`   Failed: ${this.stats.failed}`);
  }

  async cleanup() {
    await this.scraper.closeBrowser();
    await this.disconnectDB();
  }
}

module.exports = PackageDataEnhancer;
