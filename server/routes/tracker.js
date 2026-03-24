const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/trackerController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/add', trackerController.addTrackerEntry);
router.get('/all', trackerController.getAllTrackerEntries);
router.get('/stats', trackerController.getTrackerStats);

module.exports = router;