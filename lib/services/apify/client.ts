/**
 * @file lib/services/apify/client.ts
 * @description Apify API client with rate limiting and error handling
 * @created 2025-07-21
 * @todo CORE-001-02: Apify Scraper Integration Pipeline
 */

import { config } from '@/lib/config'
import { ApifyActorResult, ApifyRequestOptions } from './types'

/**
 * Rate limiter for managing API requests
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private limits: Record<string, number> // requests per hour
  ) {}

  canMakeRequest(actorId: string): boolean {
    const now = Date.now()
    const hourAgo = now - 60 * 60 * 1000

    if (!this.requests.has(actorId)) {
      this.requests.set(actorId, [])
    }

    const actorRequests = this.requests.get(actorId)!

    // Clean old requests
    const recentRequests = actorRequests.filter((time) => time > hourAgo)
    this.requests.set(actorId, recentRequests)

    const limit = this.limits[actorId] || 50 // Default limit
    return recentRequests.length < limit
  }

  recordRequest(actorId: string): void {
    const now = Date.now()
    if (!this.requests.has(actorId)) {
      this.requests.set(actorId, [])
    }
    this.requests.get(actorId)!.push(now)
  }

  getWaitTime(actorId: string): number {
    if (this.canMakeRequest(actorId)) return 0

    const actorRequests = this.requests.get(actorId) || []
    if (actorRequests.length === 0) return 0

    const oldestRequest = Math.min(...actorRequests)
    const hourFromOldest = oldestRequest + 60 * 60 * 1000

    return Math.max(0, hourFromOldest - Date.now())
  }
}

/**
 * Apify API client with comprehensive error handling and rate limiting
 */
export class ApifyClient {
  private readonly apiToken: string
  private readonly baseUrl = 'https://api.apify.com/v2'
  private rateLimiter: RateLimiter

  /**
   * Convert actor display name (tri_angle/actor-name) to API format (tri_angle~actor-name)
   */
  private toApiFormat(actorId: string): string {
    return actorId.replace('/', '~')
  }

  constructor() {
    this.apiToken = config.APIFY_API_TOKEN

    // Initialize rate limiter with actor-specific limits
    this.rateLimiter = new RateLimiter({
      [config.APIFY_ACTOR_URL_SCRAPER]: 50, // URL scraper: 50/hour
      [config.APIFY_ACTOR_REVIEW_SCRAPER]: 100, // Review scraper: 100/hour
      [config.APIFY_ACTOR_AVAILABILITY_SCRAPER]: 75, // Availability scraper: 75/hour
      [config.APIFY_ACTOR_LOCATION_SCRAPER]: 25, // Location scraper: 25/hour
    })
  }

