/**
 * @file lib/services/gemini/analyzers/amenity-gap-analyzer.ts
 * @description Amenity gap analysis service using Gemini AI
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Extracted from analyzer.ts for CLAUDE.md compliance
 */

import { GeminiClient } from '../client'
import type {
  AnalysisInputData,
  AmenityGapAnalysis,
  GeminiServiceConfig,
} from '../types'

/**
 * Specialized amenity gap analysis service
 */
export class AmenityGapAnalyzer {
  private client: GeminiClient

  constructor(config: GeminiServiceConfig) {
    this.client = new GeminiClient(config)
  }

  /**
   * Analyze amenity gaps compared to competitors
   */
  async analyzeAmenityGaps(
    listing: AnalysisInputData['listing'],
    competitors: AnalysisInputData['competitors']
  ): Promise<AmenityGapAnalysis> {
    console.log('[AmenityGapAnalyzer] Analysiere Ausstattungslücken...')

    const prompt = this.createAmenityGapAnalysisPrompt(listing, competitors)

    const request = {
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1536,
      },
    }

    const response = await this.client.generateContent(request)
    const analysisResult =
      this.client.parseJSONResponse<AmenityGapAnalysis>(response)

    return analysisResult
  }

  /**
   * Create amenity gap analysis prompt
   */
  private createAmenityGapAnalysisPrompt(
    listing: AnalysisInputData['listing'],
    competitors: AnalysisInputData['competitors']
  ): string {
    const listingAmenities = JSON.stringify(listing.amenities || [])
    const competitorInfo = competitors
      .slice(0, 10)
      .map(
        (comp) =>
          `${comp.title}: ${comp.amenities?.join(', ') || 'N/A'} (${comp.price}€, ${comp.rating}⭐)`
      )
      .join('\n')

    return `
Du bist ein Marktanalyst für Airbnb im DACH-Raum. Analysiere die Ausstattungslücken:

Aktuelle Listing-Ausstattung: ${listingAmenities}
Preis: ${listing.price} ${listing.currency}
Bewertung: ${listing.ratings.overall}

Konkurrierende Listings:
${competitorInfo}

Analysiere die Ausstattungslücken und antworte im JSON-Format:

{
  "missingAmenities": [
    {
      "amenity": "Geschirrspüler",
      "importance": "high",
      "competitorAdoptionRate": 75,
      "estimatedImpact": "Kann Bewertung um 0.2 Punkte steigern"
    }
  ],
  "strengthAmenities": ["Schnelles WLAN", "Moderne Küche"],
  "marketComparison": {
    "averageAmenityCount": 18,
    "topPerformerAmenities": ["WLAN", "Küche", "Heizung", "Geschirrspüler"],
    "gapScore": 85
  },
  "recommendations": [
    "Investition in Geschirrspüler würde Konkurrenzfähigkeit erhöhen",
    "Smart-TV könnte jüngere Gäste ansprechen"
  ]
}

Fokussiere auf DACH-Markt Standards und bewerte die wirtschaftliche Rentabilität der fehlenden Ausstattung.
`
  }
}
