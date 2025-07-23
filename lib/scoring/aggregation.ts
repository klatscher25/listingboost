/**
 * @file lib/scoring/aggregation.ts
 * @description Score aggregation utilities for ListingBoost Pro scoring system
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Split from monolithic scoring/index.ts for CLAUDE.md compliance
 */

import { Database } from '@/types/database'
import { CategoryScore } from './core-calculator'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * Determines performance classification based on ListingBoost Pro score thresholds.
 *
 * Maps numerical scores to performance levels that provide context for hosts about
 * their listing's market position. Thresholds are calibrated based on Airbnb market
 * analysis and competitive benchmarking data.
 *
 * @function getPerformanceLevel
 * @param {number} score - Total listing score (0-1000 scale)
 * @returns {string} Performance level description with market positioning context
 * @complexity O(1) - Simple threshold-based classification with constant-time lookup
 * @dependencies None - Pure function with no external dependencies
 * @usedBy calculateListingScore() for result classification
 * @relatedTo ScoringResult.performanceLevel, market positioning analysis
 * @example
 * ```typescript
 * getPerformanceLevel(950) // 'Elite Performer (Top 1%)'
 * getPerformanceLevel(750) // 'Good Performer (Top 20%)'
 * getPerformanceLevel(450) // 'Poor Performer'
 *
 * // Usage in scoring result
 * const level = getPerformanceLevel(result.totalScore)
 * console.log(`Your listing is a ${level}`)
 * ```
 */
export function getPerformanceLevel(score: number): string {
  if (score >= 900) return 'Elite Performer (Top 1%)'
  if (score >= 800) return 'High Performer (Top 5%)'
  if (score >= 700) return 'Good Performer (Top 20%)'
  if (score >= 600) return 'Average Performer'
  if (score >= 500) return 'Below Average'
  return 'Poor Performer'
}

/**
 * Generates prioritized, actionable recommendations based on category performance analysis.
 *
 * Analyzes category scores and subcategory details to identify the most impactful
 * improvement opportunities. Provides German-language recommendations optimized for
 * the DACH market with specific, actionable guidance.
 *
 * @function generateRecommendations
 * @param {Object} categories - Object containing all CategoryScore results
 * @returns {string[]} Array of German-language recommendations (max 5, prioritized)
 * @complexity O(1) - Fixed number of category checks with constant-time processing
 * @dependencies None - Pure function analyzing provided category scores
 * @usedBy calculateListingScore() for actionable insights generation
 * @relatedTo CategoryScore interface, German localization requirements
 * @algorithm Prioritization based on impact potential and implementation difficulty
 * @localization German language for DACH market focus
 * @example
 * ```typescript
 * const recommendations = generateRecommendations(categoryScores)
 * recommendations.forEach((rec, index) => {
 *   console.log(`${index + 1}. ${rec}`)
 * })
 *
 * // Example output:
 * // 1. Verbessern Sie Ihre Host-Performance durch schnellere Antwortzeiten
 * // 2. Fügen Sie mehr hochwertige Fotos hinzu (mindestens 20)
 * // 3. Optimieren Sie Ihren Listing-Titel und die Beschreibung
 * ```
 */
export function generateRecommendations(categories: {
  hostPerformance: CategoryScore
  guestSatisfaction: CategoryScore
  contentOptimization: CategoryScore
  visualPresentation: CategoryScore
  propertyFeatures: CategoryScore
  pricingStrategy: CategoryScore
  availabilityBooking: CategoryScore
  locationMarket: CategoryScore
  businessPerformance: CategoryScore
  trustSafety: CategoryScore
}): string[] {
  const recommendations: string[] = []

  // Host Performance recommendations
  if (categories.hostPerformance.percentage < 70) {
    recommendations.push(
      'Verbessern Sie Ihre Host-Performance durch schnellere Antwortzeiten'
    )
    if (categories.hostPerformance.subcategories.superhostStatus?.score === 0) {
      recommendations.push('Arbeiten Sie auf den Superhost-Status hin')
    }
  }

  // Guest Satisfaction recommendations
  if (categories.guestSatisfaction.percentage < 80) {
    recommendations.push(
      'Fokussieren Sie sich auf die Verbesserung der Gäste-Zufriedenheit'
    )
    if (categories.guestSatisfaction.subcategories.overallRating?.score < 35) {
      recommendations.push(
        'Verbessern Sie Ihre Gesamtbewertung durch besseren Service'
      )
    }
  }

  // Content Optimization recommendations
  if (categories.contentOptimization.percentage < 70) {
    recommendations.push(
      'Optimieren Sie Ihren Listing-Titel und die Beschreibung'
    )
    if (
      categories.contentOptimization.subcategories.titleOptimization?.score < 20
    ) {
      recommendations.push(
        'Fügen Sie relevante Standort-Keywords in den Titel ein'
      )
    }
  }

  // Visual Presentation recommendations
  if (categories.visualPresentation.percentage < 70) {
    recommendations.push(
      'Fügen Sie mehr hochwertige Fotos hinzu (mindestens 20)'
    )
    if (categories.visualPresentation.subcategories.photoCaptions?.score < 20) {
      recommendations.push('Fügen Sie beschreibende Bildunterschriften hinzu')
    }
  }

  // Pricing Strategy recommendations
  if (categories.pricingStrategy.percentage < 60) {
    recommendations.push(
      'Überprüfen Sie Ihre Preisstrategie im Vergleich zu Mitbewerbern'
    )
  }

  // Limit to top 5 most important recommendations
  return recommendations.slice(0, 5)
}

/**
 * Calculates data completeness percentage based on required listing fields.
 *
 * Evaluates how complete a listing's data is by checking for the presence of
 * essential fields required for comprehensive scoring. Higher completeness
 * correlates with more accurate scoring and better listing performance.
 *
 * @function calculateDataCompleteness
 * @param {ListingData} listing - Listing data object from database
 * @returns {number} Completeness percentage (0-100) based on required field presence
 * @complexity O(n) where n is the number of required fields (currently 14)
 * @dependencies ListingData type definition
 * @usedBy calculateListingScore() for data quality assessment
 * @relatedTo ListingData interface, scoring accuracy, data quality metrics
 * @algorithm Counts non-null, non-undefined, non-empty required fields
 * @example
 * ```typescript
 * const completeness = calculateDataCompleteness(listingData)
 * console.log(`Data completeness: ${completeness}%`)
 *
 * if (completeness < 80) {
 *   console.log('Consider adding missing information for better scoring accuracy')
 * }
 *
 * // Required fields checked:
 * // title, description, overall_rating, reviews_count, host_is_superhost,
 * // host_response_rate, host_response_time, price_per_night, images_count,
 * // amenities, minimum_stay, location, property_type, room_type
 * ```
 */
export function calculateDataCompleteness(listing: ListingData): number {
  const requiredFields = [
    'title',
    'description',
    'overall_rating',
    'reviews_count',
    'host_is_superhost',
    'host_response_rate',
    'host_response_time',
    'price_per_night',
    'images_count',
    'amenities',
    'minimum_stay',
    'location',
    'property_type',
    'room_type',
  ]

  const completedFields = requiredFields.filter((field) => {
    const value = listing[field as keyof ListingData]
    return value !== null && value !== undefined && value !== ''
  })

  return Math.round((completedFields.length / requiredFields.length) * 100)
}
