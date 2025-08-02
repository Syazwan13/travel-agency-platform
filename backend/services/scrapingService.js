const ScrapingLog = require('../models/scrapingLogModel');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

// Import existing scraping functions
const { scrapeAndSaveAmitravel } = require('../controllers/websiteScrapeController');
const axios = require('axios');

class ScrapingService {
  constructor() {
    this.runningOperations = new Map();
    this.defaultConfig = {
      sources: ['AmiTravel', 'HolidayGoGo', 'PulauMalaysia'],
      timeout: 300000, // 5 minutes per source
      retryAttempts: 3,
      batchSize: 50
    };
  }

  // Check if any scraping operation is currently running
  isScrapingInProgress() {
    return this.runningOperations.size > 0;
  }

  // Get current running operations
  getRunningOperations() {
    return Array.from(this.runningOperations.values());
  }

  // Start a new scraping operation
  async startScraping(triggerType = 'manual', triggeredBy = null, config = {}) {
    try {
      // Check if scraping is already in progress
      if (this.isScrapingInProgress()) {
        throw new Error('Another scraping operation is already in progress');
      }

      const operationId = uuidv4();
      const finalConfig = { ...this.defaultConfig, ...config };

      // Prepare scraping log data
      const scrapingLogData = {
        operationId,
        triggerType,
        configuration: finalConfig,
        sourceResults: finalConfig.sources.map(source => ({
          source,
          status: 'pending'
        })),
        metadata: {
          serverInfo: {
            hostname: os.hostname(),
            platform: os.platform(),
            nodeVersion: process.version,
            memoryUsage: process.memoryUsage()
          },
          environment: process.env.NODE_ENV || 'development'
        }
      };

      // Only add triggeredBy if it's a manual operation and we have a valid user ID
      if (triggerType === 'manual' && triggeredBy) {
        scrapingLogData.triggeredBy = triggeredBy;
      }

      // Create scraping log entry
      const scrapingLog = new ScrapingLog(scrapingLogData);

      await scrapingLog.save();

      // Add to running operations
      this.runningOperations.set(operationId, {
        operationId,
        startTime: new Date(),
        status: 'running',
        progress: 0,
        currentStep: 'Initializing',
        scrapingLog
      });

      // Start the scraping process asynchronously
      this.executeScraping(operationId, finalConfig).catch(error => {
        console.error('Scraping execution error:', error);
        this.handleScrapingError(operationId, error);
      });

      return {
        success: true,
        operationId,
        message: 'Scraping operation started successfully'
      };

    } catch (error) {
      console.error('Error starting scraping operation:', error);
      throw error;
    }
  }

