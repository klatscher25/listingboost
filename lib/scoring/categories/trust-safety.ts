/**
 * @file lib/scoring/categories/trust-safety.ts
 * @description Trust & Safety scoring category (40 points)
 * @created 2025-07-21
 * @todo CORE-001-01: Trust & safety scoring implementation
 */

import { Database } from '@/types/database'
import { CategoryScore } from '../index'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * 10. Trust & Safety (40 Punkte)
 */
export async function calculateTrustSafetyScore(
  listing: ListingData,
  additionalData?: any
): Promise<CategoryScore> {
  const subcategories: CategoryScore['subcategories'] = {}
  let totalScore = 0

  // 10.1 Safety Features (20 Punkte)
  let safetyScore = 0
  if (listing.smoke_alarm_available) safetyScore += 8
  if (listing.carbon_monoxide_alarm_available) safetyScore += 6
  if (listing.first_aid_kit_available) safetyScore += 6

  subcategories.safetyFeatures = {
    score: safetyScore,
    maxScore: 20,
    reason: `${Math.round((safetyScore / 20) * 100)}% der Sicherheitsfeatures vorhanden`,
  }
  totalScore += safetyScore

  // 10.2 Verification Requirements (10 Punkte) - Placeholder
  const verificationScore = 7 // Default good score
  subcategories.verificationRequirements = {
    score: verificationScore,
    maxScore: 10,
    reason: 'Verifizierungs-Anforderungen - Hausregeln-Analyse erforderlich',
  }
  totalScore += verificationScore

  // 10.3 Professional Indicators (10 Punkte) - Placeholder
  let professionalScore = 0
  if (
    listing.description?.toLowerCase().includes('license') ||
    listing.description?.toLowerCase().includes('lizenz') ||
    listing.description?.toLowerCase().includes('gewerblich')
  ) {
    professionalScore = 10
  }

  subcategories.professionalIndicators = {
    score: professionalScore,
    maxScore: 10,
    reason:
      professionalScore > 0
        ? 'Professionelle Indikatoren gefunden'
        : 'Keine professionellen Indikatoren',
  }
  totalScore += professionalScore

  return {
    score: Math.min(totalScore, 40),
    maxScore: 40,
    percentage: Math.round((totalScore / 40) * 100),
    subcategories,
  }
}
