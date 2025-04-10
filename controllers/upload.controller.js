const FileNode = require('../models/fileNode.model.js');
const path = require('path');
const fs = require('fs');
const { 
  sanitizeFilename,
  ensureDirectoryExists,
  validateFileExtension
} = require('../utils/fileUtils.js');

// File upload handler
exports.uploadFile = async (req, res, next) => {
  try {
    const { parentId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.txt'];
    if (!validateFileExtension(req.file.originalname, allowedExtensions)) {
      // Delete the uploaded file if type is invalid
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Invalid file type' });
    }

    // Sanitize filename and ensure upload directory exists
    const safeFilename = sanitizeFilename(req.file.originalname);
    ensureDirectoryExists(path.join(__dirname, '../uploads'));

    const parent = await FileNode.findById(parentId);
    if (!parent || !parent.isFolder) {
      // Delete the uploaded file if parent is invalid
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Parent folder not found' });
    }

    const newFile = new FileNode({
      name: safeFilename,
      isFolder: false,
      parent: parentId,
      filePath: req.file.filename,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    });

    await newFile.save();
    parent.children.push(newFile._id);
    await parent.save();

    res.status(201).json(newFile);
  } catch (err) {
    // Clean up uploaded file if error occurs
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// File download handler
exports.downloadFile = async (req, res, next) => {
  try {
    const file = await FileNode.findById(req.params.id);
    
    if (!file || file.isFolder) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '../uploads', file.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, file.name, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