  // Execute the actual scraping process
  async executeScraping(operationId, config) {
    const operation = this.runningOperations.get(operationId);
    if (!operation) {
      throw new Error('Operation not found');
    }

    const { scrapingLog } = operation;
    
    try {
      await scrapingLog.updateProgress(5, 'Starting scraping process');

      const results = {
        totalSources: config.sources.length,
        successfulSources: 0,
        failedSources: 0,
        totalPackagesFound: 0,
        newPackages: 0,
        updatedPackages: 0,
        duplicatesSkipped: 0
      };

      // Process each source
      for (let i = 0; i < config.sources.length; i++) {
        const source = config.sources[i];
        const progressStart = 10 + (i * 80 / config.sources.length);
        const progressEnd = 10 + ((i + 1) * 80 / config.sources.length);

        await scrapingLog.updateProgress(progressStart, `Scraping ${source}`);

        // Update source start time
        const sourceIndex = scrapingLog.sourceResults.findIndex(sr => sr.source === source);
        if (sourceIndex !== -1) {
          scrapingLog.sourceResults[sourceIndex].status = 'running';
          scrapingLog.sourceResults[sourceIndex].startTime = new Date();
          await scrapingLog.save();
        }

        try {
          const sourceResult = await this.scrapeSource(source, operationId, progressStart, progressEnd);
          
          // Update source result in log - preserve the source field
          const sourceIndex = scrapingLog.sourceResults.findIndex(sr => sr.source === source);
          if (sourceIndex !== -1) {
            // Update specific fields without overwriting the entire object
            scrapingLog.sourceResults[sourceIndex].status = 'completed';
            scrapingLog.sourceResults[sourceIndex].endTime = new Date();
            scrapingLog.sourceResults[sourceIndex].packagesFound = sourceResult.packagesFound || 0;
            scrapingLog.sourceResults[sourceIndex].packagesProcessed = sourceResult.packagesProcessed || 0;
            scrapingLog.sourceResults[sourceIndex].newPackages = sourceResult.newPackages || 0;
            scrapingLog.sourceResults[sourceIndex].updatedPackages = sourceResult.updatedPackages || 0;
            scrapingLog.sourceResults[sourceIndex].duration = sourceResult.duration || 0;
            
            // Save with error handling
            try {
              await scrapingLog.save();
            } catch (saveError) {
              console.error('Error saving scraping log after success:', saveError);
              // Continue anyway - don't fail the scraping
            }
          }

          // Update overall results
          results.successfulSources++;
          results.totalPackagesFound += sourceResult.packagesFound || 0;
          results.newPackages += sourceResult.newPackages || 0;
          results.updatedPackages += sourceResult.updatedPackages || 0;

        } catch (sourceError) {
          console.error(`Error scraping ${source}:`, sourceError);
          
          // Update source result with error
          const sourceIndex = scrapingLog.sourceResults.findIndex(sr => sr.source === source);
          if (sourceIndex !== -1) {
            scrapingLog.sourceResults[sourceIndex].status = 'failed';
            scrapingLog.sourceResults[sourceIndex].endTime = new Date();
            scrapingLog.sourceResults[sourceIndex].errors.push({
              message: sourceError.message,
              stack: sourceError.stack
            });
            try {
              await scrapingLog.save();
            } catch (saveError) {
              console.error('Error saving scraping log:', saveError);
            }
          }

          results.failedSources++;
          await scrapingLog.addError(sourceError, 'error', source);
        }
      }

      // Update final results
      scrapingLog.results = results;
      await scrapingLog.updateProgress(95, 'Finalizing results');

      // Complete the operation
      await scrapingLog.completeOperation('completed');
      await scrapingLog.updateProgress(100, 'Completed successfully');

      // Update running operation status
      operation.status = 'completed';
      operation.progress = 100;
      operation.currentStep = 'Completed';

      // Remove from running operations after a delay
      setTimeout(() => {
        this.runningOperations.delete(operationId);
      }, 5000);

      console.log(`Scraping operation ${operationId} completed successfully`);

    } catch (error) {
      console.error(`Scraping operation ${operationId} failed:`, error);
      await this.handleScrapingError(operationId, error);
    }
  }

  // Scrape a specific source
  async scrapeSource(source, operationId, progressStart, progressEnd) {
    const startTime = new Date();

    try {
      let result;

      switch (source) {
        case 'AmiTravel':
          result = await this.scrapeAmiTravelSource();
          break;
        case 'HolidayGoGo':
          result = await this.scrapeHolidayGoGoSource();
          break;
        case 'PulauMalaysia':
          result = await this.scrapePulauMalaysiaSource();
          break;
        default:
          throw new Error(`Unknown source: ${source}`);
      }

      const endTime = new Date();
      const duration = endTime - startTime;

      return {
        startTime,
        endTime,
        duration,
        packagesFound: result?.packagesFound || 0,
        packagesProcessed: result?.packagesProcessed || 0,
        newPackages: result?.newPackages || 0,
        updatedPackages: result?.updatedPackages || 0
      };

    } catch (error) {
      const endTime = new Date();
      const duration = endTime - startTime;

      return {
        startTime,
        endTime,
        duration,
        packagesFound: 0,
        packagesProcessed: 0,
        newPackages: 0,
        updatedPackages: 0,
        error: error.message
      };
    }
  }

