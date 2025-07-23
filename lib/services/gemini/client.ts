/**
 * @file lib/services/gemini/client.ts
 * @description Google Gemini AI client with rate limiting and error handling - refactored for CLAUDE.md compliance
 * @created 2025-07-21
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-10: Refactored using modular architecture
 */

import {
  GeminiRequest,
  GeminiResponse,
  GeminiError,
  GeminiServiceConfig,
  RateLimitInfo,
} from './types'
import { RateLimiter } from './utils/RateLimiter'
import { GeminiErrorHandler } from './utils/ErrorHandler'

export class GeminiClient {
  private rateLimiter: RateLimiter
  private config: GeminiServiceConfig

  constructor(config: GeminiServiceConfig) {
    this.config = config
    this.rateLimiter = new RateLimiter(
      config.rateLimitPerMinute || 60,
      50000 // Default max tokens per minute
    )
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(
    prompt: string,
    options: {
      temperature?: number
      maxOutputTokens?: number
      topP?: number
      topK?: number
    } = {}
  ): Promise<any> {
    const request: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? this.config.defaultTemperature,
        maxOutputTokens:
          options.maxOutputTokens ?? this.config.defaultMaxTokens,
        topP: options.topP ?? 0.8,
        topK: options.topK ?? 40,
      },
    }

    return this.makeRequest(request)
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequest(
    request: GeminiRequest,
    attempt: number = 1
  ): Promise<any> {
    // Check rate limits
    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.calculateWaitTime()
      await GeminiErrorHandler.sleep(waitTime)
    }

    try {
      const response = await this.callGeminiAPI(request)
      this.rateLimiter.recordRequest()
      return this.extractTextFromResponse(response)
    } catch (error) {
      if (attempt < (this.config.maxRetries || 3)) {
        const delay = Math.pow(2, attempt - 1) * 1000 // Exponential backoff
        await GeminiErrorHandler.sleep(delay)
        return this.makeRequest(request, attempt + 1)
      }
      throw GeminiErrorHandler.handleError(error as Error, attempt)
    }
  }

  /**
   * Call Gemini API
   */
  private async callGeminiAPI(request: GeminiRequest): Promise<GeminiResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, this.config.timeout || 30000)

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw GeminiErrorHandler.createGeminiError(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          errorData.error?.code || 'HTTP_ERROR',
          response.status
        )
      }

      const result = await response.json()

      // Validate response structure
      if (!result.candidates || !Array.isArray(result.candidates)) {
        throw GeminiErrorHandler.createGeminiError(
          'Ungültige Antwort von Gemini API',
          'INVALID_RESPONSE'
        )
      }

      return result
    } catch (error) {
      clearTimeout(timeoutId)

      if ((error as Error).name === 'AbortError') {
        throw GeminiErrorHandler.createGeminiError(
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
  private extractTextFromResponse(response: GeminiResponse): string {
    try {
      const candidate = response.candidates?.[0]
      if (!candidate?.content?.parts) {
        throw GeminiErrorHandler.createGeminiError(
          'Keine gültige Antwort in Gemini Response gefunden',
          'NO_CONTENT'
        )
      }

      const text = candidate.content.parts
        .map((part) => part.text)
        .filter(Boolean)
        .join('')

      if (!text.trim()) {
        throw GeminiErrorHandler.createGeminiError(
          'Leere Antwort von Gemini API erhalten',
          'EMPTY_RESPONSE'
        )
      }

      return text.trim()
    } catch (error) {
      if (error instanceof Error && error.name === 'GeminiError') {
        throw error
      }
      throw GeminiErrorHandler.createGeminiError(
        `Fehler beim Extrahieren der Antwort: ${(error as Error).message}`,
        'EXTRACTION_ERROR'
      )
    }
  }

  /**
   * Get rate limiting status
   */
  getRateLimitStatus(): RateLimitInfo {
    return this.rateLimiter.getStatus()
  }

  /**
   * Calculate wait time for rate limiting
   */
  private calculateWaitTime(): number {
    const status = this.rateLimiter.getStatus()
    return Math.max(0, status.resetTime - Date.now())
  }
}
