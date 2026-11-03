const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// All routes require authentication
router.use(auth);

// Get KPIs
router.get('/kpi', analyticsController.getKPIs);

// Get chart data
router.get('/charts', analyticsController.getChartData);

// Detect anomalies
router.get('/anomalies/:data_id', analyticsController.detectAnomalies);

// Get forecast
router.get('/forecast/:data_id', analyticsController.getForecast);

module.exports = router;
