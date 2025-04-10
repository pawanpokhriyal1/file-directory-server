// // require('dotenv').config();
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');
// // const FileNode = require('./models/fileNode.js');
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');

// // const app = express();



// // // Middleware
// // app.use(cors());
// // app.use(bodyParser.json());

// // // Connect to MongoDB
// // mongoose.connect(process.env.MONGODB_URI, {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true
// // })
// // .then(() => console.log('Connected to MongoDB'))
// // .catch(err => console.error('Could not connect to MongoDB', err));


// // // File storage configuration
// // const storage = multer.diskStorage({
// //     destination: (req, file, cb) => {
// //       // Create uploads directory if it doesn't exist
// //       const uploadPath = 'uploads/';
// //       if (!fs.existsSync(uploadPath)) {
// //         fs.mkdirSync(uploadPath, { recursive: true });
// //       }
// //       cb(null, uploadPath);
// //     },
// //     filename: (req, file, cb) => {
// //       // Generate unique filename with original extension
// //       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //       cb(null, uniqueSuffix + path.extname(file.originalname));
// //     }
// //   });
  
// //   // File filter to allow only certain file types
// //   const fileFilter = (req, file, cb) => {
// //     const allowedTypes = [
// //       'image/jpeg',
// //       'image/png',
// //       'application/pdf',
// //       'text/plain',
// //       'application/msword',
// //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
// //     ];
    
// //     if (allowedTypes.includes(file.mimetype)) {
// //       cb(null, true);
// //     } else {
// //       cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and DOC files are allowed.'), false);
// //     }
// //   };
  
// //   // Initialize multer
// //   const upload = multer({
// //     storage: storage,
// //     fileFilter: fileFilter,
// //     limits: {
// //       fileSize: 1024 * 1024 * 1 // 1MB file size limit
// //     }
// //   });
  

// // // API Routes

// // // Get root directory
// // app.get('/api/files', async (req, res) => {
// //   try {
// //     const root = await FileNode.findOne({ isRoot: true }).populate('children');
// //     res.json(root);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // });

// // // Create new file/folder
// // app.post('/api/files', async (req, res) => {
// //   const { name, isFolder, parentId } = req.body;
  
// //   try {
// //     const parent = await FileNode.findById(parentId);
// //     if (!parent) return res.status(404).json({ message: 'Parent not found' });

// //     const newNode = new FileNode({
// //       name,
// //       isFolder,
// //       parent: parentId
// //     });

// //     await newNode.save();

// //     parent.children.push(newNode._id);
// //     await parent.save();

// //     res.status(201).json(newNode);
// //   } catch (err) {
// //     res.status(400).json({ message: err.message });
// //   }
// // });

// // // Rename file/folder
// // app.patch('/api/files/:id', async (req, res) => {
// //   const { name } = req.body;
  
// //   try {
// //     const node = await FileNode.findByIdAndUpdate(
// //       req.params.id,
// //       { name },
// //       { new: true }
// //     );
    
// //     if (!node) return res.status(404).json({ message: 'Node not found' });
    
// //     res.json(node);
// //   } catch (err) {
// //     res.status(400).json({ message: err.message });
// //   }
// // });

// // // Delete file/folder
// // app.delete('/api/files/:id', async (req, res) => {
// //   try {
// //     const node = await FileNode.findById(req.params.id);
// //     if (!node) return res.status(404).json({ message: 'Node not found' });

// //     // Recursively delete children if it's a folder
// //     if (node.isFolder && node.children.length > 0) {
// //       await deleteChildren(node.children);
// //     }

// //     // Remove reference from parent
// //     if (node.parent) {
// //       const parent = await FileNode.findById(node.parent);
// //       parent.children = parent.children.filter(childId => childId.toString() !== node._id.toString());
// //       await parent.save();
// //     }

// //     await FileNode.findByIdAndDelete(req.params.id);
// //     res.json({ message: 'Node deleted successfully' });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // });

// // async function deleteChildren(childrenIds) {
// //   for (const childId of childrenIds) {
// //     const child = await FileNode.findById(childId);
// //     if (child.isFolder && child.children.length > 0) {
// //       await deleteChildren(child.children);
// //     }
// //     await FileNode.findByIdAndDelete(childId);
// //   }
// // }

// // // Initialize root directory if it doesn't exist
// // async function initializeRoot() {
// //   const rootExists = await FileNode.findOne({ isRoot: true });
// //   if (!rootExists) {
// //     const root = new FileNode({
// //       name: 'Root',
// //       isFolder: true,
// //       isRoot: true
// //     });
// //     await root.save();
// //     console.log('Root directory initialized');
// //   }
// // }

// // // Add this after your existing routes

// // // File upload endpoint
// // app.post('/api/files/upload', upload.single('file'), async (req, res) => {
// //     try {
// //       const { parentId } = req.body;
// //       const { originalname, filename, size, mimetype } = req.file;
  
// //       const parent = await FileNode.findById(parentId);
// //       if (!parent) return res.status(404).json({ message: 'Parent not found' });
  
// //       const newNode = new FileNode({
// //         name: originalname,
// //         isFolder: false,
// //         parent: parentId,
// //         filePath: filename,
// //         fileSize: size,
// //         fileType: mimetype
// //       });
  
// //       await newNode.save();
// //       parent.children.push(newNode._id);
// //       await parent.save();
  
// //       res.status(201).json(newNode);
// //     } catch (err) {
// //       res.status(400).json({ message: err.message });
// //     }
// //   });
  
// //   // File download endpoint
// //   app.get('/api/files/download/:id', async (req, res) => {
// //     try {
// //       const fileNode = await FileNode.findById(req.params.id);
// //       if (!fileNode || fileNode.isFolder) {
// //         return res.status(404).json({ message: 'File not found' });
// //       }
  
