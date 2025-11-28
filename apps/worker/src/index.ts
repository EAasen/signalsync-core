import { config } from 'dotenv';
import { createLogger } from '@signalsync/logger';
import { Scheduler } from './scheduler';

// Load environment variables
config();

const logger = createLogger('worker');

async function main() {
  logger.info('🚦 SignalSync Worker starting...');

  try {
    // Initialize scheduler
    const scheduler = new Scheduler();
    await scheduler.start();

    logger.info('✅ Worker started successfully');

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await scheduler.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      await scheduler.stop();
      process.exit(0);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start worker');
    process.exit(1);
  }
}

main();
