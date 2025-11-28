import { createLogger } from '@signalsync/logger';
import { supabaseAdmin } from '@signalsync/database';
import type { Monitor } from '@signalsync/types';
import { MonitorExecutor } from './monitors/executor';

const logger = createLogger('scheduler');

export class Scheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private executor: MonitorExecutor;
  private checkIntervalMs: number;

  constructor() {
    this.executor = new MonitorExecutor();
    // Default to 60 seconds between scheduling checks
    this.checkIntervalMs = parseInt(process.env.WORKER_CHECK_INTERVAL_MS || '60000');
  }

  async start() {
    logger.info('Starting monitor scheduler...');

    // Run initial check immediately
    await this.scheduleMonitors();

    // Schedule periodic checks
    this.intervalId = setInterval(async () => {
      await this.scheduleMonitors();
    }, this.checkIntervalMs);

    logger.info({ intervalMs: this.checkIntervalMs }, 'Scheduler started');
  }

  async stop() {
    logger.info('Stopping scheduler...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info('Scheduler stopped');
  }

  private async scheduleMonitors() {
    try {
      // Fetch all active monitors that need checking
      const { data: monitors, error } = await supabaseAdmin
        .from('monitors')
        .select('*')
        .in('status', ['up', 'down'])
        .or(`last_checked_at.is.null,last_checked_at.lt.${new Date(Date.now() - 60000).toISOString()}`);

      if (error) {
        logger.error({ error }, 'Failed to fetch monitors');
        return;
      }

      if (!monitors || monitors.length === 0) {
        logger.debug('No monitors to check');
        return;
      }

      logger.info({ count: monitors.length }, 'Scheduling monitor checks');

      // Execute checks in parallel (with concurrency limit)
      const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '10');
      const chunks = this.chunkArray(monitors, concurrency);

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map((monitor) => this.executeMonitorCheck(monitor))
        );
      }
    } catch (error) {
      logger.error({ error }, 'Error in scheduler');
    }
  }

  private async executeMonitorCheck(monitor: any) {
    try {
      await this.executor.execute(monitor);
    } catch (error) {
      logger.error({ error, monitorId: monitor.id }, 'Failed to execute monitor check');
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
