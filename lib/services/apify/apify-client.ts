/**
 * @file lib/services/apify/apify-client.ts
 * @description Main Apify API client - refactored for CLAUDE.md compliance
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Refactored from client.ts using modular architecture
 */

import { config } from '@/lib/config'
import { RateLimiter } from './core/rate-limiter'
import { ApifyError } from './core/errors'
import { ApifyActorResult, ApifyRequestOptions } from './types'

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
   * Run an Apify actor synchronously and get dataset items directly
   * Uses the /run-sync-get-dataset-items endpoint to avoid polling
   */
  async runActorSync<T = unknown>(
    actorId: string,
    input: Record<string, unknown>,
    options: ApifyRequestOptions = {}
  ): Promise<ApifyActorResult<T>> {
    const {
      timeout = 60, // 60 seconds default
      memory = 2048, // 2GB default
    } = options

    console.log(`[Apify] Running actor ${actorId} synchronously`)
    console.log(`[Apify] Input:`, JSON.stringify(input, null, 2))
    console.log(`[Apify] Options: timeout=${timeout}s, memory=${memory}MB`)

    // Check rate limits
    if (!this.rateLimiter.canMakeRequest(actorId)) {
      const waitTime = this.rateLimiter.getWaitTime(actorId)
      throw ApifyError.rateLimit(
        `Rate limit exceeded for actor ${actorId}. Wait ${Math.ceil(waitTime / 1000)}s`,
        waitTime,
        actorId
      )
    }

    // Convert to API format
    const apiActorId = this.toApiFormat(actorId)
    const endpoint = `/acts/${apiActorId}/run-sync-get-dataset-items`

    try {
      console.log(`[Apify] Calling synchronous endpoint: POST ${endpoint}`)

      // Record the request for rate limiting
      this.rateLimiter.recordRequest(actorId)

      const data = await this.makeRequest<T[]>('POST', endpoint, {
        ...input,
        // Add Actor options as query parameters via body
        options: {
          memoryMbytes: memory,
          timeoutSecs: timeout,
        },
      })

      console.log(`[Apify] ✅ Synchronous call successful!`, {
        itemCount: data?.length || 0,
        firstItemKeys: data?.[0] ? Object.keys(data[0]).slice(0, 5) : [],
      })

      return {
        data: data || [],
        executionId: 'sync-' + Date.now(),
        status: 'SUCCEEDED',
        statusMessage: 'Completed synchronously',
      }
    } catch (error) {
      console.error(`[Apify] Synchronous call failed:`, error)
      throw ApifyError.actorFailed(
        `Synchronous actor call failed: ${(error as Error)?.message}`,
        actorId
      )
    }
  }

  /**
   * Run an Apify actor with input data and options (LEGACY - with polling)
   */
  async runActor<T = unknown>(
    actorId: string,
    input: Record<string, unknown>,
    options: ApifyRequestOptions = {}
  ): Promise<ApifyActorResult<T>> {
    const {
      timeout = 60, // 60 seconds default
      memory = 2048, // 2GB default
    } = options

    console.log(`[Apify] Running actor: ${actorId}`)
    console.log(`[Apify] Input:`, JSON.stringify(input, null, 2))

    // Check rate limits
    if (!this.rateLimiter.canMakeRequest(actorId)) {
      const waitTime = this.rateLimiter.getWaitTime(actorId)
      throw ApifyError.rateLimit(
        `Rate limit exceeded for actor ${actorId}. Wait ${Math.ceil(waitTime / 1000)}s`,
        waitTime,
        actorId
      )
    }

    // Convert to API format
    const apiActorId = this.toApiFormat(actorId)

    try {
      // Record the request for rate limiting
      this.rateLimiter.recordRequest(actorId)

      // Start the actor run
      const runResponse = await this.makeRequest<{ data: { id: string } }>(
        'POST',
        `/acts/${apiActorId}/runs`,
        {
          ...input,
          options: {
            memoryMbytes: memory,
            timeoutSecs: timeout,
          },
        }
      )

      const runId = runResponse.data.id
      console.log(`[Apify] Actor run started: ${runId}`)

      // Wait for completion (with timeout)
      const timeoutMs = (timeout + 30) * 1000 // Add 30s buffer
      return await this.waitForRun<T>(runId, timeoutMs)
    } catch (error) {
      console.error(`[Apify] Actor run failed:`, error)
      throw ApifyError.actorFailed(
        `Actor run failed: ${(error as Error)?.message}`,
        actorId
      )
    }
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

    console.log(`[Apify] Waiting for actor run completion: ${runId}`)

    while (Date.now() - startTime < timeoutMs) {
      try {
        const run = await this.makeRequest<any>('GET', `/actor-runs/${runId}`)

        if (run.status === 'SUCCEEDED') {
          console.log(`[Apify] ✅ Actor completed successfully`)

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
          console.log(`[Apify] ❌ Actor failed with status: ${run.status}`)

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
        console.error(
          `[Apify] Error during polling:`,
          (error as Error)?.message
        )
        await this.delay(pollInterval)
      }
    }

    // Timeout reached
    console.log(`[Apify] ❌ Timeout reached after ${timeoutMs}ms`)
    throw ApifyError.timeout(
      `Actor-Run ${runId} Timeout nach ${timeoutMs}ms erreicht`,
      undefined,
      runId
    )
  }

  /**
   * Get dataset items from completed run
   */
  private async getDatasetItems<T>(datasetId: string): Promise<T[]> {
    try {
      console.log(`[Apify] Getting dataset items: ${datasetId}`)

      const response = await this.makeRequest<{ items: T[] }>(
        'GET',
        `/datasets/${datasetId}/items`
      )

      const items = response.items || (response as unknown as T[])
      console.log(`[Apify] Retrieved ${items?.length || 0} items`)

      return items
    } catch (error) {
      console.error(
        '[Apify] Error loading dataset items:',
        (error as Error)?.message
      )
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
    }

    if (body) {
      headers['Content-Type'] = 'application/json'
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const retryMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000

          throw ApifyError.rateLimit(
            `Rate limit exceeded: ${response.statusText}`,
            retryMs
          )
        }

        throw ApifyError.networkError(
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, statusText: response.statusText }
        )
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApifyError) {
        throw error
      }

      console.error('[Apify] Request failed:', (error as Error)?.message)
      throw ApifyError.networkError(
        `Request failed: ${(error as Error)?.message}`,
        error
      )
    }
  }

  /**
   * Helper method to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Check if client can make request for specific actor
   */
  canMakeRequest(actorId: string): boolean {
    return this.rateLimiter.canMakeRequest(actorId)
  }

  /**
   * Get wait time before next request can be made
   */
  getWaitTime(actorId: string): number {
    return this.rateLimiter.getWaitTime(actorId)
  }

  /**
   * Get rate limit statistics for an actor
   */
  getRateLimitStats(actorId: string) {
    return this.rateLimiter.getRequestStats(actorId)
  }
}
