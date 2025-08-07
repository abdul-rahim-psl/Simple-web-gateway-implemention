import { v4 as uuidv4 } from 'uuid';

// Configure the logging service URL
const LOGGING_SERVICE_URL = 'http://localhost:3003/api/logger';

// Log levels
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Generate or use an existing request ID
let currentRequestId: string | null = null;

/**
 * Get or create a request ID for correlation across services
 */
export function getRequestId(): string {
  if (!currentRequestId) {
    currentRequestId = uuidv4();
  }
  return currentRequestId || uuidv4(); // Fallback in case null persists
}

/**
 * Set the request ID (typically when receiving a request that already has an ID)
 */
export function setRequestId(id: string): void {
  currentRequestId = id;
}

/**
 * Reset the request ID (typically at the end of a request)
 */
export function resetRequestId(): void {
  currentRequestId = null;
}

/**
 * Send a log entry to the centralized logging service
 * 
 * @param level - Log level (info, warn, error, debug)
 * @param message - Log message
 * @param metadata - Optional metadata to include with the log
 * @param requestId - Optional specific request ID to use
 */
export async function log(
  level: LogLevel, 
  message: string, 
  metadata?: any,
  requestId?: string
): Promise<void> {
  try {
    const logEntry = {
      service: 'receiver', // Service name
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId: requestId || getRequestId(),
      metadata
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
    console.log(`[${new Date().toISOString()}] [RECEIVER] [${level.toUpperCase()}] ${message}`);
  }
}

// Helper methods for different log levels
export const logger = {
  info: (message: string, metadata?: any, requestId?: string) => log('info', message, metadata, requestId),
  warn: (message: string, metadata?: any, requestId?: string) => log('warn', message, metadata, requestId),
  error: (message: string, metadata?: any, requestId?: string) => log('error', message, metadata, requestId),
  debug: (message: string, metadata?: any, requestId?: string) => log('debug', message, metadata, requestId),
};
