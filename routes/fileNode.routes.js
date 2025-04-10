const express = require('express');
const router = express.Router();
const fileNodeController = require('../controllers/fileNode.controller.js');

// Get root directory contents
router.get('/root', fileNodeController.getRoot);

// Get specific folder contents
router.get('/folder/:id', fileNodeController.getFolder);

// Create new folder
router.post('/folder', fileNodeController.createFolder);

// Rename item
router.patch('/rename/:id', fileNodeController.renameItem);

// Delete item
router.delete('/delete/:id', fileNodeController.deleteItem);

module.exports = router;