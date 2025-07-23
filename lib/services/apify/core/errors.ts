/**
 * @file lib/services/apify/core/errors.ts
 * @description Apify error handling and custom error types
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Extracted from client.ts for CLAUDE.md compliance
 */

/**
 * Custom error class for Apify-related operations
 */
export class ApifyError extends Error {
  public readonly type:
    | 'NETWORK_ERROR'
    | 'RATE_LIMIT'
    | 'ACTOR_FAILED'
    | 'TIMEOUT'
    | 'INVALID_INPUT'
    | 'UNKNOWN'
  public readonly details?: unknown
  public readonly retryAfter?: number
  public readonly actorId?: string
  public readonly executionId?: string

  constructor(config: {
    type:
      | 'NETWORK_ERROR'
      | 'RATE_LIMIT'
      | 'ACTOR_FAILED'
      | 'TIMEOUT'
      | 'INVALID_INPUT'
      | 'UNKNOWN'
    message: string
    details?: unknown
    retryAfter?: number
    actorId?: string
    executionId?: string
  }) {
    super(config.message)
    this.name = 'ApifyError'
    this.type = config.type
    this.details = config.details
    this.retryAfter = config.retryAfter
    this.actorId = config.actorId
    this.executionId = config.executionId
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return (
      this.type === 'RATE_LIMIT' ||
      this.type === 'NETWORK_ERROR' ||
      this.type === 'TIMEOUT'
    )
  }

  /**
   * Get recommended retry delay in milliseconds
   */
  getRetryDelay(): number {
    if (this.retryAfter) {
      return this.retryAfter
    }

    switch (this.type) {
      case 'RATE_LIMIT':
        return 5 * 60 * 1000 // 5 minutes
      case 'NETWORK_ERROR':
        return 30 * 1000 // 30 seconds
      case 'TIMEOUT':
        return 60 * 1000 // 1 minute
      default:
        return 0
    }
  }

  /**
   * Create a network error
   */
  static networkError(message: string, details?: unknown): ApifyError {
    return new ApifyError({
      type: 'NETWORK_ERROR',
      message,
      details,
    })
  }

  /**
   * Create a rate limit error
   */
  static rateLimit(
    message: string,
    retryAfter?: number,
    actorId?: string
  ): ApifyError {
    return new ApifyError({
      type: 'RATE_LIMIT',
      message,
      retryAfter,
      actorId,
    })
  }

  /**
   * Create an actor failed error
   */
  static actorFailed(
    message: string,
    actorId?: string,
    executionId?: string,
    details?: unknown
  ): ApifyError {
    return new ApifyError({
      type: 'ACTOR_FAILED',
      message,
      actorId,
      executionId,
      details,
    })
  }

  /**
   * Create a timeout error
   */
  static timeout(
    message: string,
    actorId?: string,
    executionId?: string
  ): ApifyError {
    return new ApifyError({
      type: 'TIMEOUT',
      message,
      actorId,
      executionId,
    })
  }

  /**
   * Create an invalid input error
   */
  static invalidInput(message: string, details?: unknown): ApifyError {
    return new ApifyError({
      type: 'INVALID_INPUT',
      message,
      details,
    })
  }
}
