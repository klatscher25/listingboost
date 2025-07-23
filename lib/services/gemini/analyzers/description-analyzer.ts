/**
 * @file lib/services/gemini/analyzers/description-analyzer.ts
 * @description Description quality analysis service using Gemini AI
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Extracted from analyzer.ts for CLAUDE.md compliance
 */

import { GeminiClient } from '../client'
import type {
  AnalysisInputData,
  DescriptionAnalysis,
  GeminiServiceConfig,
} from '../types'

/**
 * Specialized description quality analysis service
 */
export class DescriptionAnalyzer {
  private client: GeminiClient

  constructor(config: GeminiServiceConfig) {
    this.client = new GeminiClient(config)
  }

  /**
   * Analyze description quality and suggest improvements
   */
  async analyzeDescription(
    listing: AnalysisInputData['listing']
  ): Promise<DescriptionAnalysis> {
    console.log('[DescriptionAnalyzer] Analysiere Beschreibungsqualität...')

    const prompt = this.createDescriptionAnalysisPrompt(listing)

    const response = await this.client.generateContent(prompt, {
      temperature: 0.2,
      maxOutputTokens: 1536,
    })

    const analysisResult = JSON.parse(response) as DescriptionAnalysis

    return analysisResult
  }

  /**
   * Create description analysis prompt
   */
  private createDescriptionAnalysisPrompt(
    listing: AnalysisInputData['listing']
  ): string {
    return `
Du bist ein Experte für Airbnb-Beschreibungsoptimierung im DACH-Markt. Analysiere die folgende Listing-Beschreibung:

Titel: "${listing.title}"
Beschreibung: "${listing.description}"
Preis: ${listing.price} ${listing.currency}
Lage: ${listing.location}

Analysiere die Qualität der Beschreibung und antworte im folgenden JSON-Format:

{
  "qualityScore": 85,
  "readabilityScore": 78,
  "keywordDensity": {
    "zentral": 0.02,
    "modern": 0.015,
    "komfortabel": 0.01
  },
  "missingElements": [
    "Öffentliche Verkehrsmittel Entfernung",
    "Check-in/Check-out Zeiten",
    "WLAN-Geschwindigkeit"
  ],
  "improvementSuggestions": [
    "Fügen Sie konkrete Entfernungsangaben hinzu",
    "Beschreiben Sie die Nachbarschaft detaillierter",
    "Erwähnen Sie einzigartige Merkmale"
  ],
  "strengthsIdentified": [
    "Klare Strukturierung",
    "Atmosphärische Beschreibung"
  ],
  "languageQuality": {
    "grammar": 92,
    "clarity": 85,
    "appeal": 78
  },
  "suggestedRewrite": "Optimierte Version der Beschreibung mit DACH-Markt-Fokus..."
}

Bewerte von 0-100 und fokussiere auf DACH-Markt Erwartungen und deutsche Sprachqualität.
`
  }
}
