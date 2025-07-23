/**
 * @file components/freemium/FreemiumRecommendations.tsx
 * @description Adapter component to display freemium recommendations using RecommendationsList
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo Adapter for freemium API data to RecommendationsList component
 */

'use client'

import { RecommendationsList } from '@/components/analyze/RecommendationsList'
import type {
  Recommendation,
  MarketComparison,
} from '@/components/analyze/shared-types'
import type { FreemiumData } from '@/lib/types/freemium-types'

interface FreemiumRecommendationsProps {
  data: FreemiumData
}

export function FreemiumRecommendations({
  data,
}: FreemiumRecommendationsProps) {
  // Transform string recommendations to Recommendation objects
  const recommendations: Recommendation[] = data.recommendations.map(
    (rec, idx) => {
      // Determine category based on content keywords
      let category: Recommendation['category'] = 'description'
      if (
        rec.toLowerCase().includes('titel') ||
        rec.toLowerCase().includes('title')
      ) {
        category = 'reviews' // Map title suggestions to reviews category
      } else if (
        rec.toLowerCase().includes('foto') ||
        rec.toLowerCase().includes('bild')
      ) {
        category = 'photos'
      } else if (
        rec.toLowerCase().includes('preis') ||
        rec.toLowerCase().includes('price')
      ) {
        category = 'pricing'
      } else if (
        rec.toLowerCase().includes('ausstattung') ||
        rec.toLowerCase().includes('amenity')
      ) {
        category = 'amenities'
      } else if (
        rec.toLowerCase().includes('lage') ||
        rec.toLowerCase().includes('location')
      ) {
        category = 'location'
      }

      return {
        id: `freemium-rec-${idx}`,
        title: rec,
        description:
          'Detaillierte Schritt-für-Schritt Anleitung verfügbar im Pro-Plan. Erhalten Sie spezifische Handlungsempfehlungen mit messbaren Erfolgsmetriken.',
        category,
        priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: Math.max(5, 20 - idx * 5), // Decreasing impact
        actionItems: [
          'Jetzt Pro upgraden für detaillierte Umsetzungsschritte',
          'Erhalten Sie spezifische Benchmarks und Zielwerte',
          'Zugang zu fortgeschrittenen Optimierungstools',
        ],
      }
    }
  )

  // Create mock market comparison for freemium display
  const marketComparison: MarketComparison = {
    averagePrice: 85, // Mock average price for the area
    pricePosition: data.listing.price.amount === '0' ? 'average' : 'average',
    competitorCount: 127, // Mock competitor count
    occupancyRate: 73, // Mock occupancy rate
    averageRating: 4.6, // Mock average rating
    ratingPosition:
      data.listing.rating.guestSatisfaction >= 4.6
        ? 'above'
        : data.listing.rating.guestSatisfaction >= 4.3
          ? 'average'
          : 'below',
  }

  return (
    <RecommendationsList
      recommendations={recommendations}
      marketComparison={marketComparison}
    />
  )
}
