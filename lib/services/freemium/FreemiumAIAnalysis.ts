/**
 * @file lib/services/freemium/FreemiumAIAnalysis.ts
 * @description AI analysis service for freemium insights
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-09: Extracted from app/api/freemium/ai-insights/[token]/route.ts for CLAUDE.md compliance
 */

import { GeminiClient } from '@/lib/services/gemini/client'
import { createGermanAirbnbPrompt } from '@/lib/services/gemini/prompts'
import type { FreemiumListingData } from './FreemiumDataService'

// Gemini 1.5 Flash Configuration - Optimized for cost and speed
const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash' as const,
  apiKey: process.env.GEMINI_API_KEY!,
  region: 'us' as const,
  rateLimitPerMinute: 60,
  maxRetries: 2,
  timeout: 20000, // 20s timeout
  defaultTemperature: 0.3, // Slightly creative for engaging insights
  defaultMaxTokens: 1024, // Keep costs low
  enableSafetyFilters: false,
}

export interface FreemiumAIInsights {
  listingOptimization: {
    titleScore: number
    titleSuggestions: string[]
    descriptionScore: number
    descriptionImprovements: string[]
    photoScore: number
    photoRecommendations: string[]
    amenityScore: number
    missingAmenities: string[]
    score: number
  }
  hostCredibility: {
    currentScore: number
    improvementTips: string[]
    superhostBenefits: string[]
    score: number
  }
  seasonalOptimization: {
    currentSeason: string
    seasonalTips: string[]
    pricingHints: string[]
  }
  ratingImprovement: {
    currentStrengths: string[]
    improvementAreas: string[]
    reviewResponseTips: string[]
  }
  pricingStrategy: {
    recommendedPriceRange: {
      min: number
      max: number
    }
    pricingTips: string[]
    competitiveAdvantages: string[]
  }
}

export class FreemiumAIAnalysis {
  private static client = new GeminiClient(GEMINI_CONFIG)

  /**
   * Generate AI insights for freemium listing data
   */
  static async generateInsights(
    listingData: FreemiumListingData,
    token: string
  ): Promise<FreemiumAIInsights> {
    console.log('[FreemiumAI] Generating AI-powered insights...')

    const prompt = createGermanAirbnbPrompt(
      listingData.raw_scraped_data,
      'ai_insights'
    )

    console.log('[FreemiumAI] Calling Gemini 1.5 Flash API...')
    const result = await this.client.generateContent(prompt, {
      temperature: GEMINI_CONFIG.defaultTemperature,
      maxOutputTokens: GEMINI_CONFIG.defaultMaxTokens,
    })

    console.log('[FreemiumAI] ✅ Gemini analysis completed successfully')

    // Parse and structure the response for the frontend
    const insights = this.parseGeminiResponse(result)

    return insights
  }

  /**
   * Parse Gemini response and structure it for the frontend
   */
  private static parseGeminiResponse(rawResponse: any): FreemiumAIInsights {
    // This is a simplified parser - in production, this would be more robust
    try {
      if (typeof rawResponse === 'string') {
        // Try to extract JSON from response if it's a string
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }

      if (typeof rawResponse === 'object' && rawResponse !== null) {
        return rawResponse as FreemiumAIInsights
      }

      // Fallback with default structure
      return this.getDefaultInsights()
    } catch (error) {
      console.warn(
        '[FreemiumAI] Error parsing Gemini response, using defaults:',
        error
      )
      return this.getDefaultInsights()
    }
  }

  /**
   * Get default insights structure for fallback
   */
  private static getDefaultInsights(): FreemiumAIInsights {
    return {
      listingOptimization: {
        titleScore: 75,
        titleSuggestions: [
          'Fügen Sie einzigartige Merkmale hinzu',
          'Verwenden Sie emotionale Begriffe',
          'Erwähnen Sie die Lage',
        ],
        descriptionScore: 68,
        descriptionImprovements: [
          'Mehr Details zur Ausstattung',
          'Lokale Sehenswürdigkeiten erwähnen',
          'Gästevorteile hervorheben',
        ],
        photoScore: 82,
        photoRecommendations: [
          'Professionelle Beleuchtung verwenden',
          'Alle Räume zeigen',
          'Lifestyle-Aufnahmen hinzufügen',
        ],
        amenityScore: 71,
        missingAmenities: [
          'WLAN-Geschwindigkeit angeben',
          'Arbeitsplatz erwähnen',
          'Parkplatz-Details',
        ],
        score: 74,
      },
      hostCredibility: {
        currentScore: 78,
        improvementTips: [
          'Profilbild aktualisieren',
          'Gastgeber-Story erweitern',
          'Verifizierungen vervollständigen',
        ],
        superhostBenefits: [
          'Höhere Sichtbarkeit',
          'Mehr Buchungen',
          'Vertrauensbonus',
        ],
        score: 78,
      },
      seasonalOptimization: {
        currentSeason: 'Herbst',
        seasonalTips: [
          'Herbstdekoration erwähnen',
          'Kuschelige Atmosphäre betonen',
          'Indoor-Aktivitäten hervorheben',
        ],
        pricingHints: [
          'Preise für Nebensaison anpassen',
          'Langzeitrabatte anbieten',
          'Wochenendpreise optimieren',
        ],
      },
      ratingImprovement: {
        currentStrengths: ['Sauberkeit', 'Kommunikation', 'Lage'],
        improvementAreas: [
          'Genauigkeit der Beschreibung',
          'Check-in Prozess',
          'Ausstattung',
        ],
        reviewResponseTips: [
          'Schnell auf Bewertungen antworten',
          'Persönlich und dankbar reagieren',
          'Verbesserungen erwähnen',
        ],
      },
      pricingStrategy: {
        recommendedPriceRange: {
          min: 65,
          max: 95,
        },
        pricingTips: [
          'Dynamische Preisgestaltung nutzen',
          'Konkurrenz regelmäßig prüfen',
          'Saison-Preise anpassen',
        ],
        competitiveAdvantages: [
          'Einzigartige Ausstattung',
          'Premium-Lage',
          'Persönlicher Service',
        ],
      },
    }
  }
}
