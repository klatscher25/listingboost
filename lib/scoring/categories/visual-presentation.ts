/**
 * @file lib/scoring/categories/visual-presentation.ts
 * @description Visual Presentation scoring category (120 points)
 * @created 2025-07-21
 * @todo CORE-001-01: Visual presentation scoring implementation
 */

import { Database } from '@/types/database'
import { CategoryScore } from '../index'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * 4. Visual Presentation (120 Punkte)
 */
export async function calculateVisualPresentationScore(
  listing: ListingData,
  additionalData?: any
): Promise<CategoryScore> {
  const subcategories: CategoryScore['subcategories'] = {}
  let totalScore = 0

  // 4.1 Photo Quantity (30 Punkte)
  let photoScore = 0
  if (listing.images_count) {
    const count = listing.images_count
    if (count >= 30) photoScore = 30
    else if (count >= 20) photoScore = 25
    else if (count >= 15) photoScore = 20
    else if (count >= 10) photoScore = 10
    else photoScore = 0
  }
  subcategories.photoQuantity = {
    score: photoScore,
    maxScore: 30,
    reason: `${listing.images_count || 0} Fotos`,
  }
  totalScore += photoScore

  // 4.2 Photo Orientation Mix (30 Punkte) - Placeholder
  const orientationScore = 20 // Default moderate score
  subcategories.photoOrientation = {
    score: orientationScore,
    maxScore: 30,
    reason: 'Foto-Ausrichtung - erweiterte Analyse erforderlich',
  }
  totalScore += orientationScore

  // 4.3 Photo Captions (30 Punkte) - Placeholder
  const captionsScore = 15 // Default moderate score
  subcategories.photoCaptions = {
    score: captionsScore,
    maxScore: 30,
    reason: 'Foto-Beschriftungen - erweiterte Analyse erforderlich',
  }
  totalScore += captionsScore

  // 4.4 Photo Technical Quality (30 Punkte) - Placeholder
  const qualityScore = 20 // Default moderate score
  subcategories.photoQuality = {
    score: qualityScore,
    maxScore: 30,
    reason: 'Foto-Qualität - erweiterte Analyse erforderlich',
  }
  totalScore += qualityScore

  return {
    score: Math.min(totalScore, 120),
    maxScore: 120,
    percentage: Math.round((totalScore / 120) * 100),
    subcategories,
  }
}
