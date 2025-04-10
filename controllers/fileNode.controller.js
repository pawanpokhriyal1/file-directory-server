const FileNode = require('../models/fileNode.model.js');
const path = require('path');
const fs = require('fs');
const { 
  deleteDirectoryRecursive,
  formatFileSize,
  sanitizeFilename,
  ensureDirectoryExists
} = require('../utils/fileUtils.js');

// Initialize root directory (only run once at startup)
exports.initializeRoot = async () => {
  try {
    let root = await FileNode.findOne({ isRoot: true });
    if (!root) {
      root = new FileNode({
        name: 'Root',
        isFolder: true,
        isRoot: true
      });
      await root.save();
      console.log('Root directory initialized');
    }
    return root;
  } catch (err) {
    console.error('Error initializing root:', err);
    throw err;
  }
};

// Get root directory contents
exports.getRoot = async (req, res, next) => {
  try {
    const root = await FileNode.findOne({ isRoot: true })
      .populate({
        path: 'children',
        options: { sort: { isFolder: -1, name: 1 } } // Folders first
      });

    if (!root) {
      const newRoot = await this.initializeRoot();
      return res.json(newRoot);
    }

    // Format file sizes for response
    const formattedRoot = {
      ...root.toObject(),
      children: root.children.map(child => ({
        ...child.toObject(),
        formattedSize: child.isFolder ? null : formatFileSize(child.fileSize)
      }))
    };

    res.json(formattedRoot);
  } catch (err) {
    next(err);
  }
};

// Get specific folder contents
exports.getFolder = async (req, res, next) => {
  try {
    const folder = await FileNode.findById(req.params.id)
      .populate({
        path: 'children',
        options: { sort: { isFolder: -1, name: 1 } }
      });

    if (!folder || !folder.isFolder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Format file sizes for response
    const formattedFolder = {
      ...folder.toObject(),
      children: folder.children.map(child => ({
        ...child.toObject(),
        formattedSize: child.isFolder ? null : formatFileSize(child.fileSize)
      }))
    };

    res.json(formattedFolder);
  } catch (err) {
    next(err);
  }
};

// Create new folder
exports.createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Invalid folder name' });
    }

    const parent = await FileNode.findById(parentId);
    if (!parent || !parent.isFolder) {
      return res.status(404).json({ message: 'Parent folder not found' });
    }

    const newFolder = new FileNode({
      name: name.trim(),
      isFolder: true,
      parent: parentId
    });

    await newFolder.save();
    parent.children.push(newFolder._id);
    await parent.save();

    res.status(201).json(newFolder);
  } catch (err) {
    next(err);
  }
};

// Rename file or folder
exports.renameItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Invalid name provided' });
    }

    const item = await FileNode.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

// // Delete item (file or folder)
// exports.deleteItem = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const item = await FileNode.findById(id);
//     console.log("item::",item)

//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     if (item.isRoot) {
//       return res.status(400).json({ message: 'Cannot delete root folder' });
//     }

//     // Delete physical files if they exist
//     if (!item.isFolder && item.filePath) {
//       const filePath = path.join(__dirname, '../uploads', item.filePath);
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }
//     }

//     // Handle folder deletion
//     if (item?.isFolder) {
//         console.log("hkjhkj")
//       // Delete all children recursively
//       if (item.children.length > 0) {
//         if(item.children){
//             await this.deleteChildrenRecursive(item.children);
//         }
//       }

//       // Optional: Delete physical folder if you're storing files in folder structure
//       const folderPath = path.join(__dirname, '../uploads', id);
//       if (fs.existsSync(folderPath)) {
//         deleteDirectoryRecursive(folderPath);
//       }
//     }

//     // Remove from parent's children array
//     const parent = await FileNode.findById(item.parent);
//     if (parent) {
//       parent.children = parent.children.filter(
//         childId => childId.toString() !== id
//       );
//       await parent.save();
//     }

//     // Delete the document
//     await FileNode.findByIdAndDelete(id);

//     res.json({ message: 'Item deleted successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// // Helper method for recursive deletion
// exports.deleteChildrenRecursive = async (childrenIds) => {
//   for (const childId of childrenIds) {
//     const child = await FileNode.findById(childId);
//     console.log("child",child)
    
//     if (child?.isFolder && child?.children.length > 0) {
//       await this.deleteChildrenRecursive(child.children);
      
//       // Delete physical folder if exists
//       const folderPath = path.join(__dirname, '../uploads', childId);
//       if (fs.existsSync(folderPath)) {
//         deleteDirectoryRecursive(folderPath);
//       }
//     } else if (!child?.isFolder && child?.filePath) {
//       // Delete physical file if exists
//       const filePath = path.join(__dirname, '../uploads', child?.filePath);
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }
//     }
    
//     await FileNode.findByIdAndDelete(childId);
//   }
// };



exports.deleteItem = async (req, res, next) => {
    try {
      const { id } = req.params;
      const item = await FileNode.findById(id);
  
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      if (item.isRoot) {
        return res.status(400).json({ message: 'Cannot delete root folder' });
      }
  
      // Delete physical file if it exists
      if (!item?.isFolder && item?.filePath) {
        const filePath = path.join(__dirname, '../../uploads', item.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
  
      // Handle folder deletion (only database, not physical files)
      if (item?.isFolder && item?.children.length > 0) {
        if(item?.children){
            await this.deleteChildrenRecursive(item.children);
        }
      }
  
      // Remove from parent's children array
      const parent = await FileNode.findById(item?.parent);
      if (parent) {
        parent.children = parent.children.filter(
          childId => !childId.equals(item._id)
        );
        await parent.save();
      }
  
      // Delete the document
      await FileNode.findByIdAndDelete(id);
  
      res.json({ message: 'Item deleted successfully' });
    } catch (err) {
      console.error('Delete error:', err);
      next(err);
    }
  };
  
  exports.deleteChildrenRecursive = async (childrenIds) => {
    for (const childId of childrenIds) {
      const child = await FileNode.findById(childId);
      console.log("child",child)
      
      if (child?.isFolder && child?.children.length > 0) {
        await this.deleteChildrenRecursive(child.children);
      }
      
      // Delete physical file if exists
      if (!child?.isFolder && child?.filePath) {
        const filePath = path.join(__dirname, '../../uploads', child?.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await FileNode.findByIdAndDelete(childId);
    }
  };