/**
 * @file lib/scoring/index.ts
 * @description 1000-point scoring system for ListingBoost Pro listings
 * @created 2025-07-21
 * @todo CORE-001-01: Scoring System Implementation
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

type ListingData = Database['public']['Tables']['listings']['Row']

export interface ScoringResult {
  totalScore: number
  maxScore: number
  percentage: number
  performanceLevel: string
  categoryScores: {
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
  }
  recommendations: string[]
  dataCompleteness: number
}

export interface CategoryScore {
  score: number
  maxScore: number
  percentage: number
  subcategories: {
    [key: string]: {
      score: number
      maxScore: number
      reason: string
    }
  }
}

/**
 * Main scoring function that calculates the complete 1000-point score for a listing
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
 * Determines performance level based on total score
 */
function getPerformanceLevel(score: number): string {
  if (score >= 900) return 'Elite Performer (Top 1%)'
  if (score >= 800) return 'High Performer (Top 5%)'
  if (score >= 700) return 'Good Performer (Top 20%)'
  if (score >= 600) return 'Average Performer'
  if (score >= 500) return 'Below Average'
  return 'Poor Performer'
}

/**
 * Generates actionable recommendations based on category scores
 */
function generateRecommendations(categories: any): string[] {
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
 * Calculates data completeness percentage
 */
function calculateDataCompleteness(listing: ListingData): number {
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

/**
 * Export for use in API routes
 */
export default calculateListingScore