  // Scrape AmiTravel source
  async scrapeAmiTravelSource() {
    try {
      // Use direct scraping instead of HTTP endpoint
      const { scrapeAndSaveAmitravel } = require('../controllers/websiteScrapeController');
      
      // Create mock request/response objects
      const mockReq = {
        query: {
          batch: 'true'  // Scrape all islands
        }
      };
      
      let responseData = null;
      let errorData = null;
      
      const mockRes = {
        json: (data) => {
          responseData = data;
        },
        status: (code) => ({
          json: (data) => {
            errorData = { code, data };
          }
        })
      };
      
      // Execute the scraping
      await scrapeAndSaveAmitravel(mockReq, mockRes);
      
      // Check for errors first
      if (errorData) {
        throw new Error(`HTTP ${errorData.code}: ${errorData.data.error || errorData.data.message}`);
      }
      
      if (responseData && responseData.details) {
        const totalPackages = responseData.details.reduce((sum, detail) => sum + detail.count, 0);
        return {
          packagesFound: totalPackages,
          packagesProcessed: totalPackages,
          newPackages: totalPackages,
          updatedPackages: 0
        };
      }
      
      return {
        packagesFound: 0,
        packagesProcessed: 0,
        newPackages: 0,
        updatedPackages: 0
      };
    } catch (error) {
      console.error('Error scraping AmiTravel:', error);
      throw error;
    }
  }

  // Scrape HolidayGoGo source (placeholder - implement when available)
  async scrapeHolidayGoGoSource() {
    try {
      // For now, return mock data since HolidayGoGo scraper might not be available
      console.log('HolidayGoGo scraping not yet implemented - returning mock data');
      return {
        packagesFound: 0,
        packagesProcessed: 0,
        newPackages: 0,
        updatedPackages: 0
      };
    } catch (error) {
      console.error('Error scraping HolidayGoGo:', error);
      throw error;
    }
  }

  // Scrape PulauMalaysia source (placeholder - implement when available)
  async scrapePulauMalaysiaSource() {
    try {
      // For now, return mock data since PulauMalaysia scraper might not be available
      console.log('PulauMalaysia scraping not yet implemented - returning mock data');
      return {
        packagesFound: 0,
        packagesProcessed: 0,
        newPackages: 0,
        updatedPackages: 0
      };
    } catch (error) {
      console.error('Error scraping PulauMalaysia:', error);
      throw error;
    }
  }

  // Handle scraping errors
  async handleScrapingError(operationId, error) {
    const operation = this.runningOperations.get(operationId);
    if (operation) {
      const { scrapingLog } = operation;

      try {
        await scrapingLog.addError(error, 'critical');
        await scrapingLog.completeOperation('failed');
      } catch (logError) {
        console.error('Error updating scraping log:', logError);
      }

      operation.status = 'failed';
      operation.error = error.message;

      // Remove from running operations after a delay
      setTimeout(() => {
        this.runningOperations.delete(operationId);
      }, 10000);
    }
  }

  // Get operation status
  getOperationStatus(operationId) {
    const operation = this.runningOperations.get(operationId);
    if (!operation) {
      return null;
    }

    return {
      operationId: operation.operationId,
      status: operation.status,
      progress: operation.progress,
      currentStep: operation.currentStep,
      startTime: operation.startTime,
      error: operation.error
    };
  }

  // Cancel a running operation
  async cancelOperation(operationId) {
    const operation = this.runningOperations.get(operationId);
    if (!operation) {
      throw new Error('Operation not found');
    }

    const { scrapingLog } = operation;
    await scrapingLog.completeOperation('cancelled');
    
    operation.status = 'cancelled';
    this.runningOperations.delete(operationId);

    return {
      success: true,
      message: 'Operation cancelled successfully'
    };
  }

  // Get scraping statistics
  async getScrapingStatistics(days = 30) {
    try {
      const stats = await ScrapingLog.getStatistics(days);
      const recentLogs = await ScrapingLog.getRecentLogs(10);
      const runningOps = await ScrapingLog.getRunningOperations();

      return {
        statistics: stats[0] || {
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          totalPackagesProcessed: 0,
          totalNewPackages: 0,
          totalUpdatedPackages: 0,
          averageDuration: 0
        },
        recentLogs,
        runningOperations: runningOps,
        currentlyRunning: this.runningOperations.size
      };
    } catch (error) {
      console.error('Error getting scraping statistics:', error);
      throw error;
    }
  }
}

// Create singleton instance
const scrapingService = new ScrapingService();

module.exports = scrapingService;
