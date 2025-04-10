// const mongoose = require('mongoose');

// const fileNodeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   isFolder: { type: Boolean, required: true },
//   isRoot: { type: Boolean, default: false },
//   parent: { type: mongoose.Schema.Types.ObjectId, ref: 'FileNode' },
//   children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileNode' }],
//   // New fields for file storage
//   filePath: { type: String },
//   fileSize: { type: Number },
//   fileType: { type: String },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('FileNode', fileNodeSchema);


const mongoose = require('mongoose');

const fileNodeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: function() { return !this.isRoot; } 
  },
  isFolder: { type: Boolean, required: true },
  isRoot: { 
    type: Boolean, 
    default: false,
    immutable: true
  },
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FileNode',
    required: function() { return !this.isRoot; }
  },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileNode' }],
  filePath: { type: String },
  fileSize: { type: Number },
  fileType: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Prevent multiple roots
fileNodeSchema.pre('save', async function(next) {
  if (this.isRoot) {
    const existingRoot = await this.constructor.findOne({ isRoot: true });
    if (existingRoot && !existingRoot._id.equals(this._id)) {
      throw new Error('Root node already exists');
    }
  }
  next();
});

module.exports = mongoose.model('FileNode', fileNodeSchema);