// //       const filePath = path.join(__dirname, 'uploads', fileNode.filePath);
// //       res.download(filePath, fileNode.name);
// //     } catch (err) {
// //       res.status(400).json({ message: err.message });
// //     }
// //   });
  

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// //   initializeRoot();
// // });


// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.static('public'));

// // Database connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/file-explorer', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('MongoDB connection error:', err));

// // File Node Model
// const fileNodeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   isFolder: { type: Boolean, required: true },
//   isRoot: { type: Boolean, default: false },
//   parent: { type: mongoose.Schema.Types.ObjectId, ref: 'FileNode' },
//   children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileNode' }],
//   filePath: { type: String },
//   fileSize: { type: Number },
//   fileType: { type: String },
//   createdAt: { type: Date, default: Date.now }
// });

// const FileNode = mongoose.model('FileNode', fileNodeSchema);

// // File upload configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = 'uploads/';
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({ 
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB
// });

// // Initialize root directory
// async function initializeRoot() {
//   try {
//     let root = await FileNode.findOne({ isRoot: true });
//     if (!root) {
//       root = new FileNode({
//         name: 'Root',
//         isFolder: true,
//         isRoot: true
//       });
//       await root.save();
//       console.log('Root directory initialized');
//     }
//     return root;
//   } catch (err) {
//     console.error('Error initializing root:', err);
//     process.exit(1);
//   }
// }

// // API Endpoints

// // Get root directory
// app.get('/api/root', async (req, res) => {
//   try {
//     const root = await FileNode.findOne({ isRoot: true })
//       .populate({
//         path: 'children',
//         options: { sort: { isFolder: -1, name: 1 } } // Folders first
//       });
//     res.json(root);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Get folder contents
// app.get('/api/folder/:id', async (req, res) => {
//   try {
//     const folder = await FileNode.findById(req.params.id)
//       .populate({
//         path: 'children',
//         options: { sort: { isFolder: -1, name: 1 } } // Folders first
//       });
    
//     if (!folder || !folder.isFolder) {
//       return res.status(404).json({ message: 'Folder not found' });
//     }
    
//     res.json(folder);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Create new folder
// app.post('/api/folder', async (req, res) => {
//   try {
//     const { name, parentId } = req.body;
    
//     const parent = await FileNode.findById(parentId);
//     if (!parent || !parent.isFolder) {
//       return res.status(404).json({ message: 'Parent folder not found' });
//     }

//     const newFolder = new FileNode({
//       name,
//       isFolder: true,
//       parent: parentId
//     });

//     await newFolder.save();
//     parent.children.push(newFolder._id);
//     await parent.save();

//     res.status(201).json(newFolder);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Upload file
// app.post('/api/upload', upload.single('file'), async (req, res) => {
//   try {
//     const { parentId } = req.body;
    
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     const parent = await FileNode.findById(parentId);
//     if (!parent || !parent.isFolder) {
//       return res.status(404).json({ message: 'Parent folder not found' });
//     }

//     const newFile = new FileNode({
//       name: req.file.originalname,
//       isFolder: false,
//       parent: parentId,
//       filePath: req.file.filename,
//       fileSize: req.file.size,
//       fileType: req.file.mimetype
//     });

//     await newFile.save();
//     parent.children.push(newFile._id);
//     await parent.save();

//     res.status(201).json(newFile);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Download file
// app.get('/api/download/:id', async (req, res) => {
//   try {
//     const file = await FileNode.findById(req.params.id);
    
//     if (!file || file.isFolder) {
//       return res.status(404).json({ message: 'File not found' });
//     }

//     const filePath = path.join(__dirname, 'uploads', file.filePath);
//     res.download(filePath, file.name);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Delete item
// app.delete('/api/delete/:id', async (req, res) => {
//   try {
//     const item = await FileNode.findById(req.params.id);
//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     // Can't delete root
//     if (item.isRoot) {
//       return res.status(400).json({ message: 'Cannot delete root folder' });
//     }

//     // Delete children recursively if it's a folder
//     if (item.isFolder && item.children.length > 0) {
//       await deleteChildren(item.children);
//     }

//     // Remove from parent's children array
//     const parent = await FileNode.findById(item.parent);
//     if (parent) {
//       parent.children = parent.children.filter(childId => !childId.equals(item._id));
//       await parent.save();
//     }

//     // Delete the item
//     await FileNode.findByIdAndDelete(item._id);

//     res.json({ message: 'Item deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// // Rename file or folder
// app.patch('/api/rename/:id', async (req, res) => {
//     try {
//       const { name } = req.body;
      
//       if (!name || typeof name !== 'string' || name.trim() === '') {
//         return res.status(400).json({ message: 'Invalid name provided' });
//       }
  
//       const item = await FileNode.findByIdAndUpdate(
//         req.params.id,
//         { name: name.trim() },
//         { new: true }
//       );
  
//       if (!item) {
//         return res.status(404).json({ message: 'Item not found' });
//       }
  
//       res.json(item);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });
// async function deleteChildren(childrenIds) {
//   for (const childId of childrenIds) {
//     const child = await FileNode.findById(childId);
//     if (child.isFolder && child.children.length > 0) {
//       await deleteChildren(child.children);
//     }
//     await FileNode.findByIdAndDelete(childId);
//   }
// }

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, async () => {
//   console.log(`Server running on port ${PORT}`);
//   await initializeRoot();
// });


const app = require('./app.js');
const connectDB = require('./config/db.js');
const { initializeRoot } = require('./controllers/fileNode.controller.js');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await initializeRoot();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});