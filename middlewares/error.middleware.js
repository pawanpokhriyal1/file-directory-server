const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'MulterError') {
      return res.status(400).json({
        message: err.code === 'LIMIT_FILE_SIZE' 
          ? 'File too large (max 1MB)' 
          : 'File upload error'
      });
    }
  
    res.status(500).json({ 
      message: err.message || 'Something went wrong!' 
    });
  };
  
  module.exports = errorHandler;