  /**
   * Run an Apify actor with input data and options
   */
  async runActor<T = unknown>(
    actorId: string,
    input: Record<string, unknown>,
    options: ApifyRequestOptions = {}
  ): Promise<ApifyActorResult<T>> {
    const {
      timeout = 60, // 60 seconds default
      memory = 1024, // 1GB default
      retries = 3,
      priority = 0,
      webhookUrl,
    } = options

    // Check rate limit
    if (!this.rateLimiter.canMakeRequest(actorId)) {
      const waitTime = this.rateLimiter.getWaitTime(actorId)
      throw new ApifyError({
        type: 'RATE_LIMIT',
        message: `Rate limit erreicht für Actor ${actorId}`,
        details: { waitTime, waitMinutes: Math.ceil(waitTime / 60000) },
        actorId,
        retryAfter: waitTime,
      })
    }

    let lastError: ApifyError | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Record the request for rate limiting
        this.rateLimiter.recordRequest(actorId)

        console.log(
          `[Apify] Starte Actor ${actorId} (Versuch ${attempt}/${retries})`
        )

        // Convert to API format and start the actor run
        const apiActorId = this.toApiFormat(actorId)
        console.log(`[Apify] API Actor ID: ${apiActorId}`)

        const runResponse = await this.makeRequest<{
          id: string
          data?: { id: string }
        }>('POST', `/acts/${apiActorId}/runs`, {
          input,
          options: {
            memoryMbytes: memory,
            timeoutSecs: timeout,
          },
          webhooks: webhookUrl
            ? [
                {
                  eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
                  requestUrl: webhookUrl,
                },
              ]
            : undefined,
        })

        console.log(
          `[Apify] Raw response:`,
          JSON.stringify(runResponse, null, 2)
        )

        // Handle different response formats from Apify API
        const runId = runResponse.id || runResponse.data?.id
        console.log(`[Apify] Actor-Run gestartet: ${runId}`)

        if (!runId) {
          throw new ApifyError({
            type: 'ACTOR_FAILED',
            message: 'Actor run ID nicht erhalten von Apify API',
            details: runResponse,
            actorId,
          })
        }

        // Wait for completion
        const result = await this.waitForRun<T>(runId, timeout * 1000)

        if (result.status === 'SUCCEEDED') {
          console.log(`[Apify] Actor ${actorId} erfolgreich abgeschlossen`)
          return result
        } else {
          throw new ApifyError({
            type: 'ACTOR_FAILED',
            message: `Actor-Run fehlgeschlagen: ${result.statusMessage || 'Unbekannter Fehler'}`,
            details: result,
            actorId,
            executionId: runId,
          })
        }
      } catch (error) {
        console.error(
          `[Apify] Actor-Run Versuch ${attempt} fehlgeschlagen:`,
          error
        )

        if (error instanceof ApifyError) {
          lastError = error
        } else {
          lastError = new ApifyError({
            type: 'NETWORK_ERROR',
            message: `Netzwerk-Fehler beim Actor-Run: ${(error as Error).message}`,
            details: error,
            actorId,
          })
        }

        // Don't retry on rate limit or invalid input errors
        if (
          lastError.type === 'RATE_LIMIT' ||
          lastError.type === 'INVALID_INPUT'
        ) {
          throw lastError
        }

        // Wait before retry with exponential backoff
        if (attempt < retries) {
          const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // Max 10s
          console.log(`[Apify] Warten ${backoffTime}ms vor nächstem Versuch...`)
          await this.delay(backoffTime)
        }
      }
    }

    // All retries failed
    throw (
      lastError ||
      new ApifyError({
        type: 'ACTOR_FAILED',
        message: `Actor ${actorId} fehlgeschlagen nach ${retries} Versuchen`,
        actorId,
      })
    )
  }

  /**
   * Wait for actor run completion
   */
  private async waitForRun<T>(
    runId: string,
    timeoutMs: number
  ): Promise<ApifyActorResult<T>> {
    const startTime = Date.now()
    const pollInterval = 2000 // 2 seconds

    while (Date.now() - startTime < timeoutMs) {
      try {
        const run = await this.makeRequest<any>('GET', `/actor-runs/${runId}`)

        if (run.status === 'SUCCEEDED') {
          // Get the dataset items
          const datasetId = run.defaultDatasetId
          const data = await this.getDatasetItems<T>(datasetId)

          return {
            data,
            executionId: runId,
            status: 'SUCCEEDED',
            statusMessage: run.statusMessage,
          }
        } else if (
          run.status === 'FAILED' ||
          run.status === 'ABORTED' ||
          run.status === 'TIMED-OUT'
        ) {
          return {
            data: [],
            executionId: runId,
            status: run.status,
            statusMessage: run.statusMessage,
            error: {
              type: run.status,
              message: run.statusMessage || 'Actor-Run fehlgeschlagen',
            },
          }
        }

        // Still running, wait and poll again
        await this.delay(pollInterval)
      } catch (error) {
        console.error('[Apify] Fehler beim Prüfen des Run-Status:', error)
        await this.delay(pollInterval)
      }
    }

    // Timeout reached
    throw new ApifyError({
      type: 'TIMEOUT',
      message: `Actor-Run ${runId} Timeout nach ${timeoutMs}ms erreicht`,
      executionId: runId,
    })
  }

  /**
   * Get dataset items from completed run
   */
  private async getDatasetItems<T>(datasetId: string): Promise<T[]> {
    try {
      const response = await this.makeRequest<{ items: T[] }>(
        'GET',
        `/datasets/${datasetId}/items`
      )
      return response.items || (response as unknown as T[])
    } catch (error) {
      console.error('[Apify] Fehler beim Laden der Dataset-Items:', error)
      return []
    }
  }

  /**
   * Make HTTP request to Apify API
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    }

    if (body && method === 'POST') {
      requestOptions.body = JSON.stringify(body)
    }

    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // Ignore JSON parse errors
      }

      throw new ApifyError({
        type: response.status === 429 ? 'RATE_LIMIT' : 'NETWORK_ERROR',
        message: `Apify API Fehler: ${errorMessage}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
        },
      })
    }

    return response.json() as Promise<T>
  }

  /**
   * Utility method to add delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Check if rate limit allows request
   */
  canMakeRequest(actorId: string): boolean {
    return this.rateLimiter.canMakeRequest(actorId)
  }

  /**
   * Get wait time until next request is allowed
   */
  getWaitTime(actorId: string): number {
    return this.rateLimiter.getWaitTime(actorId)
  }
}

/**
 * Custom error class for Apify operations
 */
class ApifyError extends Error {
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
}

/**
 * Singleton Apify client instance
 */
export const apifyClient = new ApifyClient()

/**
 * Export ApifyError class for use in other modules
 */
export { ApifyError }
