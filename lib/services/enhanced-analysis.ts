/**
 * @file lib/services/enhanced-analysis.ts
 * @description Combined service integrating Apify scraping with Gemini AI analysis
 * @created 2025-07-21
 * @todo CORE-001-03: Enhanced analysis service integration
 */

import { apifyService, AnalysisResult as ApifyAnalysisResult } from './apify'
import { geminiService, EnhancedAnalysisResult, GeminiService } from './gemini'
import calculateListingScore from '@/lib/scoring'

export interface ComprehensiveAnalysisResult {
  // Core data from Apify
  apifyResult: ApifyAnalysisResult

  // AI insights from Gemini
  aiResult?: EnhancedAnalysisResult

  // Enhanced scoring that combines both
  enhancedScoring: {
    originalScore: number
    aiEnhancedScore: number
    scoreBonus: number
    confidenceLevel: number
  }

  // Combined recommendations
  combinedRecommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low'
    source: 'scraper_data' | 'ai_analysis' | 'combined'
    category: string
    action: string
    impact: number
    effort: 'low' | 'medium' | 'high'
    timeline: string
  }>

  // Processing metadata
  processingInfo: {
    scrapingTime: number
    aiAnalysisTime?: number
    totalTime: number
    aiAnalysisEnabled: boolean
    failureReason?: string
  }
}

/**
 * Enhanced Analysis Service combining scraping and AI
 */
