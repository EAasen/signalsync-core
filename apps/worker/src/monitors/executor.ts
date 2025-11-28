import { createLogger } from '@signalsync/logger';
import { supabaseAdmin } from '@signalsync/database';
import type { Monitor, CheckResult } from '@signalsync/types';
import { HttpMonitor } from './http';
import { TcpMonitor } from './tcp';
import { SslMonitor } from './ssl';

const logger = createLogger('monitor-executor');

export class MonitorExecutor {
  async execute(monitor: Monitor): Promise<void> {
    const startTime = Date.now();
    logger.info({ monitorId: monitor.id, type: monitor.type }, 'Executing monitor check');

    try {
      let result: Omit<CheckResult, 'id' | 'monitor_id' | 'checked_at'>;

      // Execute the appropriate monitor type
      switch (monitor.type) {
        case 'http':
        case 'https':
          result = await HttpMonitor.check(monitor);
          break;
        case 'tcp':
          result = await TcpMonitor.check(monitor);
          break;
        case 'ssl':
          result = await SslMonitor.check(monitor);
          break;
        default:
          throw new Error(`Unknown monitor type: ${monitor.type}`);
      }

      // Store the check result
      await this.storeResult(monitor.id, result);

      // Update monitor status and last_checked_at
      await this.updateMonitorStatus(monitor.id, result.status);

      const duration = Date.now() - startTime;
      logger.info(
        { 
          monitorId: monitor.id, 
          status: result.status, 
          responseTime: result.response_time_ms,
          duration 
        },
        'Monitor check completed'
      );
    } catch (error) {
      logger.error({ error, monitorId: monitor.id }, 'Monitor check failed');
      
      // Store error result
      await this.storeResult(monitor.id, {
        status: 'down',
        response_time_ms: 0,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      await this.updateMonitorStatus(monitor.id, 'down');
    }
  }

  private async storeResult(
    monitorId: string,
    result: Omit<CheckResult, 'id' | 'monitor_id' | 'checked_at'>
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('check_results')
      .insert({
        monitor_id: monitorId,
        ...result,
      });

    if (error) {
      logger.error({ error, monitorId }, 'Failed to store check result');
    }
  }

  private async updateMonitorStatus(
    monitorId: string,
    status: 'up' | 'down'
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('monitors')
      .update({
        status,
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', monitorId);

    if (error) {
      logger.error({ error, monitorId }, 'Failed to update monitor status');
    }
  }
}
