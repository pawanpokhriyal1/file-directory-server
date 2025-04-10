const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../config/multer.config');

// File upload
router.post('/upload', upload.single('file'), uploadController.uploadFile);

// File download
router.get('/download/:id', uploadController.downloadFile);

module.exports = router;