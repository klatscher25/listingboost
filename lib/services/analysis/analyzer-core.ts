/**
 * @file lib/services/analysis/analyzer-core.ts
 * @description Core comprehensive analysis orchestrator
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Core analyzer logic extracted for CLAUDE.md compliance
 */

import { apifyService, AnalysisResult as ApifyAnalysisResult } from '../apify'
import { geminiService, EnhancedAnalysisResult } from '../gemini'
import { combineRecommendations, calculateDataQuality } from './analyzer-utils'
import type { ComprehensiveAnalysisResult } from './types'

/**
 * Main comprehensive analysis service
 */
export class AnalyzerCore {
  /**
   * Performs comprehensive analysis combining web scraping with AI-powered insights.
   */
  static async analyzeComprehensive(
    airbnbUrl: string,
    userId: string,
    options?: {
      includeReviews?: boolean
      includeAvailability?: boolean
      includeCompetitors?: boolean
      forceUpdate?: boolean
      enableAI?: boolean
      aiAnalysisType?: 'full' | 'quick'
    }
  ): Promise<ComprehensiveAnalysisResult> {
    const startTime = Date.now()
    const processingWarnings: string[] = []

    // Set default options
    const config = {
      includeReviews: true,
      includeAvailability: false,
      includeCompetitors: true,
      forceUpdate: false,
      enableAI: true,
      aiAnalysisType: 'full' as 'full' | 'quick',
      ...options,
    }

    console.log('[EnhancedAnalysisService] Starting comprehensive analysis:', {
      airbnbUrl,
      userId,
      config,
    })

    try {
      // Step 1: Perform Apify scraping analysis
      console.log(
        '[EnhancedAnalysisService] Step 1: Performing Apify analysis...'
      )
      const scrapingStartTime = Date.now()

      const apifyResult = await apifyService.analyzeListing(airbnbUrl, userId, {
        includeReviews: config.includeReviews,
        includeAvailability: config.includeAvailability,
        includeCompetitors: config.includeCompetitors,
        forceUpdate: config.forceUpdate,
      })

      const scrapingTime = Date.now() - scrapingStartTime
      console.log(
        `[EnhancedAnalysisService] Apify analysis completed in ${scrapingTime}ms`
      )

      if (!apifyResult) {
        throw new Error(`Apify analysis failed: no result returned`)
      }

      // Step 2: Perform AI analysis (if enabled)
      let aiResult: EnhancedAnalysisResult | undefined
      let aiAnalysisTime: number | null = null
      let aiSuccessful = false

      if (config.enableAI) {
        const aiAnalysisResult = await this.performAIAnalysis(
          apifyResult,
          config.aiAnalysisType,
          scrapingStartTime
        )
        aiResult = aiAnalysisResult.result
        aiAnalysisTime = aiAnalysisResult.analysisTime
        aiSuccessful = aiAnalysisResult.successful
        if (aiAnalysisResult.warning) {
          processingWarnings.push(aiAnalysisResult.warning)
        }
      } else {
        console.log(
          '[EnhancedAnalysisService] AI analysis disabled by configuration'
        )
      }

      // Step 3: Calculate enhanced scoring
      const scoringResult = this.calculateEnhancedScoring(
        apifyResult,
        aiResult,
        aiSuccessful
      )

      // Step 4: Combine recommendations
      const combinedRecommendations = combineRecommendations(
        apifyResult,
        aiResult,
        aiSuccessful
      )

      // Step 5: Calculate data quality metrics
      const dataQuality = calculateDataQuality(
        apifyResult,
        aiResult,
        aiSuccessful
      )

      const totalTime = Date.now() - startTime

      const result: ComprehensiveAnalysisResult = {
        apifyResult,
        aiResult,
        enhancedScoring: scoringResult,
        combinedRecommendations,
        processingInfo: {
          totalTime,
          scrapingTime,
          aiAnalysisTime,
          timestamp: new Date().toISOString(),
          aiEnabled: config.enableAI,
          aiSuccessful,
          warnings: processingWarnings,
        },
        dataQuality,
      }

      console.log(
        '[EnhancedAnalysisService] Comprehensive analysis completed:',
        {
          totalTime,
          originalScore: scoringResult.originalScore,
          aiEnhancedScore: scoringResult.aiEnhancedScore,
          aiSuccessful,
          recommendationCount: combinedRecommendations.length,
        }
      )

      return result
    } catch (error) {
      console.error(
        '[EnhancedAnalysisService] Comprehensive analysis failed:',
        error
      )
      throw new Error(
        `Comprehensive analysis failed: ${(error as Error).message}`
      )
    }
  }

