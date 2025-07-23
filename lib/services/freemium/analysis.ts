/**
 * @file lib/services/freemium/analysis.ts
 * @description Analysis logic for freemium listings - USES REAL 1000-POINT SCORING SYSTEM
 * @created 2025-07-22
 * @modified 2025-07-23
 * @todo FIXED: Now uses real scoring system instead of fake random scores
 */

import type { AirbnbListingData } from '@/lib/services/apify/types'
import type {
  EnhancedFakeData,
  FreemiumAnalysisResult,
} from '@/lib/types/freemium-api-types'
import { calculateListingScore } from '@/lib/scoring'
import { convertToListingData } from '@/lib/utils/data-conversion'

/**
 * Analyze listing data using REAL 1000-point scoring system (ScoringSystem.md compliant)
 * FIXED: No more fake random scores - uses actual backend scoring logic
 */
export async function analyzeListingData(
  listing: AirbnbListingData | EnhancedFakeData
): Promise<FreemiumAnalysisResult> {
  try {
    // Convert listing data to format expected by scoring system
    const listingData = convertToListingData(listing)

    // Use REAL scoring system (1000-point scale)
    const scoringResult = await calculateListingScore(listingData)

    // Map full categories to simplified freemium categories
    const simplifiedScores = {
      title: Math.round(
        scoringResult.categoryScores.contentOptimization.percentage || 0
      ),
      description: Math.round(
        scoringResult.categoryScores.contentOptimization.percentage || 0
      ),
      photos: Math.round(
        scoringResult.categoryScores.visualPresentation.percentage || 0
      ),
      pricing: Math.round(
        scoringResult.categoryScores.pricingStrategy.percentage || 0
      ),
      amenities: Math.round(
        scoringResult.categoryScores.propertyFeatures.percentage || 0
      ),
      location: Math.round(
        scoringResult.categoryScores.locationMarket.percentage || 0
      ),
    }

    return {
      overallScore: scoringResult.totalScore, // Real 1000-point score
      categoryScores: {
        // Full 1000-point system categories
        hostPerformance: scoringResult.categoryScores.hostPerformance.score,
        guestSatisfaction: scoringResult.categoryScores.guestSatisfaction.score,
        contentOptimization:
          scoringResult.categoryScores.contentOptimization.score,
        visualPresentation:
          scoringResult.categoryScores.visualPresentation.score,
        propertyFeatures: scoringResult.categoryScores.propertyFeatures.score,
        pricingStrategy: scoringResult.categoryScores.pricingStrategy.score,
        availabilityBooking:
          scoringResult.categoryScores.availabilityBooking.score,
        locationMarket: scoringResult.categoryScores.locationMarket.score,
        businessPerformance:
          scoringResult.categoryScores.businessPerformance.score,
        trustSafety: scoringResult.categoryScores.trustSafety.score,

        // Simplified categories for freemium display (derived from above)
        ...simplifiedScores,
      },
    }
  } catch (error) {
    console.error(
      '[analyzeListingData] Error using real scoring system:',
      error
    )

    // Fallback to basic analysis if scoring system fails
    return fallbackAnalysis(listing)
  }
}

/**
 * Fallback analysis if real scoring system fails
 */
function fallbackAnalysis(
  listing: AirbnbListingData | EnhancedFakeData
): FreemiumAnalysisResult {
  const isRealData = 'coordinates' in listing

  if (isRealData) {
    const realListing = listing as AirbnbListingData
    const baseScore = Math.floor(
      (realListing.rating?.guestSatisfaction || 4.0) * 200
    )

    return {
      overallScore: baseScore, // At least use a more realistic base
      categoryScores: {
        // Mock full categories for compatibility
        hostPerformance: Math.floor(baseScore * 0.18),
        guestSatisfaction: Math.floor(baseScore * 0.2),
        contentOptimization: Math.floor(baseScore * 0.18),
        visualPresentation: Math.floor(baseScore * 0.12),
        propertyFeatures: Math.floor(baseScore * 0.14),
        pricingStrategy: Math.floor(baseScore * 0.1),
        availabilityBooking: Math.floor(baseScore * 0.08),
        locationMarket: Math.floor((realListing.rating?.location || 4.0) * 15),
        businessPerformance: Math.floor(baseScore * 0.04),
        trustSafety: Math.floor(baseScore * 0.04),

        // Simplified categories (derived from real data)
        title: Math.floor((realListing.title?.length || 0) > 30 ? 75 : 50),
        description: Math.floor(
          (realListing.description?.length || 0) > 100 ? 70 : 45
        ),
        photos: Math.floor((realListing.images?.length || 0) > 5 ? 80 : 50),
        pricing: Math.floor(baseScore * 0.1),
        amenities: Math.floor(
          (realListing.amenities?.length || 0) > 3 ? 75 : 50
        ),
        location: Math.floor((realListing.rating?.location || 4.0) * 20),
      },
    }
  } else {
    const fakeListing = listing as EnhancedFakeData
    const baseScore = Math.floor(fakeListing.rating.guestSatisfaction * 200)

    return {
      overallScore: baseScore,
      categoryScores: {
        // Mock full categories
        hostPerformance: Math.floor(baseScore * 0.18),
        guestSatisfaction: Math.floor(baseScore * 0.2),
        contentOptimization: Math.floor(baseScore * 0.18),
        visualPresentation: Math.floor(baseScore * 0.12),
        propertyFeatures: Math.floor(baseScore * 0.14),
        pricingStrategy: Math.floor(baseScore * 0.1),
        availabilityBooking: Math.floor(baseScore * 0.08),
        locationMarket: Math.floor(fakeListing.rating.location * 15),
        businessPerformance: Math.floor(baseScore * 0.04),
        trustSafety: Math.floor(baseScore * 0.04),

        // Simplified categories
        title: 65,
        description: 62,
        photos: 75,
        pricing: Math.floor(baseScore * 0.1),
        amenities: 70,
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

  // Add additional high-value recommendations for better teaser effect
  const additionalRecs = [
    'Verbessern Sie Ihre Check-in Erfahrung mit einem digitalen Guidebook',
    'Implementieren Sie einen 24/7 Chat-Support für Gäste-Anfragen',
    'Bieten Sie personalisierte Gäste-Empfehlungen für die lokale Umgebung',
    'Optimieren Sie Ihre Instant Book-Einstellungen für mehr Buchungen',
    'Erstellen Sie saisonale Angebote und thematische Pakete',
    'Verbessern Sie Ihre Response-Zeit auf unter 10 Minuten',
    'Implementieren Sie Smart-Home Features für die moderne Gäste-Erfahrung',
    'Nutzen Sie professionelle Reinigungsservices für bessere Bewertungen',
    'Erstellen Sie eine Welcome-Box mit lokalen Produkten',
    'Optimieren Sie Ihre Kalenderverfügbarkeit für maximale Auslastung',
    'Implementieren Sie Upselling-Strategien für Zusatzleistungen',
    'Nutzen Sie Cross-Selling mit lokalen Partnern',
  ]

  recommendations.push(...additionalRecs)

  // Return 12-15 recommendations instead of just 3 for better conversion effect
  return recommendations.slice(0, Math.min(15, recommendations.length))
}
