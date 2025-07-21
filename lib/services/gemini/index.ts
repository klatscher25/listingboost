/**
 * @file lib/services/gemini/index.ts
 * @description Main Gemini AI service orchestrator integrated with scoring system
 * @created 2025-07-21
 * @todo CORE-001-03: Complete Gemini integration with scoring system
 */

import { env } from '@/lib/config'
import { GeminiClient } from './client'
import { GeminiAnalyzer } from './analyzer'
import {
  GeminiServiceConfig,
  AnalysisInputData,
  GeminiAnalysisResult,
} from './types'

/**
 * Enhanced analysis result that includes both AI insights and scoring
 */
export interface EnhancedAnalysisResult {
  // AI Analysis from Gemini
  aiAnalysis: GeminiAnalysisResult

  // Integration with existing scoring system
  scoringEnhancements: {
    sentimentBonus: number // Additional points from sentiment analysis
    descriptionBonus: number // Bonus for description quality
    aiOptimizationPotential: number // Potential score improvement from AI recommendations
    confidenceAdjustment: number // Adjustment based on data quality
  }

  // Comprehensive recommendations
  prioritizedActions: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low'
    category: string
    action: string
    estimatedImpact: number // Points out of 1000
    effort: 'low' | 'medium' | 'high'
    timeline: string
  }>

  // Meta information
  processingMetadata: {
    totalProcessingTime: number
    aiAnalysisTime: number
    integrationTime: number
    tokensUsed: number
    cost: number // Estimated cost in EUR
  }
}

/**
 * Main Gemini AI Service for intelligent Airbnb analysis
 */
export class GeminiService {
  private analyzer: GeminiAnalyzer
  private client: GeminiClient
  private config: GeminiServiceConfig

  constructor() {
    this.config = this.createServiceConfig()
    this.analyzer = new GeminiAnalyzer(this.config)
    this.client = new GeminiClient(this.config)
  }

  /**
   * Perform enhanced analysis with AI insights integrated with scoring
   */
  async analyzeWithAI(
    inputData: AnalysisInputData
  ): Promise<EnhancedAnalysisResult> {
    console.log('[GeminiService] Starte erweiterte AI-Analyse...')

    const totalStartTime = Date.now()
    let aiAnalysisTime = 0
    let tokensUsed = 0

    try {
      // Step 1: Perform comprehensive AI analysis
      const aiStartTime = Date.now()
      const aiAnalysis = await this.analyzer.analyzeComprehensive(inputData)
      aiAnalysisTime = Date.now() - aiStartTime
      tokensUsed = aiAnalysis.analysisMetadata.tokensUsed

      // Step 2: Calculate scoring enhancements based on AI insights
      const integrationStartTime = Date.now()
      const scoringEnhancements = this.calculateScoringEnhancements(aiAnalysis)

      // Step 3: Create prioritized action plan
      const prioritizedActions = this.createPrioritizedActionPlan(aiAnalysis)

      const integrationTime = Date.now() - integrationStartTime
      const totalProcessingTime = Date.now() - totalStartTime

      const result: EnhancedAnalysisResult = {
        aiAnalysis,
        scoringEnhancements,
        prioritizedActions,
        processingMetadata: {
          totalProcessingTime,
          aiAnalysisTime,
          integrationTime,
          tokensUsed,
          cost: this.estimateApiCost(tokensUsed),
        },
      }

      console.log('[GeminiService] AI-Analyse erfolgreich abgeschlossen:', {
        totalTime: totalProcessingTime,
        aiTime: aiAnalysisTime,
        tokensUsed,
        estimatedCost: result.processingMetadata.cost,
        actionCount: prioritizedActions.length,
      })

      return result
    } catch (error) {
      console.error('[GeminiService] AI-Analyse fehlgeschlagen:', error)
      throw new Error(`AI-Analyse fehlgeschlagen: ${(error as Error).message}`)
    }
  }

