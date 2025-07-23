/**
 * @file lib/services/gemini/utils/ErrorHandler.ts
 * @description Error handling utilities for Gemini client
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-10: Extracted from lib/services/gemini/client.ts for CLAUDE.md compliance
 */

import type { GeminiError } from '../types'

export class GeminiErrorHandler {
  static createGeminiError(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    status?: number
  ): GeminiError {
    const error = new Error(message) as GeminiError
    error.name = 'GeminiError'
    error.code = code
    error.status = status
    error.type = 'GEMINI_ERROR'
    return error
  }

  static handleError(error: Error, attempt: number): GeminiError {
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

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
