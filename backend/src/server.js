const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const apiRouter = require('./routes');
const customerRoutes = require('./routes/v1/customerRoutes');
const orderRoutes = require('./routes/v1/orderRoutes');
const reminderCron = require('./cron/reminderCron');
const globalErrorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/appError');
const { sendSuccess } = require('./utils/responseHandler');
const { versionMiddleware } = require('./middleware/versionMiddleware');
const { protect } = require('./middleware/authMiddleware');
const { deprecationWarningMiddleware } = require('./utils/apiDeprecation');
const { globalRateLimiter, smsRateLimiter } = require('./middleware/rateLimitMiddleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for mobile app
    methods: ['GET', 'POST']
  }
});

// Make io available in routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Apply version middleware globally
app.use(versionMiddleware);

// Apply global rate limiting
app.use('/api', globalRateLimiter);
app.use('/customers', globalRateLimiter);
app.use('/orders', globalRateLimiter);

// Apply authentication middleware globally
// Note: Health check route is excluded from auth in many cases, but for simplicity as per plan, we apply it globally first.
// If we want to exclude health check, we should move it above this line or make the middleware conditional.
// For now, let's keep it simple and apply it to /api, /customers, and /orders, but maybe leave root / open?
// The plan said "Apply the middleware globally or to specific routes".
// Let's apply it to the routes we want to protect.

// Mount versioned API routes
app.use('/api', protect, apiRouter);

// Legacy routes (for backward compatibility)
// These will be deprecated in the future - add deprecation warnings
app.use('/customers', protect, deprecationWarningMiddleware, customerRoutes);
app.use('/orders', protect, deprecationWarningMiddleware, orderRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  sendSuccess(res, { 
    status: 'OK',
    version: 'v1',
    apiEndpoint: '/api/v1'
  }, 'Fashion Designer Backend is running');
});

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Cron Job
reminderCron.start();
console.log('Cron job initialized');

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Accessible locally at http://localhost:${PORT}`);
});
