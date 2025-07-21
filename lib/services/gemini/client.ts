/**
 * @file lib/services/gemini/client.ts
 * @description Google Gemini AI client with rate limiting and error handling
 * @created 2025-07-21
 * @todo CORE-001-03: Gemini AI client implementation
 */

import {
  GeminiRequest,
  GeminiResponse,
  GeminiError,
  GeminiServiceConfig,
  RateLimitInfo,
} from './types'

// Rate limiting utility
class RateLimiter {
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
      resetTime: this.resetTime,
      tokensUsed: this.tokens,
      tokensRemaining: Math.max(0, this.maxTokensPerMinute - this.tokens),
    }
  }

  getWaitTime(): number {
    if (this.canMakeRequest()) return 0

    const oldestRequest = Math.min(...this.requests)
    const waitTime = oldestRequest + 60000 - Date.now()
    return Math.max(0, waitTime)
  }

  private cleanupOldRequests(): void {
    const cutoff = Date.now() - 60000 // 1 minute ago
    this.requests = this.requests.filter((time) => time > cutoff)
  }
}

/**
 * Google Gemini AI Client with German localization support
 */
export class GeminiClient {
  private baseUrl: string
  private rateLimiter: RateLimiter
  private config: GeminiServiceConfig

  constructor(config: GeminiServiceConfig) {
    this.config = config
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`
    this.rateLimiter = new RateLimiter(config.rateLimitPerMinute)
  }

  /**
   * Generate content using Gemini AI with rate limiting and retries
   */
  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    // Rate limiting check
    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getWaitTime()
      throw this.createGeminiError(
        'Rate-Limit erreicht. Versuchen Sie es in wenigen Minuten erneut.',
        'RATE_LIMIT_EXCEEDED',
        429,
        waitTime
      )
    }

    // Estimate token usage
    const estimatedTokens = this.estimateTokenUsage(request)
    if (!this.rateLimiter.canUseTokens(estimatedTokens)) {
      throw this.createGeminiError(
        'Token-Limit erreicht. Bitte warten Sie bis zur nächsten Stunde.',
        'TOKEN_LIMIT_EXCEEDED',
        429
      )
    }

    let lastError: GeminiError | null = null
    const maxRetries = this.config.maxRetries

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `[GeminiClient] Attempt ${attempt}/${maxRetries} - Sende Anfrage an Gemini...`
        )

        const response = await this.makeRequest(request)

        // Record successful request
        this.rateLimiter.recordRequest(estimatedTokens)

        console.log('[GeminiClient] Gemini-Anfrage erfolgreich abgeschlossen')
        return response
      } catch (error) {
        const geminiError = this.handleError(error as Error, attempt)
        lastError = geminiError

        // If it's a rate limit error, wait and retry
        if (
          geminiError.code === 'RATE_LIMIT_EXCEEDED' &&
          attempt < maxRetries
        ) {
          const waitTime = geminiError.retryAfter || Math.pow(2, attempt) * 1000
          console.log(
            `[GeminiClient] Rate-Limit erreicht, warte ${waitTime}ms vor nächstem Versuch...`
          )
          await this.sleep(waitTime)
          continue
        }

        // If it's a server error, wait with exponential backoff
        if (
          geminiError.status &&
          geminiError.status >= 500 &&
          attempt < maxRetries
        ) {
          const backoffTime = Math.pow(2, attempt) * 1000
          console.log(
            `[GeminiClient] Server-Fehler, warte ${backoffTime}ms vor nächstem Versuch...`
          )
          await this.sleep(backoffTime)
          continue
        }

        // For other errors, don't retry
        throw geminiError
      }
    }

    throw (
      lastError ||
      this.createGeminiError(
        'Alle Versuche fehlgeschlagen',
        'MAX_RETRIES_EXCEEDED'
      )
    )
  }

  /**
   * Make HTTP request to Gemini API
   */
  private async makeRequest(request: GeminiRequest): Promise<GeminiResponse> {
    const requestBody = {
      contents: request.contents,
      generationConfig: {
        temperature:
          request.generationConfig?.temperature ??
          this.config.defaultTemperature,
        maxOutputTokens:
          request.generationConfig?.maxOutputTokens ??
          this.config.defaultMaxTokens,
        candidateCount: 1,
        ...request.generationConfig,
      },
      safetySettings: request.safetySettings ?? this.getDefaultSafetySettings(),
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(
        this.baseUrl + `?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw this.createGeminiError(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          errorData.error?.code || 'HTTP_ERROR',
          response.status
        )
      }

