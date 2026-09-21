const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'borrowloop',
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[MongoDB] Connected successfully to database: borrowloop');
  } catch (error) {
    console.warn(`[MongoDB Warning] Primary connection error: ${error.message}`);
    // If Atlas IP is not whitelisted in development environment, fallback to local MongoDB instance
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MongoDB] Attempting fallback to local MongoDB service (mongodb://127.0.0.1:27017/borrowloop)...');
        await mongoose.connect('mongodb://127.0.0.1:27017/borrowloop', {
          dbName: 'borrowloop',
          serverSelectionTimeoutMS: 5000,
        });
        console.log('[MongoDB] Fallback connected successfully to local MongoDB database: borrowloop');
        return;
      } catch (localError) {
        console.error(`[MongoDB Error] Local fallback failed: ${localError.message}`);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
