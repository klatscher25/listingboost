/**
 * @file lib/utils/logger.ts
 * @description Production-safe logging utility for ListingBoost Pro
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo SECURITY-001: Replace console.log statements with secure logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDev: boolean
  private isTest: boolean

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
    this.isTest = process.env.NODE_ENV === 'test'
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    // Only log in development or test environments
    if (!this.isDev && !this.isTest) {
      return
    }

    const formattedMessage = this.formatMessage(level, message, context)

    switch (level) {
      case 'debug':
        console.debug(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'error':
        console.error(formattedMessage)
        break
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }

  // Special method for API operations that should always log errors
  apiError(message: string, error: any, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.message || error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    }

    // Always log errors, even in production
    console.error(this.formatMessage('error', message, errorContext))
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const logDebug = (message: string, context?: LogContext) =>
  logger.debug(message, context)
export const logInfo = (message: string, context?: LogContext) =>
  logger.info(message, context)
export const logWarn = (message: string, context?: LogContext) =>
  logger.warn(message, context)
export const logError = (message: string, context?: LogContext) =>
  logger.error(message, context)
export const logApiError = (
  message: string,
  error: any,
  context?: LogContext
) => logger.apiError(message, error, context)
