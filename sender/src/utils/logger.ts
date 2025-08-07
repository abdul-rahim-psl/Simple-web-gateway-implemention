// Configure the logging service URL
const LOGGING_SERVICE_URL = process.env.ENVIRONMENT === 'development' ? 'http://localhost:3003/api/logger' : 'https://your-production-url/api/logger';

// Log levels
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Send a log entry to the centralized logging service
 * 
 * @param level - Log level (info, warn, error, debug)
 * @param message - Log message
 * @param metadata - Optional metadata to include with the log
 */
export async function log(
  level: LogLevel, 
  message: string, 
): Promise<void> {
  try {
    const logEntry = {
      service: 'sender', // Service name
      level,
      message,
      timestamp: new Date().toISOString(),
      
    };

    // Send log to the logging service
    await fetch(LOGGING_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    });
  } catch (error) {
    // Don't crash if logging fails, but log to console
    console.error('Failed to send log to logging service:', error);
    console.log(`[${new Date().toISOString()}] [SENDER] [${level.toUpperCase()}] ${message}`);
  }
}

// Helper methods for different log levels
export const logger = {
  info: (message: string) => log('info', message ),
  warn: (message: string) => log('warn', message ),
  error: (message: string) => log('error', message ),
  debug: (message: string) => log('debug', message),
};
