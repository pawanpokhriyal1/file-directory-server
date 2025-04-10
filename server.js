
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