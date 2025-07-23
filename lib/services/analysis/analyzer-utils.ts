/**
 * @file lib/services/analysis/analyzer-utils.ts
 * @description Utility functions for comprehensive analysis
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Utility functions extracted for CLAUDE.md compliance
 */

import { AnalysisResult as ApifyAnalysisResult } from '../apify'
import { EnhancedAnalysisResult } from '../gemini'
import type { ComprehensiveAnalysisResult } from './types'

/**
 * Combines recommendations from Apify and AI analysis
 */
export function combineRecommendations(
  apifyResult: ApifyAnalysisResult,
  aiResult?: EnhancedAnalysisResult,
  aiSuccessful = false
): ComprehensiveAnalysisResult['combinedRecommendations'] {
  const recommendations: ComprehensiveAnalysisResult['combinedRecommendations'] =
    []

  // Add Apify-based recommendations
  if (apifyResult.listing?.recommendations) {
    apifyResult.listing.recommendations.forEach((rec: string) => {
      recommendations.push({
        priority: 'medium',
        category: 'listing',
        action: rec,
        impact: 'Moderate improvement expected',
        source: 'apify',
        confidence: 70,
      })
    })
  }

  // Add AI-based recommendations if available
  if (aiResult && aiSuccessful && aiResult.prioritizedActions) {
    aiResult.prioritizedActions.forEach((rec: any) => {
      recommendations.push({
        priority: rec.priority as 'critical' | 'high' | 'medium' | 'low',
        category: rec.category as
          | 'listing'
          | 'pricing'
          | 'photos'
          | 'amenities'
          | 'host'
          | 'reviews',
        action: rec.action || 'AI optimization recommended',
        impact: `${rec.estimatedImpact} points improvement expected`,
        source: 'ai',
        confidence: Math.min(95, rec.estimatedImpact || 60),
      })
    })
  }

  // Sort by priority and confidence
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
  return recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    return priorityDiff !== 0 ? priorityDiff : b.confidence - a.confidence
  })
}

/**
 * Calculates data quality metrics
 */
export function calculateDataQuality(
  apifyResult: ApifyAnalysisResult,
  aiResult?: EnhancedAnalysisResult,
  aiSuccessful = false
): ComprehensiveAnalysisResult['dataQuality'] {
  const listing = apifyResult.listing
  const totalFields = 15 // Expected number of key fields

  let scrapedFields = 0
  let failedFields = 0

  // Count successfully scraped fields
  const fields = [
    listing.title,
    listing.description,
    listing.rating?.guestSatisfaction,
    listing.host?.name,
    listing.price?.amount,
    listing.amenities,
    listing.images,
  ]

  fields.forEach((field) => {
    if (field !== null && field !== undefined && field !== '') {
      scrapedFields++
    } else {
      failedFields++
    }
  })

  const completeness = Math.round((scrapedFields / totalFields) * 100)
  const reviewQuality = Math.min(
    100,
    (listing.reviews?.length || 0) * 5 +
      (listing.rating?.guestSatisfaction || 0) * 10
  )

  const aiDataQuality = aiSuccessful
    ? aiResult?.aiAnalysis?.analysisMetadata?.confidenceScore || 0
    : null

  return {
    completeness,
    scrapedFields,
    failedFields,
    reviewQuality,
    aiDataQuality,
  }
}
