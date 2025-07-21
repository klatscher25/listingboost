/**
 * @file lib/scoring/categories/location-market.ts
 * @description Location & Market Position scoring category (60 points)
 * @created 2025-07-21
 * @todo CORE-001-01: Location & market scoring implementation
 */

import { Database } from '@/types/database'
import { CategoryScore } from '../index'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * 8. Location & Market Position (60 Punkte)
 */
export async function calculateLocationMarketScore(
  listing: ListingData,
  additionalData?: any
): Promise<CategoryScore> {
  const subcategories: CategoryScore['subcategories'] = {}
  let totalScore = 0

  // 8.1 Location Rating (20 Punkte)
  let locationRatingScore = 0
  if (listing.rating_location) {
    const rating = listing.rating_location
    if (rating === 5.0) locationRatingScore = 20
    else if (rating >= 4.8) locationRatingScore = 18
    else if (rating >= 4.5) locationRatingScore = 15
    else if (rating >= 4.0) locationRatingScore = 10
    else locationRatingScore = 0
  }
  subcategories.locationRating = {
    score: locationRatingScore,
    maxScore: 20,
    reason: `Standort-Bewertung: ${listing.rating_location || 'nicht verfügbar'}`,
  }
  totalScore += locationRatingScore

  // 8.2 Transit Accessibility (20 Punkte) - Placeholder
  const transitScore = 15 // Default good score
  subcategories.transitAccessibility = {
    score: transitScore,
    maxScore: 20,
    reason: 'ÖPNV-Anbindung - Standortanalyse erforderlich',
  }
  totalScore += transitScore

  // 8.3 Market Position (20 Punkte) - Placeholder
  const marketScore = 15 // Default good score
  subcategories.marketPosition = {
    score: marketScore,
    maxScore: 20,
    reason: 'Marktposition - Wettbewerbsanalyse erforderlich',
  }
  totalScore += marketScore

  return {
    score: Math.min(totalScore, 60),
    maxScore: 60,
    percentage: Math.round((totalScore / 60) * 100),
    subcategories,
  }
}
