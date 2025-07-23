/**
 * @file lib/services/gemini/utils/scoring-calculator.ts
 * @description Scoring calculation utilities for Gemini AI service
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Extracted from index.ts for CLAUDE.md compliance
 */

import { GeminiAnalysisResult } from '../types'

/**
 * Calculate scoring enhancements based on AI analysis
 */
export function calculateScoringEnhancements(analysis: GeminiAnalysisResult) {
  // Sentiment bonus: up to 50 points for excellent sentiment
  const sentimentBonus = calculateSentimentBonus(analysis.sentimentAnalysis)

  // Description bonus: up to 30 points for high-quality description
  const descriptionBonus = Math.round(
    (analysis.descriptionAnalysis.qualityScore / 100) * 30
  )

  // AI optimization potential: sum of all recommended improvements
  const aiOptimizationPotential = analysis.optimizationRecommendations.reduce(
    (sum, rec) => sum + rec.estimatedScoreImprovement,
    0
  )

  // Confidence adjustment based on data quality
  const avgDataQuality =
    (analysis.analysisMetadata.dataQuality.reviewsQuality +
      analysis.analysisMetadata.dataQuality.competitorDataQuality +
      analysis.analysisMetadata.dataQuality.listingDataCompleteness) /
    3
  const confidenceAdjustment = Math.round((avgDataQuality / 100) * 20)

  return {
    sentimentBonus,
    descriptionBonus,
    aiOptimizationPotential,
    confidenceAdjustment,
  }
}

/**
 * Calculate sentiment bonus for scoring system
 */
export function calculateSentimentBonus(sentimentAnalysis: any) {
  const sentiment = sentimentAnalysis.aggregatedSentiment
  const positiveWeight = sentiment.positiveScore * sentiment.confidence
  return Math.round(positiveWeight * 50) // Max 50 bonus points
}

/**
 * Estimate API cost based on tokens used
 */
export function estimateApiCost(tokensUsed: number): number {
  // Gemini pricing: approximately €0.0015 per 1000 tokens for Gemini 1.5 Flash
  // More conservative estimate to account for variations
  const costPer1000Tokens = 0.002 // €2 per million tokens
  return Math.round((tokensUsed / 1000) * costPer1000Tokens * 100) / 100 // Round to 2 decimal places
}
