const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// All routes require authentication
router.use(auth);

// Generate report
router.get('/generate', reportController.generateReport);

module.exports = router;
