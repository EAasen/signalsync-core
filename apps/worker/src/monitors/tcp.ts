import { createLogger } from '@signalsync/logger';
import type { Monitor, TcpMonitorConfig } from '@signalsync/types';
import { Socket } from 'net';

const logger = createLogger('tcp-monitor');

export class TcpMonitor {
  static async check(monitor: Monitor): Promise<{
    status: 'up' | 'down';
    response_time_ms: number;
    error_message?: string;
  }> {
    const config = monitor.config as TcpMonitorConfig;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const socket = new Socket();
      const timeout = monitor.timeout_seconds * 1000;

      const timer = setTimeout(() => {
        socket.destroy();
        resolve({
          status: 'down',
          response_time_ms: Date.now() - startTime,
          error_message: 'Connection timeout',
        });
      }, timeout);

      socket.on('connect', () => {
        clearTimeout(timer);
        const responseTime = Date.now() - startTime;
        socket.destroy();
        
        resolve({
          status: 'up',
          response_time_ms: responseTime,
        });
      });

      socket.on('error', (error) => {
        clearTimeout(timer);
        socket.destroy();
        
        resolve({
          status: 'down',
          response_time_ms: Date.now() - startTime,
          error_message: error.message,
        });
      });

      socket.connect(config.port, config.host);
    });
  }
}
