/**
 * @file lib/utils/freemium-cache.ts
 * @description In-memory cache utilities for freemium analysis
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from api/freemium/analyze/route.ts for CLAUDE.md compliance
 */

import type { FreemiumAnalysisData } from '@/lib/types/freemium-api-types'

// Simple in-memory cache for demonstration (in production, use Redis)
const cache: {
  [key: string]: { data: FreemiumAnalysisData; expiresAt: number }
} = {}

/**
 * Generate cache key from token and URL
 */
export function getCacheKey(token: string, url: string): string {
  return `${token}:${encodeURIComponent(url)}`
}

/**
 * Get cached data if available and not expired
 */
export function getCachedData(
  token: string,
  url: string
): FreemiumAnalysisData | null {
  const cacheKey = getCacheKey(token, url)
  const cached = cache[cacheKey]

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  return null
}

/**
 * Cache data for 1 hour
 */
export function setCachedData(
  token: string,
  url: string,
  data: FreemiumAnalysisData
): void {
  const cacheKey = getCacheKey(token, url)

  cache[cacheKey] = {
    data,
    expiresAt: Date.now() + 3600 * 1000, // 1 hour
  }
}
