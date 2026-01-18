import winston from 'winston';

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'cs2-weaponpaints-api',
  },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let metaStr = '';
          if (Object.keys(meta).length > 0) {
            metaStr = JSON.stringify(meta, null, 2);
          }
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    }),
  ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Log error with context
 */
export function logError(message: string, error?: Error, context?: Record<string, any>): void {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
    ...context,
  });
}

/**
 * Log warning
 */
export function logWarn(message: string, context?: Record<string, any>): void {
  logger.warn(message, context);
}

/**
 * Log info
 */
export function logInfo(message: string, context?: Record<string, any>): void {
  logger.info(message, context);
}

/**
 * Log debug
 */
export function logDebug(message: string, context?: Record<string, any>): void {
  logger.debug(message, context);
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: Record<string, any>
): void {
  logger.warn(`[SECURITY] ${event}`, {
    severity,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'failed_login' | 'session_expired',
  steamId?: string,
  context?: Record<string, any>
): void {
  logger.info(`[AUTH] ${event}`, {
    steamId,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

/**
 * Log database event
 */
export function logDatabaseEvent(
  event: string,
  success: boolean,
  context?: Record<string, any>
): void {
  const level = success ? 'info' : 'error';
  logger.log(level, `[DATABASE] ${event}`, {
    success,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

export default logger;
