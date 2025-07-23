/**
 * @file lib/services/gemini/analyzers/optimization-analyzer.ts
 * @description Optimization recommendations service using Gemini AI
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Extracted from analyzer.ts for CLAUDE.md compliance
 */

import { GeminiClient } from '../client'
import type { OptimizationRecommendations, GeminiServiceConfig } from '../types'

/**
 * Specialized optimization recommendations service
 */
export class OptimizationAnalyzer {
  private client: GeminiClient

  constructor(config: GeminiServiceConfig) {
    this.client = new GeminiClient(config)
  }

  /**
   * Generate comprehensive optimization recommendations
   */
  async generateOptimizationRecommendations(
    data: any
  ): Promise<OptimizationRecommendations[]> {
    console.log('[OptimizationAnalyzer] Generiere Optimierungsempfehlungen...')

    const prompt = this.createOptimizationPrompt(data)

    const response = await this.client.generateContent(prompt, {
      temperature: 0.3,
      maxOutputTokens: 2048,
    })

    const recommendations = JSON.parse(
      response
    ) as OptimizationRecommendations[]

    return recommendations
  }

  /**
   * Create optimization recommendations prompt
   */
  private createOptimizationPrompt(data: any): string {
    return `
Du bist ein Airbnb-Optimierungsexperte für den DACH-Markt. Basierend auf der umfassenden Analyse, erstelle priorisierte Handlungsempfehlungen:

Listing-Daten: ${JSON.stringify(data.listing, null, 2)}
Sentiment-Analyse: ${JSON.stringify(data.analysisResults?.sentiment?.aggregatedSentiment || {}, null, 2)}
Beschreibungs-Score: ${data.analysisResults?.description?.qualityScore || 'N/A'}
Preisempfehlung: ${data.analysisResults?.pricing?.suggestedPrice || 'N/A'}€

Erstelle konkrete Handlungsempfehlungen im JSON-Format:

[
  {
    "priority": "high",
    "category": "description",
    "recommendations": [
      {
        "action": "Beschreibung um Verkehrsanbindung erweitern",
        "impact": "high",
        "effort": "low",
        "timeline": "Sofort umsetzbar",
        "expectedResult": "15-20% mehr Buchungsanfragen"
      }
    ],
    "estimatedScoreImprovement": 45
  },
  {
    "priority": "medium",
    "category": "pricing",
    "recommendations": [
      {
        "action": "Preis um 10% erhöhen auf 78€",
        "impact": "medium",
        "effort": "low", 
        "timeline": "Diese Woche",
        "expectedResult": "12% höhere Einnahmen bei gleichbleibender Auslastung"
      }
    ],
    "estimatedScoreImprovement": 25
  }
]

Fokussiere auf konkrete, umsetzbare Maßnahmen mit messbaren Ergebnissen für den deutschen Markt.
`
  }
}
