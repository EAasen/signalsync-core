import axios from 'axios';
import { createLogger } from '@signalsync/logger';
import type { Monitor, HttpMonitorConfig } from '@signalsync/types';

const logger = createLogger('http-monitor');

export class HttpMonitor {
  static async check(monitor: Monitor): Promise<{
    status: 'up' | 'down';
    response_time_ms: number;
    error_message?: string;
    http_status_code?: number;
  }> {
    const config = monitor.config as HttpMonitorConfig;
    const startTime = Date.now();

    try {
      const response = await axios({
        method: config.method,
        url: config.url,
        headers: config.headers,
        data: config.body,
        timeout: monitor.timeout_seconds * 1000,
        maxRedirects: config.follow_redirects ? 5 : 0,
        validateStatus: () => true, // Don't throw on any status code
      });

      const responseTime = Date.now() - startTime;

      // Check if status code is expected
      const statusCodeMatch = config.expected_status_codes.includes(response.status);

      // Check keyword verification if enabled
      let keywordMatch = true;
      if (config.keyword_verification?.enabled) {
        const keyword = config.keyword_verification.keyword;
        const responseData = String(response.data);
        
        if (config.keyword_verification.case_sensitive) {
          keywordMatch = responseData.includes(keyword);
        } else {
          keywordMatch = responseData.toLowerCase().includes(keyword.toLowerCase());
        }
      }

      const isUp = statusCodeMatch && keywordMatch;

      return {
        status: isUp ? 'up' : 'down',
        response_time_ms: responseTime,
        http_status_code: response.status,
        error_message: isUp 
          ? undefined 
          : `Status: ${response.status}, Keyword match: ${keywordMatch}`,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'down',
        response_time_ms: responseTime,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
