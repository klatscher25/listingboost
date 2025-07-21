/**
 * @file lib/scoring/categories/availability-booking.ts
 * @description Availability & Booking scoring category (80 points)
 * @created 2025-07-21
 * @todo CORE-001-01: Availability & booking scoring implementation
 */

import { Database } from '@/types/database'
import { CategoryScore } from '../index'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * 7. Availability & Booking (80 Punkte)
 */
export async function calculateAvailabilityBookingScore(
  listing: ListingData,
  additionalData?: any
): Promise<CategoryScore> {
  const subcategories: CategoryScore['subcategories'] = {}
  let totalScore = 0

  // 7.1 Occupancy Balance (30 Punkte) - Placeholder
  const occupancyScore = 20 // Default moderate score
  subcategories.occupancyBalance = {
    score: occupancyScore,
    maxScore: 30,
    reason: 'Auslastung - Verfügbarkeitsdaten erforderlich',
  }
  totalScore += occupancyScore

  // 7.2 Instant Book (25 Punkte) - Placeholder
  const instantBookScore = 15 // Default moderate score (assume not instant book)
  subcategories.instantBook = {
    score: instantBookScore,
    maxScore: 25,
    reason: 'Instant Book - Nutzer-Eingabe erforderlich',
  }
  totalScore += instantBookScore

  // 7.3 Booking Window (15 Punkte) - Placeholder
  const bookingWindowScore = 10 // Default moderate score
  subcategories.bookingWindow = {
    score: bookingWindowScore,
    maxScore: 15,
    reason: 'Buchungsfenster - Verfügbarkeitsdaten erforderlich',
  }
  totalScore += bookingWindowScore

  // 7.4 Minimum Stay Flexibility (10 Punkte)
  let minStayScore = 0
  if (listing.minimum_stay) {
    const minStay = listing.minimum_stay
    if (minStay <= 2) minStayScore = 10
    else if (minStay === 3) minStayScore = 7
    else if (minStay <= 6) minStayScore = 3
    else minStayScore = 0
  }
  subcategories.minimumStay = {
    score: minStayScore,
    maxScore: 10,
    reason: `Mindestaufenthalt: ${listing.minimum_stay || 'nicht verfügbar'} Nächte`,
  }
  totalScore += minStayScore

  return {
    score: Math.min(totalScore, 80),
    maxScore: 80,
    percentage: Math.round((totalScore / 80) * 100),
    subcategories,
  }
}
