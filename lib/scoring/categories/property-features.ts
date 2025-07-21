/**
 * @file lib/scoring/categories/property-features.ts
 * @description Property Features & Amenities scoring category (140 points)
 * @created 2025-07-21
 * @todo CORE-001-01: Property features scoring implementation
 */

import { Database } from '@/types/database'
import { CategoryScore } from '../index'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * 5. Property Features & Amenities (140 Punkte)
 */
export async function calculatePropertyFeaturesScore(
  listing: ListingData,
  additionalData?: any
): Promise<CategoryScore> {
  const subcategories: CategoryScore['subcategories'] = {}
  let totalScore = 0

  // 5.1 Essential Amenities (50 Punkte)
  let essentialScore = 0
  if (listing.wifi_available) essentialScore += 15
  if (listing.kitchen_available) essentialScore += 15
  if (listing.heating_available) essentialScore += 10
  // Essentials check - simplified
  if (listing.amenities) essentialScore += 10

  subcategories.essentialAmenities = {
    score: essentialScore,
    maxScore: 50,
    reason: `${(essentialScore / 50) * 100}% der wesentlichen Ausstattung vorhanden`,
  }
  totalScore += essentialScore

  // 5.2 Comfort Amenities (40 Punkte)
  let comfortScore = 0
  if (listing.air_conditioning_available) comfortScore += 10
  if (listing.washer_available) comfortScore += 10
  if (listing.dishwasher_available) comfortScore += 8
  if (listing.tv_available) comfortScore += 7
  if (listing.iron_available) comfortScore += 5

  subcategories.comfortAmenities = {
    score: comfortScore,
    maxScore: 40,
    reason: `${Math.round((comfortScore / 40) * 100)}% der Komfort-Ausstattung vorhanden`,
  }
  totalScore += comfortScore

  // 5.3 Work Features (25 Punkte)
  let workScore = 0
  if (listing.dedicated_workspace_available) workScore += 15
  if (
    listing.description?.toLowerCase().includes('high-speed') ||
    listing.description?.toLowerCase().includes('schnell')
  ) {
    workScore += 10
  }

  subcategories.workFeatures = {
    score: workScore,
    maxScore: 25,
    reason:
      workScore > 0
        ? 'Arbeitsplatz-Features vorhanden'
        : 'Keine Arbeitsplatz-Features',
  }
  totalScore += workScore

  // 5.4 Premium Features (25 Punkte)
  let premiumScore = 0
  if (listing.pool_available || listing.hot_tub_available) premiumScore += 8
  if (listing.gym_available) premiumScore += 8
  if (listing.balcony_available) premiumScore += 5
  // Special features - basic check
  if (listing.amenities) premiumScore += 4

  subcategories.premiumFeatures = {
    score: premiumScore,
    maxScore: 25,
    reason: `${Math.round((premiumScore / 25) * 100)}% der Premium-Features vorhanden`,
  }
  totalScore += premiumScore

  return {
    score: Math.min(totalScore, 140),
    maxScore: 140,
    percentage: Math.round((totalScore / 140) * 100),
    subcategories,
  }
}
