/**
 * @file lib/services/gemini/analyzer.ts
 * @description AI analysis service entry point - refactored for CLAUDE.md compliance
 * @created 2025-07-21
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Refactored to use modular architecture
 */

// Re-export main functionality for backward compatibility
export { ComprehensiveAnalyzer as GeminiAnalyzer } from './comprehensive-analyzer'

// Re-export all analyzer types
export type {
  AnalysisInputData,
  SentimentAnalysis,
  ReviewSentimentAnalysis,
  DescriptionAnalysis,
  AmenityGapAnalysis,
  PricingRecommendation,
  OptimizationRecommendations,
  GeminiAnalysisResult,
  GeminiServiceConfig,
} from './types'

// Individual analyzer exports for direct usage
export { SentimentAnalyzer } from './analyzers/sentiment-analyzer'
export { DescriptionAnalyzer } from './analyzers/description-analyzer'
export { AmenityGapAnalyzer } from './analyzers/amenity-gap-analyzer'
export { PricingAnalyzer } from './analyzers/pricing-analyzer'
export { OptimizationAnalyzer } from './analyzers/optimization-analyzer'

// Default export for compatibility with existing imports
export { ComprehensiveAnalyzer as default } from './comprehensive-analyzer'
