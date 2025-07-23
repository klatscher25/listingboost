/**
 * @file lib/services/gemini/utils/config.ts
 * @description Configuration utilities for Gemini AI service
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Extracted from index.ts for CLAUDE.md compliance
 */

import { env } from '@/lib/config'
import { GeminiServiceConfig } from '../types'

/**
 * Create service configuration for Gemini client
 */
export function createServiceConfig(): GeminiServiceConfig {
  return {
    apiKey: env.GOOGLE_GEMINI_API_KEY,
    model: 'gemini-1.5-flash', // Use Flash model for better performance
    region: 'us', // Default region
    timeout: 30000, // 30 seconds timeout
    maxRetries: 3,
    rateLimitPerMinute: 60, // Conservative limit
    enableSafetyFilters: true, // Enable safety filters
    defaultTemperature: 0.1, // Very deterministic for consistent results
    defaultMaxTokens: 8192,
  }
}

/**
 * Get rate limiting configuration
 */
export function getRateLimitConfig() {
  const config = createServiceConfig()
  return {
    requestsPerMinute: config.rateLimitPerMinute,
    tokensPerMinute: 300000, // Standard Gemini limit
    maxTokensPerRequest: config.defaultMaxTokens,
    backoffMultiplier: 2,
    maxRetries: config.maxRetries,
  }
}

/**
 * Get default generation config for different analysis types
 */
export function getGenerationConfig(
  analysisType:
    | 'sentiment'
    | 'description'
    | 'pricing'
    | 'optimization'
    | 'default' = 'default'
) {
  const serviceConfig = createServiceConfig()
  const baseConfig = {
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  }

  switch (analysisType) {
    case 'sentiment':
      return {
        ...baseConfig,
        temperature: 0.1, // Very consistent for sentiment
        maxOutputTokens: 2048,
      }
    case 'description':
      return {
        ...baseConfig,
        temperature: 0.2, // Slightly more creative for descriptions
        maxOutputTokens: 1536,
      }
    case 'pricing':
      return {
        ...baseConfig,
        temperature: 0.1, // Very analytical for pricing
        maxOutputTokens: 1024,
      }
    case 'optimization':
      return {
        ...baseConfig,
        temperature: 0.3, // More creative for recommendations
        maxOutputTokens: 2048,
      }
    default:
      return {
        ...baseConfig,
        temperature: serviceConfig.defaultTemperature,
        maxOutputTokens: serviceConfig.defaultMaxTokens,
      }
  }
}
