/**
 * @file lib/services/enhanced-analysis.ts
 * @description Main entry point for enhanced analysis service
 * @created 2025-07-21
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Refactored for CLAUDE.md compliance (split into modular architecture)
 */

// Re-export main functionality for backward compatibility
export {
  ComprehensiveAnalyzer as EnhancedAnalysisService,
  type ComprehensiveAnalysisResult,
} from './analysis/comprehensive-analyzer'

// Export for direct usage
export { ComprehensiveAnalyzer } from './analysis/comprehensive-analyzer'

// Backward compatibility for lowercase imports
export { ComprehensiveAnalyzer as enhancedAnalysisService } from './analysis/comprehensive-analyzer'

// Health check re-export
export { AnalyzerHealth } from './analysis/comprehensive-analyzer'

// Default export for compatibility with existing imports
export { ComprehensiveAnalyzer as default } from './analysis/comprehensive-analyzer'