      const result = await response.json()

      // Validate response structure
      if (!result.candidates || !Array.isArray(result.candidates)) {
        throw this.createGeminiError(
          'Ungültige Antwort von Gemini API',
          'INVALID_RESPONSE'
        )
      }

      return result
    } catch (error) {
      clearTimeout(timeoutId)

      if ((error as Error).name === 'AbortError') {
        throw this.createGeminiError(
          'Gemini API Timeout erreicht',
          'TIMEOUT',
          408
        )
      }

      throw error
    }
  }

  /**
   * Extract text from Gemini response
   */
  extractTextFromResponse(response: GeminiResponse): string {
    if (!response.candidates || response.candidates.length === 0) {
      throw this.createGeminiError(
        'Keine Antwort von Gemini erhalten',
        'NO_CANDIDATES'
      )
    }

    const candidate = response.candidates[0]

    // Check if response was blocked
    if (candidate.finishReason === 'SAFETY') {
      throw this.createGeminiError(
        'Antwort durch Sicherheitsfilter blockiert',
        'SAFETY_BLOCKED'
      )
    }

    if (!candidate.content?.parts || candidate.content.parts.length === 0) {
      throw this.createGeminiError(
        'Leere Antwort von Gemini erhalten',
        'EMPTY_RESPONSE'
      )
    }

    return candidate.content.parts[0].text || ''
  }

  /**
   * Parse JSON from Gemini response with error handling
   */
  parseJSONResponse<T = any>(response: GeminiResponse): T {
    const text = this.extractTextFromResponse(response)

    try {
      // Clean up potential markdown formatting
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      return JSON.parse(cleanText)
    } catch (error) {
      console.error('[GeminiClient] JSON Parse Error:', error)
      console.error('[GeminiClient] Raw Response:', text)

      throw this.createGeminiError(
        'Fehler beim Parsen der Gemini-Antwort als JSON',
        'JSON_PARSE_ERROR'
      )
    }
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus(): RateLimitInfo {
    return this.rateLimiter.getStatus()
  }

  /**
   * Check if client can make requests
   */
  canMakeRequest(): boolean {
    return this.rateLimiter.canMakeRequest()
  }

  /**
   * Get wait time before next request
   */
  getWaitTime(): number {
    return this.rateLimiter.getWaitTime()
  }

  /**
   * Default safety settings for content generation
   */
  private getDefaultSafetySettings() {
    if (!this.config.enableSafetyFilters) {
      return [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ]
    }

    return [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ]
  }

  /**
   * Estimate token usage for rate limiting
   */
  private estimateTokenUsage(request: GeminiRequest): number {
    let totalText = ''

    for (const content of request.contents) {
      for (const part of content.parts) {
        totalText += part.text + ' '
      }
    }

    // Rough estimation: ~4 characters per token
    const inputTokens = Math.ceil(totalText.length / 4)
    const maxOutputTokens =
      request.generationConfig?.maxOutputTokens ?? this.config.defaultMaxTokens

    return inputTokens + maxOutputTokens
  }

  /**
   * Create standardized Gemini error
   */
  private createGeminiError(
    message: string,
    code: string,
    status?: number,
    retryAfter?: number
  ): GeminiError {
    const error = new Error(message) as GeminiError
    error.name = 'GeminiError'
    error.type = 'GEMINI_ERROR'
    error.code = code
    error.status = status
    error.retryAfter = retryAfter
    return error
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: Error, attempt: number): GeminiError {
    if (error.name === 'GeminiError') {
      return error as GeminiError
    }

    // Network errors
    if (error.message.includes('fetch')) {
      return this.createGeminiError(
        'Netzwerkfehler beim Verbinden mit Gemini API',
        'NETWORK_ERROR',
        503
      )
    }

    // Generic error
    return this.createGeminiError(
      `Unerwarteter Fehler (Versuch ${attempt}): ${error.message}`,
      'UNKNOWN_ERROR'
    )
  }

  /**
   * Sleep utility for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
