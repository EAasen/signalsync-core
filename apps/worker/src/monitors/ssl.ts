import { createLogger } from '@signalsync/logger';
import type { Monitor, SslMonitorConfig } from '@signalsync/types';
import * as tls from 'tls';

const logger = createLogger('ssl-monitor');

export class SslMonitor {
  static async check(monitor: Monitor): Promise<{
    status: 'up' | 'down';
    response_time_ms: number;
    error_message?: string;
    ssl_expiry_date?: Date;
  }> {
    const config = monitor.config as SslMonitorConfig;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const timeout = monitor.timeout_seconds * 1000;

      const timer = setTimeout(() => {
        resolve({
          status: 'down',
          response_time_ms: Date.now() - startTime,
          error_message: 'SSL check timeout',
        });
      }, timeout);

      const socket = tls.connect(
        {
          host: config.host,
          port: config.port,
          servername: config.host,
          rejectUnauthorized: false, // We want to check even invalid certs
        },
        () => {
          clearTimeout(timer);
          const responseTime = Date.now() - startTime;

          try {
            const cert = socket.getPeerCertificate();
            
            if (!cert || !cert.valid_to) {
              socket.destroy();
              resolve({
                status: 'down',
                response_time_ms: responseTime,
                error_message: 'No valid certificate found',
              });
              return;
            }

            const expiryDate = new Date(cert.valid_to);
            const daysUntilExpiry = Math.floor(
              (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            // Check if certificate is expired or expiring soon
            const isExpired = daysUntilExpiry < 0;
            const isExpiringSoon = daysUntilExpiry <= config.warn_days_before_expiry;

            socket.destroy();

            resolve({
              status: isExpired ? 'down' : 'up',
              response_time_ms: responseTime,
              ssl_expiry_date: expiryDate,
              error_message: isExpired
                ? `Certificate expired ${Math.abs(daysUntilExpiry)} days ago`
                : isExpiringSoon
                ? `Certificate expires in ${daysUntilExpiry} days`
                : undefined,
            });
          } catch (error) {
            socket.destroy();
            resolve({
              status: 'down',
              response_time_ms: responseTime,
              error_message: error instanceof Error ? error.message : 'Certificate check failed',
            });
          }
        }
      );

      socket.on('error', (error) => {
        clearTimeout(timer);
        socket.destroy();
        
        resolve({
          status: 'down',
          response_time_ms: Date.now() - startTime,
          error_message: error.message,
        });
      });
    });
  }
}
