/**
 * @file lib/services/freemium/analysis.ts
 * @description Analysis logic for freemium listings
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from api/freemium/analyze/route.ts for CLAUDE.md compliance
 */

import type { AirbnbListingData } from '@/lib/services/apify/types'
import type {
  EnhancedFakeData,
  FreemiumAnalysisResult,
} from '@/lib/types/freemium-api-types'

/**
 * Analyze listing data and generate scores
 */
export function analyzeListingData(
  listing: AirbnbListingData | EnhancedFakeData
): FreemiumAnalysisResult {
  const isRealData = 'coordinates' in listing

  if (isRealData) {
    const realListing = listing as AirbnbListingData
    return {
      overallScore: Math.floor(
        (realListing.rating?.guestSatisfaction || 4.0) * 100 +
          Math.random() * 100
      ),
      categoryScores: {
        title: Math.floor(
          (realListing.title?.length || 0) > 30
            ? 75 + Math.random() * 25
            : 50 + Math.random() * 30
        ),
        description: Math.floor(
          (realListing.description?.length || 0) > 100
            ? 70 + Math.random() * 30
            : 40 + Math.random() * 35
        ),
        photos: Math.floor(
          (realListing.images?.length || 0) > 5
            ? 80 + Math.random() * 20
            : 45 + Math.random() * 35
        ),
        pricing: Math.floor(60 + Math.random() * 35),
        amenities: Math.floor(
          (realListing.amenities?.length || 0) > 3
            ? 75 + Math.random() * 25
            : 50 + Math.random() * 30
        ),
        location: Math.floor((realListing.rating?.location || 4.0) * 20),
      },
    }
  } else {
    const fakeListing = listing as EnhancedFakeData
    return {
      overallScore: Math.floor(
        fakeListing.rating.guestSatisfaction * 100 + Math.random() * 100
      ),
      categoryScores: {
        title: Math.floor(60 + Math.random() * 35),
        description: Math.floor(55 + Math.random() * 30),
        photos: Math.floor(70 + Math.random() * 25),
        pricing: Math.floor(50 + Math.random() * 40),
        amenities: Math.floor(65 + Math.random() * 30),
        location: Math.floor(fakeListing.rating.location * 20),
      },
    }
  }
}

/**
 * Generate recommendations based on analysis scores
 */
export function generateRecommendations(
  listing: AirbnbListingData | EnhancedFakeData,
  analysis: FreemiumAnalysisResult
): string[] {
  const recommendations: string[] = []

  if (analysis.categoryScores.title < 70) {
    recommendations.push(
      'Optimieren Sie Ihren Listing-Titel mit lokalen Highlights und Unique Selling Points'
    )
  }

  if (analysis.categoryScores.description < 60) {
    recommendations.push(
      'Erweitern Sie Ihre Beschreibung um emotionale Trigger und Neighborhood-Infos'
    )
  }

  if (analysis.categoryScores.photos < 75) {
    recommendations.push(
      'Fügen Sie professionelle Fotos hinzu - besonders vom Außenbereich und besonderen Features'
    )
  }

  if (analysis.categoryScores.pricing < 65) {
    recommendations.push(
      'Ihre Preispositionierung hat Optimierungspotential basierend auf der Konkurrenzanalyse'
    )
  }

  if (analysis.categoryScores.amenities < 70) {
    recommendations.push(
      'Erweitern Sie Ihre Ausstattung um gefragte Amenities wie schnelles WLAN oder Arbeitsplatz'
    )
  }

  // Always add at least 3 recommendations
  if (recommendations.length < 3) {
    recommendations.push(
      'Verbessern Sie Ihre Check-in Erfahrung mit einem digitalen Guidebook'
    )
    recommendations.push(
      'Optimieren Sie Ihre Preissstrategie für Wochenenden und Feiertage'
    )
    recommendations.push(
      'Bieten Sie personalisierte Gäste-Empfehlungen für die lokale Umgebung'
    )
  }

  return recommendations.slice(0, 3)
}
