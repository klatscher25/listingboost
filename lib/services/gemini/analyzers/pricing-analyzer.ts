/**
 * @file lib/services/gemini/analyzers/pricing-analyzer.ts
 * @description Pricing analysis service using Gemini AI
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Extracted from analyzer.ts for CLAUDE.md compliance
 */

import { GeminiClient } from '../client'
import type {
  AnalysisInputData,
  PricingRecommendation,
  GeminiServiceConfig,
} from '../types'

/**
 * Specialized pricing analysis service
 */
export class PricingAnalyzer {
  private client: GeminiClient

  constructor(config: GeminiServiceConfig) {
    this.client = new GeminiClient(config)
  }

  /**
   * Generate pricing recommendations using AI
   */
  async analyzePricing(
    listing: AnalysisInputData['listing'],
    competitors: AnalysisInputData['competitors'],
    marketContext: AnalysisInputData['marketContext']
  ): Promise<PricingRecommendation> {
    console.log('[PricingAnalyzer] Analysiere Preisempfehlungen...')

    const prompt = this.createPricingAnalysisPrompt(
      listing,
      competitors,
      marketContext
    )

    const request = {
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    }

    const response = await this.client.generateContent(request)
    const analysisResult =
      this.client.parseJSONResponse<PricingRecommendation>(response)

    return analysisResult
  }

  /**
   * Create pricing analysis prompt
   */
  private createPricingAnalysisPrompt(
    listing: AnalysisInputData['listing'],
    competitors: AnalysisInputData['competitors'],
    marketContext: AnalysisInputData['marketContext']
  ): string {
    const competitorPrices = competitors
      .map(
        (comp) =>
          `${comp.price}€ (${comp.rating}⭐, Superhost: ${comp.isSuperhost ? 'Ja' : 'Nein'})`
      )
      .join(', ')

    return `
Du bist ein Preisanalyst für Airbnb im DACH-Raum. Analysiere die Preispositionierung:

Aktueller Preis: ${listing.price} ${listing.currency}
Bewertung: ${listing.ratings.overall}
Superhost: ${listing.host.isSuperhost ? 'Ja' : 'Nein'}
Lage: ${listing.location}

Marktkontext:
- Durchschnittspreis: ${marketContext.averagePrice}€
- Durchschnittsbewertung: ${marketContext.averageRating}
- Superhost-Anteil: ${marketContext.superhostPercentage}%

Konkurrierende Preise: ${competitorPrices}

Analysiere und antworte im JSON-Format:

{
  "suggestedPrice": 78,
  "priceRange": {
    "minimum": 65,
    "optimal": 78,
    "maximum": 85
  },
  "reasoning": [
    "Liegt 15% unter Marktdurchschnitt",
    "Hohe Bewertung rechtfertigt Premium",
    "Superhost-Status erlaubt höhere Preise"
  ],
  "marketPosition": "mid-range",
  "competitiveAdvantage": [
    "Überdurchschnittliche Bewertung",
    "Vertrauensvoller Superhost"
  ],
  "seasonalAdjustments": {
    "sommer": {
      "priceMultiplier": 1.2,
      "reasoning": "Hauptsaison in Deutschland"
    },
    "winter": {
      "priceMultiplier": 0.9,
      "reasoning": "Schwächere Nachfrage"
    }
  },
  "confidenceLevel": 88
}

Berücksichtige DACH-Markt Besonderheiten und deutsche Reisegewohnheiten.
`
  }
}
