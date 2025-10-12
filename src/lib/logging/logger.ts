// Logging System for ZuboPlay Backend
import type { AnalyticsEvent } from '../api/types';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stack?: string;
}

export interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxFileSize: number;
  maxFiles: number;
  logDirectory: string;
}

export class Logger {
  private config: LogConfig;
  private logQueue: LogEntry[] = [];
  private isProcessing = false;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      logDirectory: './logs',
      ...config
    };
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, any>, error?: Error): void {
    const logContext = {
      ...context,
      ...(error && {
        stack: error.stack,
        name: error.name,
        message: error.message
      })
    };
    this.log(LogLevel.ERROR, message, logContext);
  }

  /**
   * Log a fatal error message
   */
  fatal(message: string, context?: Record<string, any>, error?: Error): void {
    const logContext = {
      ...context,
      ...(error && {
        stack: error.stack,
        name: error.name,
        message: error.message
      })
    };
    this.log(LogLevel.FATAL, message, logContext);
  }

  /**
   * Log API request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string
  ): void {
    this.info('API Request', {
      method,
      url,
      statusCode,
      duration,
      userId,
      requestId
    });
  }

  /**
   * Log API response
   */
  logResponse(
    method: string,
    url: string,
    statusCode: number,
    responseSize: number,
    duration: number,
    userId?: string,
    requestId?: string
  ): void {
    this.info('API Response', {
      method,
      url,
      statusCode,
      responseSize,
      duration,
      userId,
      requestId
    });
  }

  /**
   * Log database operation
   */
  logDatabase(
    operation: string,
    table: string,
    duration: number,
    rowsAffected?: number,
    error?: Error
  ): void {
    if (error) {
      this.error('Database Operation Failed', {
        operation,
        table,
        duration,
        rowsAffected,
        error: error.message
      }, error);
    } else {
      this.info('Database Operation', {
        operation,
        table,
        duration,
        rowsAffected
      });
    }
  }

  /**
   * Log user action
   */
  logUserAction(
    action: string,
    userId: string,
    details?: Record<string, any>,
    sessionId?: string
  ): void {
    this.info('User Action', {
      action,
      userId,
      sessionId,
      ...details
    });
  }

  /**
   * Log game event
   */
  logGameEvent(
    event: string,
    userId: string,
    gameId?: string,
    details?: Record<string, any>,
    sessionId?: string
  ): void {
    this.info('Game Event', {
      event,
      userId,
      gameId,
      sessionId,
      ...details
    });
  }

  /**
   * Log security event
   */
  logSecurity(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: Record<string, any>,
    userId?: string,
    ipAddress?: string
  ): void {
    const level = severity === 'critical' ? LogLevel.FATAL : 
                  severity === 'high' ? LogLevel.ERROR :
                  severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, `Security Event: ${event}`, {
      severity,
      userId,
      ipAddress,
      ...details
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    metric: string,
    value: number,
    unit: string,
    context?: Record<string, any>
  ): void {
    this.info('Performance Metric', {
      metric,
      value,
      unit,
      ...context
    });
  }

  /**
   * Log business event
   */
  logBusiness(
    event: string,
    details?: Record<string, any>,
    userId?: string
  ): void {
    this.info('Business Event', {
      event,
      userId,
      ...details
    });
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (level < this.config.level) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId: context?.requestId
    };

    this.logQueue.push(logEntry);
    this.processLogQueue();
  }

  /**
   * Process log queue
   */
  private async processLogQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const entries = [...this.logQueue];
      this.logQueue = [];

      for (const entry of entries) {
        await this.writeLog(entry);
      }
    } catch (error) {
      console.error('Failed to process log queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Write log entry to all configured outputs
   */
  private async writeLog(entry: LogEntry): Promise<void> {
    const logString = this.formatLogEntry(entry);

    // Console output
    if (this.config.enableConsole) {
      this.writeToConsole(entry, logString);
    }

    // File output
    if (this.config.enableFile) {
      await this.writeToFile(entry, logString);
    }

    // Remote output
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      await this.writeToRemote(entry);
    }
  }

  /**
   * Format log entry as string
   */
  private formatLogEntry(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const message = entry.message;
    const context = entry.context ? JSON.stringify(entry.context) : '';

    return `[${timestamp}] ${levelName}] ${message} ${context}`;
  }

  /**
   * Write to console
   */
  private writeToConsole(entry: LogEntry, logString: string): void {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m'  // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level] || '';
    
    console.log(`${color}${logString}${reset}`);
  }

  /**
   * Write to file
   */
  private async writeToFile(entry: LogEntry, logString: string): Promise<void> {
    // In a real implementation, you would write to files here
    // For now, we'll just log to console
    console.log(`[FILE] ${logString}`);
  }

  /**
   * Write to remote endpoint
   */
  private async writeToRemote(entry: LogEntry): Promise<void> {
    try {
      if (this.config.remoteEndpoint) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry)
        });
      }
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable console logging
   */
  setConsoleLogging(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }

  /**
   * Enable/disable file logging
   */
  setFileLogging(enabled: boolean): void {
    this.config.enableFile = enabled;
  }

  /**
   * Enable/disable remote logging
   */
  setRemoteLogging(enabled: boolean, endpoint?: string): void {
    this.config.enableRemote = enabled;
    if (endpoint) {
      this.config.remoteEndpoint = endpoint;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): LogConfig {
    return { ...this.config };
  }

  /**
   * Flush all pending logs
   */
  async flush(): Promise<void> {
    await this.processLogQueue();
  }
}

// Create singleton logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableFile: process.env.NODE_ENV === 'production',
  enableRemote: false
});

// Export logger instance and utilities
export default logger;

// Utility functions for common logging patterns
export const logUtils = {
  /**
   * Log API request with timing
   */
  logApiRequest: (method: string, url: string, userId?: string, requestId?: string) => {
    const startTime = Date.now();
    return {
      end: (statusCode: number, responseSize?: number) => {
        const duration = Date.now() - startTime;
        logger.logRequest(method, url, statusCode, duration, userId, requestId);
        if (responseSize !== undefined) {
          logger.logResponse(method, url, statusCode, responseSize, duration, userId, requestId);
        }
      }
    };
  },

  /**
   * Log database operation with timing
   */
  logDatabaseOperation: (operation: string, table: string) => {
    const startTime = Date.now();
    return {
      success: (rowsAffected?: number) => {
        const duration = Date.now() - startTime;
        logger.logDatabase(operation, table, duration, rowsAffected);
      },
      error: (error: Error) => {
        const duration = Date.now() - startTime;
        logger.logDatabase(operation, table, duration, undefined, error);
      }
    };
  },

  /**
   * Log user session
   */
  logUserSession: (userId: string, action: string, details?: Record<string, any>) => {
    logger.logUserAction(action, userId, details);
  },

  /**
   * Log game session
   */
  logGameSession: (userId: string, gameId: string, event: string, details?: Record<string, any>) => {
    logger.logGameEvent(event, userId, gameId, details);
  }
};
