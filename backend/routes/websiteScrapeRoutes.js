const express = require('express');
const router = express.Router();
const { scrapeAndSaveAmitravel } = require('../controllers/websiteScrapeController');

router.get('/amitravel', scrapeAndSaveAmitravel);

module.exports = router;
