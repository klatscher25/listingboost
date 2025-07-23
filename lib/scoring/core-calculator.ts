/**
 * @file lib/scoring/core-calculator.ts
 * @description Core scoring calculator for ListingBoost Pro 1000-point system
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Split from monolithic scoring/index.ts for CLAUDE.md compliance
 */

import { Database } from '@/types/database'
import { logApiError } from '@/lib/utils/logger'
import {
  calculateHostPerformanceScore,
  calculateGuestSatisfactionScore,
  calculateContentOptimizationScore,
  calculateVisualPresentationScore,
  calculatePropertyFeaturesScore,
  calculatePricingStrategyScore,
  calculateAvailabilityBookingScore,
  calculateLocationMarketScore,
  calculateBusinessPerformanceScore,
  calculateTrustSafetyScore,
} from './categories'
import {
  getPerformanceLevel,
  generateRecommendations,
  calculateDataCompleteness,
} from './aggregation'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * Complete scoring result interface for ListingBoost Pro's 1000-point analysis system.
 *
 * Contains comprehensive analysis results including overall score, detailed category breakdowns,
 * performance classification, actionable recommendations, and data quality metrics.
 * Core output of the ListingBoost Pro scoring engine.
 *
 * @interface ScoringResult
 * @usedBy Dashboard results, API responses, premium reports, analytics system
 * @relatedTo CategoryScore (category details), calculateListingScore() (generator)
 * @example
 * ```typescript
 * const result: ScoringResult = await calculateListingScore(listingData)
 * console.log(`Score: ${result.totalScore}/${result.maxScore} (${result.percentage}%)`)
 * console.log(`Level: ${result.performanceLevel}`)
 * result.recommendations.forEach(rec => console.log(`- ${rec}`))
 * ```
 */
export interface ScoringResult {
  /** Total calculated score across all categories (0-1000 scale) */
  totalScore: number
  /** Maximum possible score (always 1000 for ListingBoost Pro) */
  maxScore: number
  /** Score as percentage of maximum (0-100) */
  percentage: number
  /** Performance classification based on score thresholds */
  performanceLevel: string
  /** Detailed breakdown of scores across all 10 analysis categories */
  categoryScores: {
    /** Host performance metrics (response time, superhost status, etc.) */
    hostPerformance: CategoryScore
    /** Guest satisfaction and review analysis */
    guestSatisfaction: CategoryScore
    /** Content optimization (title, description, SEO) */
    contentOptimization: CategoryScore
    /** Visual presentation (photos, captions, virtual tour) */
    visualPresentation: CategoryScore
    /** Property features and amenities analysis */
    propertyFeatures: CategoryScore
    /** Pricing strategy and competitiveness */
    pricingStrategy: CategoryScore
    /** Availability and booking optimization */
    availabilityBooking: CategoryScore
    /** Location and market positioning */
    locationMarket: CategoryScore
    /** Business performance metrics */
    businessPerformance: CategoryScore
    /** Trust and safety indicators */
    trustSafety: CategoryScore
  }
  /** Array of actionable improvement recommendations (max 5) */
  recommendations: string[]
  /** Data completeness percentage (0-100) based on required fields */
  dataCompleteness: number
}

/**
 * Individual category score breakdown within the 1000-point scoring system.
 *
 * Provides detailed scoring information for a specific analysis category,
 * including subcategory breakdowns and reasoning for scoring decisions.
 * Each of the 10 main categories returns this structure.
 *
 * @interface CategoryScore
 * @usedBy ScoringResult (as category details), scoring category functions
 * @relatedTo ScoringResult (parent structure), individual category calculators
 * @example
 * ```typescript
 * const hostScore: CategoryScore = {
 *   score: 85,
 *   maxScore: 100,
 *   percentage: 85,
 *   subcategories: {
 *     responseTime: { score: 25, maxScore: 30, reason: 'Responds within 1 hour' },
 *     superhostStatus: { score: 20, maxScore: 20, reason: 'Active Superhost' }
 *   }
 * }
 * ```
 */
export interface CategoryScore {
  /** Actual score achieved in this category */
  score: number
  /** Maximum possible score for this category */
  maxScore: number
  /** Score as percentage of maximum for this category (0-100) */
  percentage: number
  /** Detailed breakdown of subcategory scores within this category */
  subcategories: {
    /** Dynamic subcategory names with individual scoring details */
    [key: string]: {
      /** Points awarded for this subcategory */
      score: number
      /** Maximum points possible for this subcategory */
      maxScore: number
      /** Explanation of why this score was awarded */
      reason: string
    }
  }
}

