/**
 * @file lib/services/apify/client.ts
 * @description Main Apify client entry point - refactored for CLAUDE.md compliance
 * @created 2025-07-21
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Refactored to use modular architecture
 */

// Re-export main functionality for backward compatibility
export { ApifyClient } from './apify-client'

// Re-export core modules for direct usage
export { RateLimiter } from './core/rate-limiter'
export { ApifyError } from './core/errors'

// Re-export types
export type { ApifyActorResult, ApifyRequestOptions } from './types'

// Singleton instance for backward compatibility
import { ApifyClient } from './apify-client'
export const apifyClient = new ApifyClient()

// Default export for compatibility with existing imports
export { ApifyClient as default } from './apify-client'
