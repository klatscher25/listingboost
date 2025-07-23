/**
 * @file lib/utils/diagnostic-logger.ts
 * @description Conditional diagnostic logging utility for development and debugging
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo REFACTOR-002: Extracted from FreemiumAPI route for cleaner production builds
 */

/**
 * Enhanced diagnostic logger that respects environment settings
 * Only logs in development mode or when ENABLE_DIAGNOSTICS is set
 */
export class DiagnosticLogger {
  private static isDiagnosticsEnabled(): boolean {
    return (
      process.env.NODE_ENV === 'development' ||
      process.env.ENABLE_DIAGNOSTICS === 'true'
    )
  }

  /**
   * Log diagnostic information - only in development/debug mode
   */
  static log(message: string, ...args: any[]): void {
    if (this.isDiagnosticsEnabled()) {
      console.log(`[DIAGNOSTIC] ${message}`, ...args)
    }
  }

  /**
   * Log diagnostic section separator
   */
  static section(title: string): void {
    if (this.isDiagnosticsEnabled()) {
      console.log(`[DIAGNOSTIC] ========== ${title} ==========`)
    }
  }

  /**
   * Log diagnostic success message
   */
  static success(message: string, ...args: any[]): void {
    if (this.isDiagnosticsEnabled()) {
      console.log(`[DIAGNOSTIC] ✅ ${message}`, ...args)
    }
  }

  /**
   * Log diagnostic error message
   */
  static error(message: string, ...args: any[]): void {
    if (this.isDiagnosticsEnabled()) {
      console.log(`[DIAGNOSTIC] ❌ ${message}`, ...args)
    }
  }

  /**
   * Log diagnostic warning message
   */
  static warn(message: string, ...args: any[]): void {
    if (this.isDiagnosticsEnabled()) {
      console.log(`[DIAGNOSTIC] ⚠️ ${message}`, ...args)
    }
  }

  /**
   * Log diagnostic info message with icon
   */
  static info(message: string, ...args: any[]): void {
    if (this.isDiagnosticsEnabled()) {
      console.log(`[DIAGNOSTIC] ℹ️ ${message}`, ...args)
    }
  }

  /**
   * Log timing information
   */
  static timing(message: string, timeMs: number): void {
    if (this.isDiagnosticsEnabled()) {
      console.log(`[DIAGNOSTIC] 🕐 ${message}`, `${timeMs}ms`)
    }
  }

  /**
   * Log object data with pretty formatting
   */
  static data(message: string, data: any): void {
    if (this.isDiagnosticsEnabled()) {
      console.log(`[DIAGNOSTIC] 📊 ${message}`, data)
    }
  }

  /**
   * End diagnostic section
   */
  static end(): void {
    if (this.isDiagnosticsEnabled()) {
      console.log('[DIAGNOSTIC] ========== END DIAGNOSTICS ==========')
      console.log('')
    }
  }
}

/**
 * Convenience export for shorter usage
 */
export const diagnostic = DiagnosticLogger
