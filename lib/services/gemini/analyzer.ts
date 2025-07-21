/**
 * @file lib/services/gemini/analyzer.ts
 * @description AI analysis service using Gemini for intelligent insights
 * @created 2025-07-21
 * @todo CORE-001-03: Gemini AI analysis implementation
 */

import { GeminiClient } from './client'
import {
  AnalysisInputData,
  SentimentAnalysis,
  ReviewSentimentAnalysis,
  DescriptionAnalysis,
  AmenityGapAnalysis,
  PricingRecommendation,
  OptimizationRecommendations,
  GeminiAnalysisResult,
  GeminiServiceConfig,
} from './types'

/**
 * Intelligent AI Analyzer for Airbnb listings using Gemini
 */
export class GeminiAnalyzer {
  private client: GeminiClient

  constructor(config: GeminiServiceConfig) {
    this.client = new GeminiClient(config)
  }

  /**
   * Perform comprehensive AI analysis of a listing
   */
  async analyzeComprehensive(
    data: AnalysisInputData
  ): Promise<GeminiAnalysisResult> {
    console.log('[GeminiAnalyzer] Starte umfassende AI-Analyse...')

    const startTime = Date.now()
    let totalTokensUsed = 0

    try {
      // Parallel analysis for efficiency
      const [
        sentimentAnalysis,
        descriptionAnalysis,
        amenityGapAnalysis,
        pricingRecommendation,
      ] = await Promise.all([
        this.analyzeSentiment(data.reviews),
        this.analyzeDescription(data.listing),
        this.analyzeAmenityGaps(data.listing, data.competitors),
        this.analyzePricing(data.listing, data.competitors, data.marketContext),
      ])

      // Generate optimization recommendations based on all analysis
      const optimizationRecommendations =
        await this.generateOptimizationRecommendations({
          ...data,
          analysisResults: {
            sentiment: sentimentAnalysis,
            description: descriptionAnalysis,
            amenities: amenityGapAnalysis,
            pricing: pricingRecommendation,
          },
        })

      const processingTime = Date.now() - startTime

      const result: GeminiAnalysisResult = {
        listingId: data.listing.title, // Will be updated with actual ID
        analyzedAt: new Date().toISOString(),
        sentimentAnalysis,
        descriptionAnalysis,
        amenityGapAnalysis,
        pricingRecommendation,
        optimizationRecommendations,
        analysisMetadata: {
          tokensUsed: totalTokensUsed,
          processingTime,
          confidenceScore: this.calculateOverallConfidence([
            sentimentAnalysis.aggregatedSentiment.confidence,
            descriptionAnalysis.qualityScore / 100,
            pricingRecommendation.confidenceLevel / 100,
          ]),
          dataQuality: {
            reviewsQuality: Math.min(100, data.reviews.length * 10),
            competitorDataQuality: Math.min(100, data.competitors.length * 5),
            listingDataCompleteness: this.calculateDataCompleteness(
              data.listing
            ),
          },
        },
      }

      console.log('[GeminiAnalyzer] AI-Analyse erfolgreich abgeschlossen:', {
        processingTime,
        tokensUsed: totalTokensUsed,
        confidenceScore: result.analysisMetadata.confidenceScore,
      })

      return result
    } catch (error) {
      console.error('[GeminiAnalyzer] AI-Analyse fehlgeschlagen:', error)
      throw new Error(`AI-Analyse fehlgeschlagen: ${(error as Error).message}`)
    }
  }

  /**
   * Analyze sentiment of reviews using Gemini
   */
  async analyzeSentiment(
    reviews: AnalysisInputData['reviews']
  ): Promise<ReviewSentimentAnalysis> {
    console.log('[GeminiAnalyzer] Analysiere Bewertungsstimmung...')

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
   * Analyze description quality and suggest improvements
   */
  async analyzeDescription(
    listing: AnalysisInputData['listing']
  ): Promise<DescriptionAnalysis> {
    console.log('[GeminiAnalyzer] Analysiere Beschreibungsqualität...')

    const prompt = this.createDescriptionAnalysisPrompt(listing)

    const request = {
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1536,
      },
    }

    const response = await this.client.generateContent(request)
    const analysisResult =
      this.client.parseJSONResponse<DescriptionAnalysis>(response)

    return analysisResult
  }

  /**
   * Analyze amenity gaps compared to competitors
   */
  async analyzeAmenityGaps(
    listing: AnalysisInputData['listing'],
    competitors: AnalysisInputData['competitors']
  ): Promise<AmenityGapAnalysis> {
    console.log('[GeminiAnalyzer] Analysiere Ausstattungslücken...')

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
   * Generate pricing recommendations using AI
   */
  async analyzePricing(
    listing: AnalysisInputData['listing'],
    competitors: AnalysisInputData['competitors'],
    marketContext: AnalysisInputData['marketContext']
  ): Promise<PricingRecommendation> {
    console.log('[GeminiAnalyzer] Analysiere Preisempfehlungen...')

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
   * Generate comprehensive optimization recommendations
   */
  async generateOptimizationRecommendations(
    data: any
  ): Promise<OptimizationRecommendations[]> {
    console.log('[GeminiAnalyzer] Generiere Optimierungsempfehlungen...')

    const prompt = this.createOptimizationPrompt(data)

    const request = {
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }

    const response = await this.client.generateContent(request)
    const recommendations =
      this.client.parseJSONResponse<OptimizationRecommendations[]>(response)

    return recommendations
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

  /**
   * Helper methods
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

  private calculateOverallConfidence(confidenceScores: number[]): number {
    const average =
      confidenceScores.reduce((sum, score) => sum + score, 0) /
      confidenceScores.length
    return Math.round(average * 100)
  }

  private calculateDataCompleteness(
    listing: AnalysisInputData['listing']
  ): number {
    const fields = [
      listing.title,
      listing.description,
      listing.amenities,
      listing.price,
      listing.location,
      listing.ratings.overall,
      listing.host.name,
    ]

    const completedFields = fields.filter(
      (field) => field !== null && field !== undefined && field !== ''
    ).length

    return Math.round((completedFields / fields.length) * 100)
  }
}
