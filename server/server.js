const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { corsOptions } = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Centralized CORS middleware (Registered before routes)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2. Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 4. Static uploads (with CORS)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Health Check Endpoint (Safe for public probing, no credentials exposed)
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    message: 'BorrowLoop API is running',
    database: isDbConnected ? 'connected' : 'disconnected',
  });
});

// 6. Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 7. 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// 8. Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before accepting incoming requests
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BorrowLoop Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection]: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();

module.exports = app;
