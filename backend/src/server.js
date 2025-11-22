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
const { deprecationWarningMiddleware } = require('./utils/apiDeprecation');

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

// Mount versioned API routes
app.use('/api', apiRouter);

// Legacy routes (for backward compatibility)
// These will be deprecated in the future - add deprecation warnings
app.use('/customers', deprecationWarningMiddleware, customerRoutes);
app.use('/orders', deprecationWarningMiddleware, orderRoutes);

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
