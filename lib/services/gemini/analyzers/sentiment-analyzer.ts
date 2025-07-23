/**
 * @file lib/services/gemini/analyzers/sentiment-analyzer.ts
 * @description Sentiment analysis service using Gemini AI
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Extracted from analyzer.ts for CLAUDE.md compliance
 */

import { GeminiClient } from '../client'
import type {
  AnalysisInputData,
  SentimentAnalysis,
  ReviewSentimentAnalysis,
  GeminiServiceConfig,
} from '../types'

/**
 * Specialized sentiment analysis service for reviews
 */
export class SentimentAnalyzer {
  private client: GeminiClient

  constructor(config: GeminiServiceConfig) {
    this.client = new GeminiClient(config)
  }

  /**
   * Analyze sentiment of reviews using Gemini
   */
  async analyzeSentiment(
    reviews: AnalysisInputData['reviews']
  ): Promise<ReviewSentimentAnalysis> {
    console.log('[SentimentAnalyzer] Analysiere Bewertungsstimmung...')

    if (reviews.length === 0) {
      return this.createEmptySentimentAnalysis()
    }

    const prompt = this.createSentimentAnalysisPrompt(reviews)

    const request = {
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent analysis
        maxOutputTokens: 2048,
      },
    }

    const response = await this.client.generateContent(request)
    const analysisResult =
      this.client.parseJSONResponse<ReviewSentimentAnalysis>(response)

    return analysisResult
  }

  /**
   * Create sentiment analysis prompt
   */
  private createSentimentAnalysisPrompt(
    reviews: AnalysisInputData['reviews']
  ): string {
    const reviewTexts = reviews
      .slice(0, 20) // Limit for token management
      .map((r, i) => `${i + 1}. "${r.text}" (Bewertung: ${r.rating || 'N/A'})`)
      .join('\n')

    return `
Du bist ein Experte für Sentimentanalyse im DACH-Markt (Deutschland, Österreich, Schweiz). Analysiere die folgenden Airbnb-Bewertungen:

${reviewTexts}

Führe eine umfassende Sentimentanalyse durch und antworte im folgenden JSON-Format:

{
  "reviews": [
    {
      "reviewId": "1",
      "text": "Original-Bewertungstext",
      "sentiment": {
        "overallSentiment": "positive|neutral|negative",
        "confidence": 0.85,
        "positiveScore": 0.7,
        "negativeScore": 0.1,
        "neutralScore": 0.2,
        "keyThemes": ["sauberkeit", "lage", "kommunikation"],
        "emotionalTone": ["zufrieden", "begeistert"],
        "language": "de|en|other",
        "analysisDate": "${new Date().toISOString()}"
      },
      "keyInsights": ["Hervorragende Sauberkeit", "Zentrale Lage geschätzt"]
    }
  ],
  "aggregatedSentiment": {
    "overallSentiment": "positive|neutral|negative",
    "confidence": 0.88,
    "positiveScore": 0.75,
    "negativeScore": 0.1,
    "neutralScore": 0.15,
    "keyThemes": ["sauberkeit", "lage", "kommunikation", "preis-leistung"],
    "emotionalTone": ["zufrieden", "empfehlung"],
    "language": "de",
    "analysisDate": "${new Date().toISOString()}"
  },
  "themeSummary": {
    "sauberkeit": {
      "mentionCount": 15,
      "averageSentiment": 0.85,
      "keyPoints": ["Tadellose Sauberkeit", "Frische Bettwäsche"]
    },
    "lage": {
      "mentionCount": 12,
      "averageSentiment": 0.78,
      "keyPoints": ["Zentrale Lage", "Gute Verkehrsanbindung"]
    }
  }
}

Analysiere alle Bewertungen gründlich und identifiziere die wichtigsten Themen und Stimmungen aus DACH-Markt-Perspektive.
`
  }

  /**
   * Create empty sentiment analysis for cases with no reviews
   */
  private createEmptySentimentAnalysis(): ReviewSentimentAnalysis {
    const emptySentiment: SentimentAnalysis = {
      overallSentiment: 'neutral',
      confidence: 0,
      positiveScore: 0,
      negativeScore: 0,
      neutralScore: 1,
      keyThemes: [],
      emotionalTone: [],
      language: 'de',
      analysisDate: new Date().toISOString(),
    }

    return {
      reviews: [],
      aggregatedSentiment: emptySentiment,
      themeSummary: {},
    }
  }
}
