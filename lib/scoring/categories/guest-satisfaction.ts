/**
 * @file lib/scoring/categories/guest-satisfaction.ts
 * @description Guest Satisfaction & Reviews scoring category (200 points)
 * @created 2025-07-21
 * @todo CORE-001-01: Guest satisfaction scoring implementation
 */

import { Database } from '@/types/database'
import { CategoryScore } from '../index'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * 2. Guest Satisfaction & Reviews (200 Punkte)
 */
export async function calculateGuestSatisfactionScore(
  listing: ListingData,
  additionalData?: any
): Promise<CategoryScore> {
  const subcategories: CategoryScore['subcategories'] = {}
  let totalScore = 0

  // 2.1 Overall Rating (45 Punkte)
  let overallRatingScore = 0
  if (listing.overall_rating) {
    const rating = listing.overall_rating
    if (rating >= 4.9) overallRatingScore = 45
    else if (rating >= 4.8) overallRatingScore = 40
    else if (rating >= 4.6) overallRatingScore = 35
    else if (rating >= 4.4) overallRatingScore = 25
    else if (rating >= 4.0) overallRatingScore = 15
    else if (rating >= 3.5) overallRatingScore = 5
    else overallRatingScore = 0
  }
  subcategories.overallRating = {
    score: overallRatingScore,
    maxScore: 45,
    reason: `Gesamtbewertung: ${listing.overall_rating || 'nicht verfügbar'}`,
  }
  totalScore += overallRatingScore

  // 2.2 Review Count & Velocity (30 Punkte)
  let reviewCountScore = 0
  if (listing.reviews_count) {
    const count = listing.reviews_count
    if (count >= 100) reviewCountScore = 20
    else if (count >= 50) reviewCountScore = 15
    else if (count >= 20) reviewCountScore = 10
    else if (count >= 10) reviewCountScore = 5
    else reviewCountScore = 0
  }

  // Velocity scoring would need additional review data
  const velocityScore = 5 // Default moderate score

  subcategories.reviewCount = {
    score: reviewCountScore + velocityScore,
    maxScore: 30,
    reason: `${listing.reviews_count || 0} Bewertungen`,
  }
  totalScore += reviewCountScore + velocityScore

  // 2.3 Rating Distribution (25 Punkte) - Placeholder
  const distributionScore = 15 // Default moderate score
  subcategories.ratingDistribution = {
    score: distributionScore,
    maxScore: 25,
    reason: 'Bewertungsverteilung - erweiterte Analyse erforderlich',
  }
  totalScore += distributionScore

  // 2.4 Guest Sentiment Analysis (30 Punkte) - Placeholder
  const sentimentScore = 20 // Default moderate score
  subcategories.sentiment = {
    score: sentimentScore,
    maxScore: 30,
    reason: 'Sentiment-Analyse - AI-Integration erforderlich',
  }
  totalScore += sentimentScore

  // 2.5 Response to Reviews (20 Punkte) - Placeholder
  const responseScore = 10 // Default moderate score
  subcategories.reviewResponse = {
    score: responseScore,
    maxScore: 20,
    reason: 'Review-Antworten - erweiterte Analyse erforderlich',
  }
  totalScore += responseScore

  // 2.6 Category Ratings (50 Punkte)
  let categoryRatingScore = 0
  if (listing.rating_accuracy)
    categoryRatingScore += Math.round((listing.rating_accuracy / 5) * 10)
  if (listing.rating_checkin)
    categoryRatingScore += Math.round((listing.rating_checkin / 5) * 10)
  if (listing.rating_cleanliness)
    categoryRatingScore += Math.round((listing.rating_cleanliness / 5) * 10)
  if (listing.rating_communication)
    categoryRatingScore += Math.round((listing.rating_communication / 5) * 10)
  if (listing.rating_location)
    categoryRatingScore += Math.round((listing.rating_location / 5) * 5)
  if (listing.rating_value)
    categoryRatingScore += Math.round((listing.rating_value / 5) * 5)

  subcategories.categoryRatings = {
    score: categoryRatingScore,
    maxScore: 50,
    reason: `Kategorie-Bewertungen: ${Math.round((categoryRatingScore / 50) * 100)}%`,
  }
  totalScore += categoryRatingScore

  return {
    score: Math.min(totalScore, 200),
    maxScore: 200,
    percentage: Math.round((totalScore / 200) * 100),
    subcategories,
  }
}