  /**
   * Quick AI analysis for basic insights (faster, limited analysis)
   */
  async quickAnalyzeWithAI(
    inputData: AnalysisInputData
  ): Promise<Partial<EnhancedAnalysisResult>> {
    console.log('[GeminiService] Starte Schnell-AI-Analyse...')

    try {
      // Only perform the most critical analyses
      const [sentimentAnalysis, pricingRecommendation] = await Promise.all([
        this.analyzer.analyzeSentiment(inputData.reviews),
        this.analyzer.analyzePricing(
          inputData.listing,
          inputData.competitors,
          inputData.marketContext
        ),
      ])

      const quickResult = {
        aiAnalysis: {
          listingId: inputData.listing.title,
          analyzedAt: new Date().toISOString(),
          sentimentAnalysis,
          pricingRecommendation,
        } as any,
        scoringEnhancements: {
          sentimentBonus: this.calculateSentimentBonus(sentimentAnalysis),
          descriptionBonus: 0,
          aiOptimizationPotential: 0,
          confidenceAdjustment: 0,
        },
        prioritizedActions: this.createQuickActionPlan(
          sentimentAnalysis,
          pricingRecommendation
        ),
      }

      console.log('[GeminiService] Schnell-AI-Analyse abgeschlossen')
      return quickResult
    } catch (error) {
      console.error('[GeminiService] Schnell-AI-Analyse fehlgeschlagen:', error)
      throw new Error(
        `Schnell-AI-Analyse fehlgeschlagen: ${(error as Error).message}`
      )
    }
  }

  /**
   * Check if Gemini service is available and healthy
   */
  async checkServiceHealth(): Promise<{
    healthy: boolean
    rateLimitStatus: any
    lastError?: string
  }> {
    try {
      const rateLimitStatus = this.client.getRateLimitStatus()
      const canMakeRequest = this.client.canMakeRequest()

      return {
        healthy: canMakeRequest,
        rateLimitStatus,
      }
    } catch (error) {
      return {
        healthy: false,
        rateLimitStatus: { requestsRemaining: 0, tokensRemaining: 0 },
        lastError: (error as Error).message,
      }
    }
  }

  /**
   * Transform scraped data to AI analysis input format
   */
  static transformScrapedDataToAIInput(
    listing: any,
    reviews: any[] = [],
    competitors: any[] = [],
    marketContext?: any
  ): AnalysisInputData {
    return {
      listing: {
        title: listing.title || '',
        description: listing.description || '',
        amenities: listing.amenities || [],
        price: listing.price_per_night || 0,
        currency: listing.currency || 'EUR',
        location: listing.location || '',
        ratings: {
          overall: listing.overall_rating || 0,
          accuracy: listing.rating_accuracy,
          cleanliness: listing.rating_cleanliness,
          communication: listing.rating_communication,
          location: listing.rating_location,
          value: listing.rating_value,
          checkin: listing.rating_checkin,
        },
        host: {
          name: listing.host_name || '',
          isSuperhost: listing.host_is_superhost || false,
          responseRate: listing.host_response_rate,
          responseTime: listing.host_response_time,
          about: listing.host_about,
        },
      },
      reviews: reviews.map((review) => ({
        id: review.id || Math.random().toString(),
        text: review.text || review.localizedText || '',
        rating: review.rating,
        language: review.language || 'de',
        createdAt: review.createdAt || new Date().toISOString(),
      })),
      competitors: competitors.map((comp) => ({
        title: comp.title || '',
        price: comp.price || 0,
        rating: comp.rating || 0,
        amenities: comp.amenities || [],
        propertyType: comp.propertyType,
        isSuperhost: comp.isSuperhost || false,
      })),
      marketContext: marketContext || {
        averagePrice:
          competitors.length > 0
            ? competitors.reduce((sum, c) => sum + (c.price || 0), 0) /
              competitors.length
            : 75,
        averageRating:
          competitors.length > 0
            ? competitors.reduce((sum, c) => sum + (c.rating || 0), 0) /
              competitors.length
            : 4.5,
        superhostPercentage:
          competitors.length > 0
            ? (competitors.filter((c) => c.isSuperhost).length /
                competitors.length) *
              100
            : 30,
        location: listing.location || '',
      },
    }
  }

  /**
   * Calculate scoring enhancements based on AI analysis
   */
  private calculateScoringEnhancements(analysis: GeminiAnalysisResult) {
    // Sentiment bonus: up to 50 points for excellent sentiment
    const sentimentBonus = this.calculateSentimentBonus(
      analysis.sentimentAnalysis
    )

    // Description bonus: up to 30 points for high-quality description
    const descriptionBonus = Math.round(
      (analysis.descriptionAnalysis.qualityScore / 100) * 30
    )

    // AI optimization potential: sum of all recommended improvements
    const aiOptimizationPotential = analysis.optimizationRecommendations.reduce(
      (sum, rec) => sum + rec.estimatedScoreImprovement,
      0
    )

    // Confidence adjustment based on data quality
    const avgDataQuality =
      (analysis.analysisMetadata.dataQuality.reviewsQuality +
        analysis.analysisMetadata.dataQuality.competitorDataQuality +
        analysis.analysisMetadata.dataQuality.listingDataCompleteness) /
      3
    const confidenceAdjustment = Math.round((avgDataQuality / 100) * 20)

    return {
      sentimentBonus,
      descriptionBonus,
      aiOptimizationPotential,
      confidenceAdjustment,
    }
  }