export class EnhancedAnalysisService {
  /**
   * Perform comprehensive analysis with both scraping and AI
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
    const {
      includeReviews = true,
      includeAvailability = false,
      includeCompetitors = true,
      forceUpdate = false,
      enableAI = true,
      aiAnalysisType = 'full',
    } = options || {}

    console.log('[EnhancedAnalysis] Starte umfassende Analyse:', {
      url: airbnbUrl,
      enableAI,
      aiAnalysisType,
    })

    const totalStartTime = Date.now()
    let apifyResult: ApifyAnalysisResult
    let aiResult: EnhancedAnalysisResult | undefined
    let scrapingTime = 0
    let aiAnalysisTime = 0
    let failureReason: string | undefined

    try {
      // Step 1: Scrape data using Apify with timeout
      console.log('[EnhancedAnalysis] Phase 1: Apify Scraping...')
      const scrapingStartTime = Date.now()

      // Create timeout for scraping (60 seconds)
      const scrapingTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Scraping-Timeout nach 60 Sekunden erreicht'))
        }, 60000)
      })

      const scrapingPromise = apifyService.analyzeListing(airbnbUrl, userId, {
        includeReviews,
        includeAvailability,
        includeCompetitors,
        forceUpdate,
      })

      apifyResult = await Promise.race([
        scrapingPromise,
        scrapingTimeoutPromise,
      ])

      scrapingTime = Date.now() - scrapingStartTime
      console.log(
        `[EnhancedAnalysis] Scraping abgeschlossen in ${scrapingTime}ms`
      )

      // Step 2: AI Analysis (if enabled and service available)
      if (enableAI) {
        try {
          console.log('[EnhancedAnalysis] Phase 2: AI-Analyse...')
          const aiStartTime = Date.now()

          // Check if Gemini service is available
          const serviceHealth = await geminiService.checkServiceHealth()
          if (!serviceHealth.healthy) {
            throw new Error(
              `Gemini Service nicht verfügbar: ${serviceHealth.lastError || 'Unbekannter Fehler'}`
            )
          }

          // Transform scraped data for AI analysis
          const aiInputData = GeminiService.transformScrapedDataToAIInput(
            apifyResult.listing,
            apifyResult.scrapingMetadata.dataCompleteness?.reviews ? [] : [], // Reviews not directly available
            [] // Competitors data would need to be extracted from scrapingMetadata
          )

          // Perform AI analysis
          if (aiAnalysisType === 'full') {
            aiResult = await geminiService.analyzeWithAI(aiInputData)
          } else {
            const quickResult =
              await geminiService.quickAnalyzeWithAI(aiInputData)
            aiResult = quickResult as EnhancedAnalysisResult
          }

          aiAnalysisTime = Date.now() - aiStartTime
          console.log(
            `[EnhancedAnalysis] AI-Analyse abgeschlossen in ${aiAnalysisTime}ms`
          )
        } catch (aiError) {
          console.warn('[EnhancedAnalysis] AI-Analyse fehlgeschlagen:', aiError)
          failureReason = `AI-Analyse fehlgeschlagen: ${(aiError as Error).message}`
          // Continue without AI analysis
        }
      }

      // Step 3: Combine results and create enhanced scoring
      const enhancedScoring = this.calculateEnhancedScoring(
        apifyResult,
        aiResult
      )
      const combinedRecommendations = this.createCombinedRecommendations(
        apifyResult,
        aiResult
      )

      const totalTime = Date.now() - totalStartTime

      const result: ComprehensiveAnalysisResult = {
        apifyResult,
        aiResult,
        enhancedScoring,
        combinedRecommendations,
        processingInfo: {
          scrapingTime,
          aiAnalysisTime: aiAnalysisTime > 0 ? aiAnalysisTime : undefined,
          totalTime,
          aiAnalysisEnabled: enableAI && !!aiResult,
          failureReason,
        },
      }

      console.log('[EnhancedAnalysis] Umfassende Analyse abgeschlossen:', {
        totalTime,
        scrapingTime,
        aiAnalysisTime: aiResult ? aiAnalysisTime : 'N/A',
        originalScore: enhancedScoring.originalScore,
        enhancedScore: enhancedScoring.aiEnhancedScore,
        recommendationCount: combinedRecommendations.length,
      })

      return result
    } catch (error) {
      console.error('[EnhancedAnalysis] Analyse fehlgeschlagen:', error)
      throw new Error(
        `Umfassende Analyse fehlgeschlagen: ${(error as Error).message}`
      )
    }
  }

  /**
   * Quick analysis optimized for speed
   */
  static async analyzeQuick(
    airbnbUrl: string,
    userId: string,
    enableAI = false
  ): Promise<ComprehensiveAnalysisResult> {
    console.log('[EnhancedAnalysis] Starte optimierte Schnell-Analyse:', {
      url: airbnbUrl,
      enableAI,
    })

    const totalStartTime = Date.now()
    let apifyResult: ApifyAnalysisResult
    let aiResult: EnhancedAnalysisResult | undefined
    let scrapingTime = 0
    let aiAnalysisTime = 0
    let failureReason: string | undefined

    try {
      // Step 1: Use quick Apify analysis with timeout (much faster)
      console.log('[EnhancedAnalysis] Phase 1: Schnelles Apify-Scraping...')
      const scrapingStartTime = Date.now()

      // Create timeout for quick scraping (30 seconds)
      const scrapingTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error('Schnell-Scraping-Timeout nach 30 Sekunden erreicht')
          )
        }, 30000)
      })

      const scrapingPromise = apifyService.quickAnalyze(airbnbUrl, userId)

      apifyResult = await Promise.race([
        scrapingPromise,
        scrapingTimeoutPromise,
      ])

      scrapingTime = Date.now() - scrapingStartTime
      console.log(
        `[EnhancedAnalysis] Schnelles Scraping abgeschlossen in ${scrapingTime}ms`
      )

      // Step 2: AI Analysis (if enabled and service available)
      if (enableAI) {
        try {
          console.log('[EnhancedAnalysis] Phase 2: Schnelle AI-Analyse...')
          const aiStartTime = Date.now()

          // Check if Gemini service is available
          const serviceHealth = await geminiService.checkServiceHealth()
          if (!serviceHealth.healthy) {
            throw new Error(
              `Gemini Service nicht verfügbar: ${serviceHealth.lastError || 'Unbekannter Fehler'}`
            )
          }

          // Transform scraped data for AI analysis
          const aiInputData = GeminiService.transformScrapedDataToAIInput(
            apifyResult.listing,
            [], // No reviews in quick analysis
            [] // No competitors in quick analysis
          )

          // Perform quick AI analysis
          const quickResult =
            await geminiService.quickAnalyzeWithAI(aiInputData)
          aiResult = quickResult as EnhancedAnalysisResult

          aiAnalysisTime = Date.now() - aiStartTime
          console.log(
            `[EnhancedAnalysis] Schnelle AI-Analyse abgeschlossen in ${aiAnalysisTime}ms`
          )
        } catch (aiError) {
          console.warn('[EnhancedAnalysis] AI-Analyse fehlgeschlagen:', aiError)
          failureReason = `AI-Analyse fehlgeschlagen: ${(aiError as Error).message}`
          // Continue without AI analysis
        }
      }

      // Step 3: Combine results and create enhanced scoring
      const enhancedScoring = this.calculateEnhancedScoring(
        apifyResult,
        aiResult
      )
      const combinedRecommendations = this.createCombinedRecommendations(
        apifyResult,
        aiResult
      )

      const totalTime = Date.now() - totalStartTime

      const result: ComprehensiveAnalysisResult = {
        apifyResult,
        aiResult,
        enhancedScoring,
        combinedRecommendations,
        processingInfo: {
          scrapingTime,
          aiAnalysisTime: aiAnalysisTime > 0 ? aiAnalysisTime : undefined,
          totalTime,
          aiAnalysisEnabled: enableAI && !!aiResult,
          failureReason,
        },
      }

      console.log('[EnhancedAnalysis] Schnell-Analyse abgeschlossen:', {
        totalTime,
        scrapingTime,
        aiAnalysisTime: aiResult ? aiAnalysisTime : 'N/A',
        originalScore: enhancedScoring.originalScore,
        enhancedScore: enhancedScoring.aiEnhancedScore,
        recommendationCount: combinedRecommendations.length,
      })

      return result
    } catch (error) {
      console.error('[EnhancedAnalysis] Schnell-Analyse fehlgeschlagen:', error)
      throw new Error(
        `Schnell-Analyse fehlgeschlagen: ${(error as Error).message}`
      )
    }
  }

  /**
   * Calculate enhanced scoring combining traditional scoring with AI insights
   */
  private static calculateEnhancedScoring(
    apifyResult: ApifyAnalysisResult,
    aiResult?: EnhancedAnalysisResult
  ) {
    const originalScore = apifyResult.scoring?.totalScore || 0
    let scoreBonus = 0
    let confidenceLevel = 75 // Base confidence without AI

    if (aiResult?.scoringEnhancements) {
      const enhancements = aiResult.scoringEnhancements
      scoreBonus =
        enhancements.sentimentBonus +
        enhancements.descriptionBonus +
        enhancements.confidenceAdjustment

      confidenceLevel = aiResult.aiAnalysis.analysisMetadata.confidenceScore
    }

    const aiEnhancedScore = Math.min(1000, originalScore + scoreBonus)

    return {
      originalScore,
      aiEnhancedScore,
      scoreBonus,
      confidenceLevel,
    }
  }

  /**
   * Create combined recommendations from both scraper data and AI analysis
   */
  private static createCombinedRecommendations(
    apifyResult: ApifyAnalysisResult,
    aiResult?: EnhancedAnalysisResult
  ) {
    const recommendations: Array<any> = []

    // Add basic recommendations based on scraper data
    const listing = apifyResult.listing
    const scoring = apifyResult.scoring

    // Basic scoring-based recommendations
    if (scoring && scoring.totalScore < 700) {
      recommendations.push({
        priority: 'high' as const,
        source: 'scraper_data' as const,
        category: 'overall_quality',
        action: 'Listing-Qualität verbessern - Score unter 70%',
        impact: 50,
        effort: 'medium' as const,
        timeline: '1-2 Wochen',
      })
    }

    // Photo recommendations
    if (listing.images_count && listing.images_count < 10) {
      recommendations.push({
        priority: 'medium' as const,
        source: 'scraper_data' as const,
        category: 'photos',
        action: `Mehr Fotos hinzufügen (aktuell: ${listing.images_count}, empfohlen: 15+)`,
        impact: 30,
        effort: 'low' as const,
        timeline: 'Diese Woche',
      })
    }

    // Add AI-powered recommendations
    if (aiResult?.prioritizedActions) {
      aiResult.prioritizedActions.forEach((action) => {
        recommendations.push({
          ...action,
          source: 'ai_analysis' as const,
          impact: action.estimatedImpact,
        })
      })
    }

    // Combined recommendations based on both data sources
    if (aiResult && scoring) {
      // Price optimization recommendation
      if (aiResult.aiAnalysis?.pricingRecommendation) {
        const pricing = aiResult.aiAnalysis.pricingRecommendation
        if (pricing.confidenceLevel > 80) {
          recommendations.push({
            priority: 'medium' as const,
            source: 'combined' as const,
            category: 'pricing',
            action: `Preisoptimierung: ${pricing.suggestedPrice}€ (aktuell: ${listing.price_per_night}€)`,
            impact: Math.abs(
              pricing.suggestedPrice - (listing.price_per_night || 0)
            ),
            effort: 'low' as const,
            timeline: 'Sofort umsetzbar',
          })
        }
      }
    }

    // Sort by priority and impact
    return recommendations
      .sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 }
        const aPriority =
          priorityWeight[a.priority as keyof typeof priorityWeight] || 1
        const bPriority =
          priorityWeight[b.priority as keyof typeof priorityWeight] || 1

        if (aPriority !== bPriority) return bPriority - aPriority
        return b.impact - a.impact
      })
      .slice(0, 15) // Top 15 recommendations
  }

  /**
   * Check service availability and health
   */
  static async checkServiceHealth(): Promise<{
    apifyHealthy: boolean
    geminiHealthy: boolean
    overallHealthy: boolean
    details: any
  }> {
    try {
      const [apifyHealth, geminiHealth] = await Promise.all([
        apifyService.getServiceStatus(),
        geminiService.checkServiceHealth(),
      ])

      return {
        apifyHealthy: apifyHealth.healthy,
        geminiHealthy: geminiHealth.healthy,
        overallHealthy: apifyHealth.healthy, // Apify is required, Gemini is optional
        details: {
          apify: apifyHealth,
          gemini: geminiHealth,
        },
      }
    } catch (error) {
      return {
        apifyHealthy: false,
        geminiHealthy: false,
        overallHealthy: false,
        details: { error: (error as Error).message },
      }
    }
  }
}

// Export for use in API routes
export const enhancedAnalysisService = EnhancedAnalysisService
