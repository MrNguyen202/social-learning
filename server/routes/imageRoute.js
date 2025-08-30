const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Upload file to Supabase
router.post('/uploads', imageController.uploadFile);

// Get file URL
router.get('/url/:filePath', imageController.getFileUrl);

module.exports = router;