/**
 * @file lib/services/apify/transformer/analysis-transformer.ts
 * @description Analysis data transformation for reviews, availability, competitors
 * @created 2025-07-21
 * @todo CORE-001-02: Analysis data transformation
 */

import {
  AirbnbReviewData,
  AirbnbAvailabilityData,
  AirbnbLocationData,
  ComprehensiveListingData,
} from '../types'

/**
 * Transform reviews data for sentiment analysis
 */
export function transformReviewData(reviews: AirbnbReviewData[]) {
  return reviews.map((review) => ({
    id: review.id,
    text: review.text || review.localizedText,
    rating: review.rating,
    createdAt: review.createdAt,
    language: review.language,
    reviewerId: review.reviewer.id,
    reviewerName: review.reviewer.firstName,
    hasResponse: !!review.response,
  }))
}

/**
 * Transform availability data for occupancy analysis
 */
export function transformAvailabilityData(
  availability: AirbnbAvailabilityData[]
) {
  const totalDays = availability.length
  const availableDays = availability.filter((d) => d.available).length
  const occupancyRate =
    totalDays > 0 ? ((totalDays - availableDays) / totalDays) * 100 : 0

  return {
    totalDays,
    availableDays,
    occupancyRate: Math.round(occupancyRate * 100) / 100,
    availabilityByMonth: groupAvailabilityByMonth(availability),
    pricingVariation: analyzePricingVariation(availability),
  }
}

/**
 * Transform competitor data for market analysis
 */
export function transformCompetitorData(competitors: AirbnbLocationData[]) {
  const competitorAnalysis = competitors.map((comp) => ({
    id: comp.id,
    title: comp.title,
    rating: comp.rating.guestSatisfaction || 0,
    reviewsCount: comp.rating.reviewsCount || 0,
    price: comp.price.amount
      ? parseFloat(comp.price.amount.replace(/[^0-9.]/g, ''))
      : 0,
    isSuperHost: comp.host.isSuperHost,
    propertyType: comp.roomType,
    personCapacity: comp.personCapacity,
  }))

  // Market position analysis
  const ratings = competitorAnalysis.map((c) => c.rating).filter((r) => r > 0)
  const prices = competitorAnalysis.map((c) => c.price).filter((p) => p > 0)

  return {
    competitors: competitorAnalysis,
    marketStats: {
      averageRating:
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0,
      averagePrice:
        prices.length > 0
          ? prices.reduce((a, b) => a + b, 0) / prices.length
          : 0,
      superhostPercentage: Math.round(
        (competitorAnalysis.filter((c) => c.isSuperHost).length /
          competitorAnalysis.length) *
          100
      ),
      totalCompetitors: competitorAnalysis.length,
    },
  }
}

/**
 * Create comprehensive data package for scoring system
 */
export function createScoringDataPackage(
  comprehensiveData: ComprehensiveListingData,
  userId: string,
  transformListingData: (data: unknown, userId: string) => unknown
) {
  const transformedListing = transformListingData(
    comprehensiveData.listing,
    userId
  )
  const reviewAnalysis = transformReviewData(comprehensiveData.reviews)
  const availabilityAnalysis = transformAvailabilityData(
    comprehensiveData.availability
  )
  const competitorAnalysis = transformCompetitorData(
    comprehensiveData.competitors
  )

  return {
    listingData: transformedListing,
    additionalData: {
      reviews: reviewAnalysis,
      availability: comprehensiveData.availability, // Raw data for scoring function
      availabilityAnalysis, // Analysis results
      competitors: competitorAnalysis.competitors, // Array for scoring function
      competitorAnalysis, // Full analysis with market stats
      sentimentAnalysis: null, // To be filled by AI service
      scrapingMetadata: {
        scrapedAt: comprehensiveData.scrapedAt,
        dataCompleteness: comprehensiveData.dataCompleteness,
        processingTime: comprehensiveData.processingTime,
      },
    },
  }
}

/**
 * Helper: Group availability by month
 */
function groupAvailabilityByMonth(availability: AirbnbAvailabilityData[]) {
  const monthGroups: Record<string, { available: number; total: number }> = {}

  availability.forEach((day) => {
    const monthKey = day.date.substring(0, 7) // YYYY-MM
    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = { available: 0, total: 0 }
    }
    monthGroups[monthKey].total++
    if (day.available) {
      monthGroups[monthKey].available++
    }
  })

  return Object.entries(monthGroups).map(([month, data]) => ({
    month,
    availabilityRate: Math.round((data.available / data.total) * 100),
    totalDays: data.total,
    availableDays: data.available,
  }))
}

/**
 * Helper: Analyze pricing variation for dynamic pricing detection
 */
function analyzePricingVariation(availability: AirbnbAvailabilityData[]) {
  const prices = availability
    .filter((day) => day.price && day.price.amount > 0)
    .map((day) => day.price!.amount)

  if (prices.length === 0) {
    return { hasVariation: false, variation: 0, minPrice: 0, maxPrice: 0 }
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const variation = maxPrice > 0 ? ((maxPrice - minPrice) / minPrice) * 100 : 0

  return {
    hasVariation: variation > 5, // 5% variation threshold
    variation: Math.round(variation * 100) / 100,
    minPrice,
    maxPrice,
    averagePrice:
      Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) /
      100,
  }
}
