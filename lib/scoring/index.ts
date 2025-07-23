/**
 * @file lib/scoring/index.ts
 * @description Main entry point for ListingBoost Pro 1000-point scoring system
 * @created 2025-07-21
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Refactored for CLAUDE.md compliance (split into modular architecture)
 */

// Re-export main scoring functionality for backward compatibility
export {
  calculateListingScore,
  type ScoringResult,
  type CategoryScore,
} from './core-calculator'

// Re-export aggregation utilities
export {
  getPerformanceLevel,
  generateRecommendations,
  calculateDataCompleteness,
} from './aggregation'

// Default export for compatibility with existing imports
export { default } from './core-calculator'