/**
 * Calculates the comprehensive 1000-point ListingBoost Pro score for an Airbnb listing.
 *
 * Main orchestrator function that coordinates all 10 category scoring functions to produce
 * a complete analysis result. Implements the ListingBoost Pro scoring methodology as defined
 * in ScoringSystem.md, providing detailed breakdowns and actionable recommendations.
 *
 * @async
 * @function calculateListingScore
 * @param {ListingData} listingData - Complete listing data from database listings table
 * @param {Object} [additionalData] - Optional enriched data for enhanced scoring
 * @param {any[]} [additionalData.reviews] - Review data for sentiment analysis
 * @param {any[]} [additionalData.availability] - Calendar availability data
 * @param {any[]} [additionalData.competitors] - Competitor analysis data
 * @param {any} [additionalData.sentimentAnalysis] - Pre-computed sentiment analysis
 * @param {any} [additionalData.selfReportData] - Host-provided additional data
 * @returns {Promise<ScoringResult>} Complete scoring result with 1000-point breakdown
 * @complexity O(n) where n is the number of scoring categories (currently 10)
 * @dependencies All category scoring functions, logger utility, performance level calculator
 * @usedBy Analysis API endpoints, dashboard score generation, premium reports
 * @relatedTo Category scoring functions, ScoringResult interface, ScoringSystem.md specification
 * @throws {Error} When scoring calculation fails - includes German error message
 * @sideEffects Logs errors for debugging and monitoring purposes
 * @example
 * ```typescript
 * import { calculateListingScore } from '@/lib/scoring/core-calculator'
 *
 * // Basic scoring with listing data only
 * const result = await calculateListingScore(listingData)
 *
 * // Enhanced scoring with additional data
 * const enhancedResult = await calculateListingScore(listingData, {
 *   reviews: reviewsData,
 *   competitors: competitorData,
 *   sentimentAnalysis: sentimentData
 * })
 *
 * console.log(`Score: ${result.totalScore}/1000 (${result.percentage}%)`)
 * console.log(`Performance: ${result.performanceLevel}`)
 * ```
 */
export async function calculateListingScore(
  listingData: ListingData,
  additionalData?: {
    reviews?: any[]
    availability?: any[]
    competitors?: any[]
    sentimentAnalysis?: any
    selfReportData?: any
  }
): Promise<ScoringResult> {
  try {
    // Calculate each category score
    const hostPerformance = await calculateHostPerformanceScore(
      listingData,
      additionalData
    )
    const guestSatisfaction = await calculateGuestSatisfactionScore(
      listingData,
      additionalData
    )
    const contentOptimization = await calculateContentOptimizationScore(
      listingData,
      additionalData
    )
    const visualPresentation = await calculateVisualPresentationScore(
      listingData,
      additionalData
    )
    const propertyFeatures = await calculatePropertyFeaturesScore(
      listingData,
      additionalData
    )
    const pricingStrategy = await calculatePricingStrategyScore(
      listingData,
      additionalData
    )
    const availabilityBooking = await calculateAvailabilityBookingScore(
      listingData,
      additionalData
    )
    const locationMarket = await calculateLocationMarketScore(
      listingData,
      additionalData
    )
    const businessPerformance = await calculateBusinessPerformanceScore(
      listingData,
      additionalData
    )
    const trustSafety = await calculateTrustSafetyScore(
      listingData,
      additionalData
    )

    // Calculate totals
    const totalScore = [
      hostPerformance.score,
      guestSatisfaction.score,
      contentOptimization.score,
      visualPresentation.score,
      propertyFeatures.score,
      pricingStrategy.score,
      availabilityBooking.score,
      locationMarket.score,
      businessPerformance.score,
      trustSafety.score,
    ].reduce((sum, score) => sum + score, 0)

    const maxScore = 1000 // As defined in ScoringSystem.md
    const percentage = Math.round((totalScore / maxScore) * 100)

    // Determine performance level
    const performanceLevel = getPerformanceLevel(totalScore)

    // Generate recommendations
    const recommendations = generateRecommendations({
      hostPerformance,
      guestSatisfaction,
      contentOptimization,
      visualPresentation,
      propertyFeatures,
      pricingStrategy,
      availabilityBooking,
      locationMarket,
      businessPerformance,
      trustSafety,
    })

    // Calculate data completeness
    const dataCompleteness = calculateDataCompleteness(listingData)

    return {
      totalScore,
      maxScore,
      percentage,
      performanceLevel,
      categoryScores: {
        hostPerformance,
        guestSatisfaction,
        contentOptimization,
        visualPresentation,
        propertyFeatures,
        pricingStrategy,
        availabilityBooking,
        locationMarket,
        businessPerformance,
        trustSafety,
      },
      recommendations,
      dataCompleteness,
    }
  } catch (error) {
    logApiError(
      '[calculateListingScore] Error beim Berechnen des Listing-Scores',
      error,
      {
        listingId: listingData.id,
      }
    )
    throw new Error('Fehler beim Berechnen des Listing-Scores')
  }
}

/**
 * Export for use in API routes (backward compatibility)
 */
export default calculateListingScore
