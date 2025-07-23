/**
 * @file lib/services/analysis/comprehensive-analyzer.ts
 * @description Main comprehensive analysis orchestrator - modular entry point
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Refactored into modular architecture for CLAUDE.md compliance
 */

// Re-export core functionality
export { AnalyzerCore as ComprehensiveAnalyzer } from './analyzer-core'
export { AnalyzerHealth } from './analyzer-health'
export type { ComprehensiveAnalysisResult } from './types'

// Re-export utilities for internal use
export { combineRecommendations, calculateDataQuality } from './analyzer-utils'

// Default export for backward compatibility
export { AnalyzerCore as default } from './analyzer-core'
