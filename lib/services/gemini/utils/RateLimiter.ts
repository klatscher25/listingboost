/**
 * @file lib/services/gemini/utils/RateLimiter.ts
 * @description Rate limiting utility for API requests
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-10: Extracted from lib/services/gemini/client.ts for CLAUDE.md compliance
 */

import type { RateLimitInfo } from '../types'

export class RateLimiter {
  private requests: number[] = []
  private tokens: number = 0
  private resetTime: number = Date.now() + 60000 // 1 minute

  constructor(
    private maxRequestsPerMinute: number,
    private maxTokensPerMinute: number = 50000
  ) {}

  canMakeRequest(): boolean {
    this.cleanupOldRequests()
    return this.requests.length < this.maxRequestsPerMinute
  }

  canUseTokens(tokenCount: number): boolean {
    if (Date.now() > this.resetTime) {
      this.tokens = 0
      this.resetTime = Date.now() + 60000
    }
    return this.tokens + tokenCount <= this.maxTokensPerMinute
  }

  recordRequest(tokensUsed: number = 0): void {
    this.cleanupOldRequests()
    this.requests.push(Date.now())
    this.tokens += tokensUsed
  }

  getStatus(): RateLimitInfo {
    this.cleanupOldRequests()
    return {
      requestsRemaining: Math.max(
        0,
        this.maxRequestsPerMinute - this.requests.length
      ),
      tokensUsed: this.tokens,
      tokensRemaining: Math.max(0, this.maxTokensPerMinute - this.tokens),
      resetTime: this.resetTime,
    }
  }

  private cleanupOldRequests(): void {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    this.requests = this.requests.filter((time) => time > oneMinuteAgo)
  }
}
