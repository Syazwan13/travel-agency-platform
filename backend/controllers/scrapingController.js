const asyncHandler = require('express-async-handler');
const scrapingService = require('../services/scrapingService');
const cronScheduler = require('../services/cronScheduler');
const ScrapingLog = require('../models/scrapingLogModel');

// @desc    Start manual scraping operation
// @route   POST /api/scraping/start
// @access  Private/Admin
const startScraping = asyncHandler(async (req, res) => {
  try {
    const { sources, config } = req.body;
    const userId = req.user._id;

    // Validate sources if provided
    const validSources = ['AmiTravel', 'HolidayGoGo', 'PulauMalaysia'];
    const sourcesToScrape = sources && sources.length > 0 
      ? sources.filter(source => validSources.includes(source))
      : validSources;

    if (sourcesToScrape.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid sources specified'
      });
    }

    // Start scraping operation
    const result = await scrapingService.startScraping('manual', userId, {
      sources: sourcesToScrape,
      ...config
    });

    res.json({
      success: true,
      data: result,
      message: 'Scraping operation started successfully'
    });

  } catch (error) {
    console.error('Error starting scraping:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start scraping operation'
    });
  }
});

// @desc    Get scraping operation status
// @route   GET /api/scraping/status/:operationId
// @access  Private/Admin
const getScrapingStatus = asyncHandler(async (req, res) => {
  try {
    const { operationId } = req.params;

    // Get status from service (for running operations)
    let status = scrapingService.getOperationStatus(operationId);

    // If not found in running operations, check database
    if (!status) {
      const scrapingLog = await ScrapingLog.findOne({ operationId })
        .populate('triggeredBy', 'name email')
        .lean();

      if (scrapingLog) {
        status = {
          operationId: scrapingLog.operationId,
          status: scrapingLog.status,
          progress: scrapingLog.progress,
          currentStep: scrapingLog.currentStep,
          startTime: scrapingLog.startTime,
          endTime: scrapingLog.endTime,
          duration: scrapingLog.duration,
          results: scrapingLog.results,
          sourceResults: scrapingLog.sourceResults,
          errors: scrapingLog.errors,
          triggeredBy: scrapingLog.triggeredBy
        };
      }
    }

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Operation not found'
      });
    }

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error getting scraping status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scraping status'
    });
  }
});

// @desc    Cancel running scraping operation
// @route   POST /api/scraping/cancel/:operationId
// @access  Private/Admin
const cancelScraping = asyncHandler(async (req, res) => {
  try {
    const { operationId } = req.params;

    const result = await scrapingService.cancelOperation(operationId);

    res.json({
      success: true,
      data: result,
      message: 'Scraping operation cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling scraping:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel scraping operation'
    });
  }
});

// @desc    Get scraping statistics and logs
// @route   GET /api/scraping/statistics
// @access  Private/Admin
const getScrapingStatistics = asyncHandler(async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const statistics = await scrapingService.getScrapingStatistics(parseInt(days));

    res.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('Error getting scraping statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scraping statistics'
    });
  }
});

// @desc    Get scraping logs with pagination
// @route   GET /api/scraping/logs
// @access  Private/Admin
const getScrapingLogs = asyncHandler(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      triggerType,
      startDate,
      endDate 
    } = req.query;

    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (triggerType) {
      query.triggerType = triggerType;
    }
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, totalCount] = await Promise.all([
      ScrapingLog.find(query)
        .populate('triggeredBy', 'name email')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ScrapingLog.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting scraping logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scraping logs'
    });
  }
});

// @desc    Get current running operations
// @route   GET /api/scraping/running
// @access  Private/Admin
const getRunningOperations = asyncHandler(async (req, res) => {
  try {
    const runningOps = scrapingService.getRunningOperations();
    
    res.json({
      success: true,
      data: {
        operations: runningOps,
        count: runningOps.length,
        isScrapingInProgress: scrapingService.isScrapingInProgress()
      }
    });

  } catch (error) {
    console.error('Error getting running operations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get running operations'
    });
  }
});

// @desc    Get cron scheduler status
// @route   GET /api/scraping/cron/status
// @access  Private/Admin
const getCronStatus = asyncHandler(async (req, res) => {
  try {
    const status = cronScheduler.getStatus();
    const scheduledTasks = cronScheduler.getScheduledTasks();

    res.json({
      success: true,
      data: {
        ...status,
        scheduledTasks
      }
    });

  } catch (error) {
    console.error('Error getting cron status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cron status'
    });
  }
});

// @desc    Update cron schedule
// @route   PUT /api/scraping/cron/schedule
// @access  Private/Admin
const updateCronSchedule = asyncHandler(async (req, res) => {
  try {
    const { schedule, taskName = 'automated_scraping' } = req.body;

    // Validate cron pattern
    if (!cronScheduler.constructor.validateCronPattern(schedule)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cron pattern'
      });
    }

    const result = cronScheduler.updateTaskSchedule(taskName, schedule);

    res.json({
      success: true,
      data: result,
      message: 'Cron schedule updated successfully'
    });

  } catch (error) {
    console.error('Error updating cron schedule:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update cron schedule'
    });
  }
});

// @desc    Pause/Resume cron task
// @route   POST /api/scraping/cron/:action/:taskName
// @access  Private/Admin
const controlCronTask = asyncHandler(async (req, res) => {
  try {
    const { action, taskName } = req.params;

    let result;
    let message;

    switch (action) {
      case 'pause':
        result = cronScheduler.pauseTask(taskName);
        message = result ? 'Task paused successfully' : 'Task not found or already paused';
        break;
      case 'resume':
        result = cronScheduler.resumeTask(taskName);
        message = result ? 'Task resumed successfully' : 'Task not found or already active';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use "pause" or "resume"'
        });
    }

    res.json({
      success: result,
      message
    });

  } catch (error) {
    console.error('Error controlling cron task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to control cron task'
    });
  }
});

module.exports = {
  startScraping,
  getScrapingStatus,
  cancelScraping,
  getScrapingStatistics,
  getScrapingLogs,
  getRunningOperations,
  getCronStatus,
  updateCronSchedule,
  controlCronTask
};
