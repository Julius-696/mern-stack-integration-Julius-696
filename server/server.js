// server.js - Main server file for the MERN blog application

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const { limiter, authLimiter } = require('./middleware/rateLimiter');

// Import routes
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet()); // Security headers

// Configure CORS for different environments
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',   // common CRA default
  'http://localhost:5173',   // Vite dev server
  'https://your-app-name.vercel.app', // Add your production domain here
  'https://your-app-name.netlify.app'  // Add your production domain here
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Origin not allowed'), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', limiter); // General API rate limit
app.use('/api/auth/', authLimiter); // Stricter limit for auth routes

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API routes
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve uploaded files from the uploads directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Serve static files from the React app
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
  });
} else {
  // Root route for development
  app.get('/', (req, res) => {
    res.send('MERN Blog API is running');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = require('net');
  startPort = parseInt(startPort, 10); // Ensure port is a number
  
  if (startPort >= 65536) {
    throw new Error('No available ports found');
  }

  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });

    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE') {
        try {
          // Port is in use, try the next port
          const nextPort = await findAvailablePort(startPort + 1);
          resolve(nextPort);
        } catch (e) {
          reject(e);
        }
      } else {
        reject(err);
      }
    });
  });
};

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const availablePort = await findAvailablePort(PORT);
      app.listen(availablePort, () => {
        console.log(`Server running on port ${availablePort}`);
        // Add an endpoint to get the current port
        app.get('/api/server-info', (req, res) => {
          res.json({ port: availablePort });
        });
      });
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app; 