import http from 'http';
import app from './app.js';
import { connectDB } from './config/database.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { initializeSocket } from './services/socketService.js';
import { cacheService } from './services/cacheService.js';

const start = async () => {
  await connectDB();
  await cacheService.connect();

  const server = http.createServer(app);
  initializeSocket(server);

  server.listen(config.port, () => {
    logger.info(`NexShop server running on port ${config.port} in ${config.env} mode`);
    logger.info(`Client URL: ${config.clientUrl}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection:', reason));
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
  });
};

start();
