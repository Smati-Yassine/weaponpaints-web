import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import passport, { configurePassport } from './config/passport';
import { getSessionConfig } from './config/session';
import { initializeDatabase } from './config/database';
import { loadAllItemData } from './services/itemLoader';
import authRoutes from './routes/auth';
import weaponsRoutes from './routes/weapons';
import teamConfigRoutes from './routes/team-config';
import itemsRoutes from './routes/items';
import bulkOperationsRoutes from './routes/bulk-operations';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger, { logInfo, logError } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Session configuration
app.use(session(getSessionConfig()));

// Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/player/weapons', weaponsRoutes);
app.use('/api/player', teamConfigRoutes);
app.use('/api/player', bulkOperationsRoutes);
app.use('/api/items', itemsRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'CS2 WeaponPaints API is running' });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize application
async function initializeApp() {
  try {
    // Initialize database connection
    await initializeDatabase();
    logInfo('Database initialized successfully');

    // Load item data
    await loadAllItemData();
    logInfo('Item data loaded successfully');

    // Start server
    app.listen(PORT, () => {
      logInfo(`Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      });
    });
  } catch (error) {
    logError('Failed to initialize application', error as Error);
    process.exit(1);
  }
}

// Start the application
initializeApp();

export default app;
