/**
 * @file lib/services/apify/core/rate-limiter.ts
 * @description Rate limiter for managing Apify API requests
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Extracted from client.ts for CLAUDE.md compliance
 */

/**
 * Rate limiter for managing API requests
 */
export class RateLimiter {
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

  getRemainingRequests(actorId: string): number {
    const now = Date.now()
    const hourAgo = now - 60 * 60 * 1000

    const actorRequests = this.requests.get(actorId) || []
    const recentRequests = actorRequests.filter((time) => time > hourAgo)

    const limit = this.limits[actorId] || 50
    return Math.max(0, limit - recentRequests.length)
  }

  getRequestStats(actorId: string): {
    requestsInLastHour: number
    limit: number
    remaining: number
    nextResetTime: number
  } {
    const now = Date.now()
    const hourAgo = now - 60 * 60 * 1000

    const actorRequests = this.requests.get(actorId) || []
    const recentRequests = actorRequests.filter((time) => time > hourAgo)

    const limit = this.limits[actorId] || 50
    const remaining = Math.max(0, limit - recentRequests.length)

    // Next reset is when the oldest request becomes 1 hour old
    const nextResetTime =
      recentRequests.length > 0
        ? Math.min(...recentRequests) + 60 * 60 * 1000
        : now

    return {
      requestsInLastHour: recentRequests.length,
      limit,
      remaining,
      nextResetTime,
    }
  }
}
