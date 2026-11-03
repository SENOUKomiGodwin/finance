const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const dataController = require('../controllers/dataController');
const { uploadData } = dataController;

// All routes require authentication
router.use(auth);

// Data upload
router.post('/upload', uploadData);

// Get user's data
router.get('/', dataController.getData);

// Get specific data by ID
router.get('/:id', dataController.getDataById);

// Delete data
router.delete('/:id', authorize('administrator', 'manager'), dataController.deleteData);

module.exports = router;
