import { config } from 'dotenv';
import { createLogger } from '@signalsync/logger';
import { Scheduler } from './scheduler';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const logger = createLogger('worker');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  logger.info('🚦 SignalSync Worker starting...');

  // Verify database connection
  try {
    const { error } = await supabase.from('monitors').select('count', { count: 'exact', head: true });
    if (error) {
      logger.error({ error }, 'Failed to connect to database');
      process.exit(1);
    }
    logger.info('✅ Database connection verified');
  } catch (error) {
    logger.error({ error }, 'Failed to verify database connection');
    process.exit(1);
  }

  try {
    // Initialize scheduler
    const scheduler = new Scheduler(supabase);
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