  /**
   * Quick analysis method for backward compatibility
   */
  static async analyzeQuick(
    airbnbUrl: string,
    userId: string,
    options?: { forceUpdate?: boolean }
  ): Promise<ComprehensiveAnalysisResult> {
    return this.analyzeComprehensive(airbnbUrl, userId, {
      includeReviews: false,
      includeAvailability: false,
      includeCompetitors: false,
      enableAI: false,
      ...options,
    })
  }

  /**
   * Performs AI analysis step
   */
  private static async performAIAnalysis(
    apifyResult: ApifyAnalysisResult,
    aiAnalysisType: 'full' | 'quick',
    startTime: number
  ): Promise<{
    result?: EnhancedAnalysisResult
    analysisTime: number | null
    successful: boolean
    warning?: string
  }> {
    try {
      console.log('[EnhancedAnalysisService] Step 2: Performing AI analysis...')
      const aiStartTime = Date.now()

      // Prepare data for AI analysis
      const listingData = apifyResult.listing

      const aiResult = await geminiService.analyzeWithAI({
        listing: {
          title: listingData.title,
          description: listingData.description,
          amenities: listingData.amenities || [],
          price: parseFloat(listingData.price?.amount || '0'),
          currency: 'EUR',
          location: listingData.location || '',
          ratings: {
            overall: listingData.rating?.guestSatisfaction || 0,
            accuracy: listingData.rating?.accuracy || 0,
            cleanliness: listingData.rating?.cleanliness || 0,
            location: listingData.rating?.location || 0,
            value: listingData.rating?.value || 0,
          },
          host: {
            name: listingData.host?.name || '',
            isSuperhost: listingData.host?.isSuperHost || false,
            responseRate: listingData.host?.responseRate || '0%',
            responseTime: listingData.host?.responseTime || 'unknown',
          },
        },
        reviews: listingData.reviews || [],
        competitors: listingData.competitors || [],
        marketContext: {
          averagePrice: 85,
          averageRating: 4.3,
          superhostPercentage: 30,
          location: listingData.location || 'Unknown',
        },
      })

      const aiAnalysisTime = Date.now() - aiStartTime
      console.log(
        `[EnhancedAnalysisService] AI analysis completed in ${aiAnalysisTime}ms`
      )

      return {
        result: aiResult,
        analysisTime: aiAnalysisTime,
        successful: true,
      }
    } catch (error) {
      const aiAnalysisTime = Date.now() - startTime
      console.warn(
        '[EnhancedAnalysisService] AI analysis failed, continuing without AI insights:',
        error
      )
      return {
        analysisTime: aiAnalysisTime,
        successful: false,
        warning: `AI analysis failed: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Calculates enhanced scoring
   */
  private static calculateEnhancedScoring(
    apifyResult: ApifyAnalysisResult,
    aiResult?: EnhancedAnalysisResult,
    aiSuccessful = false
  ): ComprehensiveAnalysisResult['enhancedScoring'] {
    const originalScore = apifyResult.scoring?.overallScore || 0

    let aiEnhancedScore = originalScore
    let scoreBonus = 0
    let confidenceLevel = 75 // Base confidence

    if (aiResult && aiSuccessful) {
      // Apply AI score bonuses based on AI insights
      const aiConfidence =
        aiResult.aiAnalysis?.analysisMetadata?.confidenceScore || 0
      confidenceLevel = Math.min(95, confidenceLevel + aiConfidence * 0.2)

      // Calculate score improvements from AI recommendations
      const aiRecommendationCount = aiResult.prioritizedActions?.length || 0
      scoreBonus = Math.min(50, aiRecommendationCount * 5) // Max 50 point bonus

      aiEnhancedScore = Math.min(1000, originalScore + scoreBonus)
    }

    return {
      originalScore,
      aiEnhancedScore,
      scoreBonus,
      confidenceLevel,
    }
  }
}
