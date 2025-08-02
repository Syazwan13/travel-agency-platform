const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleWare');
const {
  startScraping,
  getScrapingStatus,
  cancelScraping,
  getScrapingStatistics,
  getScrapingLogs,
  getRunningOperations,
  getCronStatus,
  updateCronSchedule,
  controlCronTask
} = require('../controllers/scrapingController');

// All scraping routes require admin access
router.use(protect);
router.use(isAdmin);

// Manual scraping operations
router.post('/start', startScraping);
router.get('/status/:operationId', getScrapingStatus);
router.post('/cancel/:operationId', cancelScraping);

// Scraping monitoring and logs
router.get('/statistics', getScrapingStatistics);
router.get('/logs', getScrapingLogs);
router.get('/running', getRunningOperations);

// Cron job management
router.get('/cron/status', getCronStatus);
router.put('/cron/schedule', updateCronSchedule);
router.post('/cron/:action/:taskName', controlCronTask);

module.exports = router;