  /**
   * Calculate sentiment bonus for scoring system
   */
  private calculateSentimentBonus(sentimentAnalysis: any) {
    const sentiment = sentimentAnalysis.aggregatedSentiment
    const positiveWeight = sentiment.positiveScore * sentiment.confidence
    return Math.round(positiveWeight * 50) // Max 50 bonus points
  }

  /**
   * Create prioritized action plan
   */
  private createPrioritizedActionPlan(analysis: GeminiAnalysisResult) {
    const actions: Array<any> = []

    // Add actions from optimization recommendations
    analysis.optimizationRecommendations.forEach((rec) => {
      rec.recommendations.forEach((action) => {
        actions.push({
          priority: rec.priority,
          category: rec.category,
          action: action.action,
          estimatedImpact:
            action.impact === 'high'
              ? 40
              : action.impact === 'medium'
                ? 25
                : 10,
          effort: action.effort,
          timeline: action.timeline,
        })
      })
    })

    // Add pricing actions if significant opportunity
    if (analysis.pricingRecommendation.confidenceLevel > 70) {
      const currentPrice = 0 // Will be filled with actual current price
      const suggestedPrice = analysis.pricingRecommendation.suggestedPrice
      const priceGap = Math.abs(suggestedPrice - currentPrice) / currentPrice

      if (priceGap > 0.1) {
        // 10% difference
        actions.push({
          priority: 'high' as const,
          category: 'pricing',
          action: `Preis auf ${suggestedPrice}€ anpassen`,
          estimatedImpact: Math.round(priceGap * 100),
          effort: 'low' as const,
          timeline: 'Sofort umsetzbar',
        })
      }
    }

    // Sort by priority and estimated impact
    return actions
      .sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 }
        const aPriority =
          priorityWeight[a.priority as keyof typeof priorityWeight] || 1
        const bPriority =
          priorityWeight[b.priority as keyof typeof priorityWeight] || 1

        if (aPriority !== bPriority) return bPriority - aPriority
        return b.estimatedImpact - a.estimatedImpact
      })
      .slice(0, 10) // Top 10 actions
  }

  /**
   * Create quick action plan for fast analysis
   */
  private createQuickActionPlan(
    sentimentAnalysis: any,
    pricingRecommendation: any
  ) {
    const actions: Array<any> = []

    // Quick sentiment-based action
    if (sentimentAnalysis.aggregatedSentiment.overallSentiment === 'negative') {
      actions.push({
        priority: 'high',
        category: 'reviews',
        action: 'Negative Bewertungsthemen adressieren',
        estimatedImpact: 30,
        effort: 'medium',
        timeline: '1-2 Wochen',
      })
    }

    // Quick pricing action
    if (pricingRecommendation.confidenceLevel > 80) {
      actions.push({
        priority: 'medium',
        category: 'pricing',
        action: `Preisanpassung auf ${pricingRecommendation.suggestedPrice}€`,
        estimatedImpact: 20,
        effort: 'low',
        timeline: 'Sofort',
      })
    }

    return actions
  }

  /**
   * Create service configuration
   */
  private createServiceConfig(): GeminiServiceConfig {
    return {
      apiKey: env.GOOGLE_GEMINI_API_KEY,
      model: 'gemini-1.5-flash', // Cost-optimized model
      region: 'eu',
      timeout: 30000, // 30 seconds
      maxRetries: 3,
      rateLimitPerMinute: 15, // Conservative limit
      enableSafetyFilters: false, // Business analysis doesn't need strict filtering
      defaultTemperature: 0.1,
      defaultMaxTokens: 1024,
    }
  }

  /**
   * Estimate API cost in EUR
   */
  private estimateApiCost(tokensUsed: number): number {
    // Gemini 1.5 Flash pricing: approximately €0.000375 per 1K input tokens
    // Output tokens cost more but we estimate conservatively
    const costPerToken = 0.000000375
    return Math.round(tokensUsed * costPerToken * 100) / 100 // Round to 2 decimal places
  }
}

/**
 * Export singleton service instance
 */
export const geminiService = new GeminiService()

/**
 * Re-export types and components for external use
 */
export * from './types'
export * from './analyzer'
export * from './client'
