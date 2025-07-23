/**
 * @file lib/services/gemini/index.ts
 * @description Main Gemini AI service orchestrator - refactored for CLAUDE.md compliance
 * @created 2025-07-21
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Refactored using modular architecture
 */

import { GeminiClient } from './client'
import { GeminiAnalyzer } from './analyzer'
import { SentimentAnalyzer, PricingAnalyzer } from './analyzer'
import {
  GeminiServiceConfig,
  AnalysisInputData,
  GeminiAnalysisResult,
} from './types'

// Import utility modules
import { transformScrapedDataToAIInput } from './utils/data-transformer'
import {
  calculateScoringEnhancements,
  calculateSentimentBonus,
  estimateApiCost,
} from './utils/scoring-calculator'
import {
  createPrioritizedActionPlan,
  createQuickActionPlan,
} from './utils/action-planner'
import { createServiceConfig } from './utils/config'

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
  private sentimentAnalyzer: SentimentAnalyzer
  private pricingAnalyzer: PricingAnalyzer
  private client: GeminiClient
  private config: GeminiServiceConfig

  constructor() {
    this.config = createServiceConfig()
    this.analyzer = new GeminiAnalyzer(this.config)
    this.sentimentAnalyzer = new SentimentAnalyzer(this.config)
    this.pricingAnalyzer = new PricingAnalyzer(this.config)
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
      const scoringEnhancements = calculateScoringEnhancements(aiAnalysis)

      // Step 3: Create prioritized action plan
      const prioritizedActions = createPrioritizedActionPlan(aiAnalysis)

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
          cost: estimateApiCost(tokensUsed),
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
        this.sentimentAnalyzer.analyzeSentiment(inputData.reviews),
        this.pricingAnalyzer.analyzePricing(
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
          sentimentBonus: calculateSentimentBonus(sentimentAnalysis),
          descriptionBonus: 0,
          aiOptimizationPotential: 0,
          confidenceAdjustment: 0,
        },
        prioritizedActions: createQuickActionPlan(
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
      const canMakeRequest = rateLimitStatus.requestsRemaining > 0

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
  static transformScrapedDataToAIInput = transformScrapedDataToAIInput
}

/**
 * Singleton instance for backward compatibility
 */
export const geminiService = new GeminiService()

/**
 * Default export for main service
 */
export default GeminiService

/**
 * Re-export utility functions for external use
 */
export {
  transformScrapedDataToAIInput,
  calculateScoringEnhancements,
  calculateSentimentBonus,
  createPrioritizedActionPlan,
  createQuickActionPlan,
  estimateApiCost,
}

/**
 * Re-export types
 */
export type {
  GeminiServiceConfig,
  AnalysisInputData,
  GeminiAnalysisResult,
} from './types'
