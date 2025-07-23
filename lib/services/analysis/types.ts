/**
 * @file lib/services/analysis/types.ts
 * @description Type definitions for comprehensive analysis
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Type definitions extracted for CLAUDE.md compliance
 */

import { AnalysisResult as ApifyAnalysisResult } from '../apify'
import { EnhancedAnalysisResult } from '../gemini'

/**
 * Comprehensive analysis result combining Apify scraping data with Gemini AI insights.
 */
export interface ComprehensiveAnalysisResult {
  /** Core listing data and scoring from Apify web scraping service */
  apifyResult: ApifyAnalysisResult

  /** Optional AI insights from Gemini analysis (when AI is enabled and successful) */
  aiResult?: EnhancedAnalysisResult

  /** Enhanced scoring that combines traditional scoring with AI-powered improvements */
  enhancedScoring: {
    /** Original score from Apify analysis (0-1000 scale) */
    originalScore: number
    /** AI-enhanced score with AI bonuses applied (0-1000 scale, capped at 1000) */
    aiEnhancedScore: number
    /** Point bonus added by AI analysis (can be positive or negative) */
    scoreBonus: number
    /** Confidence level in the analysis results (0-100 percentage) */
    confidenceLevel: number
  }

  /** Combined recommendations from both Apify and AI analysis */
  combinedRecommendations: Array<{
    /** Priority level based on potential impact */
    priority: 'critical' | 'high' | 'medium' | 'low'
    /** Category of recommendation */
    category:
      | 'listing'
      | 'pricing'
      | 'photos'
      | 'amenities'
      | 'host'
      | 'reviews'
    /** Specific action to take */
    action: string
    /** Expected impact description */
    impact: string
    /** Source of recommendation */
    source: 'apify' | 'ai' | 'combined'
    /** Confidence in this recommendation (0-100) */
    confidence: number
  }>

  /** Processing information and metadata */
  processingInfo: {
    /** Total processing time in milliseconds */
    totalTime: number
    /** Time spent on Apify scraping in milliseconds */
    scrapingTime: number
    /** Time spent on AI analysis in milliseconds (null if AI disabled) */
    aiAnalysisTime: number | null
    /** Processing timestamp */
    timestamp: string
    /** Whether AI analysis was enabled */
    aiEnabled: boolean
    /** Whether AI analysis was successful */
    aiSuccessful: boolean
    /** Any processing warnings or notes */
    warnings: string[]
  }

  /** Data quality metrics */
  dataQuality: {
    /** Overall data completeness score (0-100) */
    completeness: number
    /** Number of data fields successfully scraped */
    scrapedFields: number
    /** Number of data fields that failed to scrape */
    failedFields: number
    /** Review data quality (0-100, based on review count and recency) */
    reviewQuality: number
    /** AI analysis data quality (0-100, null if AI disabled) */
    aiDataQuality: number | null
  }
}
