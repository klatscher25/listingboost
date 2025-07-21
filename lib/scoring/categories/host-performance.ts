/**
 * @file lib/scoring/categories/host-performance.ts
 * @description Host Performance & Trust scoring category (180 points)
 * @created 2025-07-21
 * @todo CORE-001-01: Host performance scoring implementation
 */

import { Database } from '@/types/database'
import { CategoryScore } from '../index'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * 1. Host Performance & Trust (180 Punkte)
 */
export async function calculateHostPerformanceScore(
  listing: ListingData,
  additionalData?: any
): Promise<CategoryScore> {
  const subcategories: CategoryScore['subcategories'] = {}
  let totalScore = 0

  // 1.1 Superhost Status (40 Punkte)
  const superhostScore = listing.host_is_superhost ? 40 : 0
  subcategories.superhostStatus = {
    score: superhostScore,
    maxScore: 40,
    reason: listing.host_is_superhost
      ? 'Aktiver Superhost Status'
      : 'Kein Superhost Status',
  }
  totalScore += superhostScore

  // 1.2 Response Rate (30 Punkte)
  let responseRateScore = 0
  if (listing.host_response_rate) {
    const rate = parseInt(listing.host_response_rate.replace('%', ''))
    if (rate === 100) responseRateScore = 30
    else if (rate >= 90) responseRateScore = 27
    else if (rate >= 80) responseRateScore = 20
    else if (rate >= 70) responseRateScore = 10
    else responseRateScore = 0
  }
  subcategories.responseRate = {
    score: responseRateScore,
    maxScore: 30,
    reason: `Antwortrate: ${listing.host_response_rate || 'nicht verfügbar'}`,
  }
  totalScore += responseRateScore

  // 1.3 Response Time (25 Punkte)
  let responseTimeScore = 0
  if (listing.host_response_time) {
    const time = listing.host_response_time.toLowerCase()
    if (time.includes('hour')) responseTimeScore = 25
    else if (time.includes('few hours')) responseTimeScore = 20
    else if (time.includes('day')) responseTimeScore = 10
    else responseTimeScore = 0
  }
  subcategories.responseTime = {
    score: responseTimeScore,
    maxScore: 25,
    reason: `Antwortzeit: ${listing.host_response_time || 'nicht verfügbar'}`,
  }
  totalScore += responseTimeScore

  // 1.4 Host Verification (20 Punkte) - Simplified implementation
  const verificationScore = listing.host_is_verified ? 20 : 0
  subcategories.hostVerification = {
    score: verificationScore,
    maxScore: 20,
    reason: listing.host_is_verified
      ? 'Host ist verifiziert'
      : 'Host nicht verifiziert',
  }
  totalScore += verificationScore

  // 1.5 Host Experience (25 Punkte)
  let experienceScore = 0
  if (listing.host_time_as_host_years) {
    const years = listing.host_time_as_host_years
    if (years >= 5) experienceScore = 25
    else if (years >= 3) experienceScore = 20
    else if (years >= 2) experienceScore = 15
    else if (years >= 1) experienceScore = 10
    else experienceScore = 5
  }
  subcategories.hostExperience = {
    score: experienceScore,
    maxScore: 25,
    reason: `${listing.host_time_as_host_years || 0} Jahre Erfahrung`,
  }
  totalScore += experienceScore

  // 1.6 Host Rating (20 Punkte)
  let hostRatingScore = 0
  if (listing.host_rating_average) {
    const rating = listing.host_rating_average
    if (rating === 5.0) hostRatingScore = 20
    else if (rating >= 4.8) hostRatingScore = 18
    else if (rating >= 4.5) hostRatingScore = 15
    else if (rating >= 4.0) hostRatingScore = 10
    else if (rating >= 3.5) hostRatingScore = 5
    else hostRatingScore = 0
  }
  subcategories.hostRating = {
    score: hostRatingScore,
    maxScore: 20,
    reason: `Host-Bewertung: ${listing.host_rating_average || 'nicht verfügbar'}`,
  }
  totalScore += hostRatingScore

  // 1.7 Profile Completeness (20 Punkte) - Simplified
  let profileScore = 0
  if (listing.host_profile_image) profileScore += 8
  if (listing.host_about && listing.host_about.length > 100) profileScore += 7
  if (listing.host_highlights) profileScore += 5

  subcategories.profileCompleteness = {
    score: profileScore,
    maxScore: 20,
    reason: `Profil ${Math.round((profileScore / 20) * 100)}% vollständig`,
  }
  totalScore += profileScore

  // 1.8 Multiple Listings Performance (20 Punkte) - Placeholder
  const multipleListingsScore = 10 // Default moderate score
  subcategories.multipleListings = {
    score: multipleListingsScore,
    maxScore: 20,
    reason: 'Mehrere Listings Performance - erweiterte Analyse erforderlich',
  }
  totalScore += multipleListingsScore

  return {
    score: Math.min(totalScore, 180),
    maxScore: 180,
    percentage: Math.round((totalScore / 180) * 100),
    subcategories,
  }
}
