/**
 * @file lib/services/gemini/comprehensive-analyzer.ts
 * @description Main comprehensive analyzer orchestrating all AI analysis services
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Refactored for CLAUDE.md compliance - main orchestrator
 */

import { SentimentAnalyzer } from './analyzers/sentiment-analyzer'
import { DescriptionAnalyzer } from './analyzers/description-analyzer'
import { AmenityGapAnalyzer } from './analyzers/amenity-gap-analyzer'
import { PricingAnalyzer } from './analyzers/pricing-analyzer'
import { OptimizationAnalyzer } from './analyzers/optimization-analyzer'
import type {
  AnalysisInputData,
  GeminiAnalysisResult,
  GeminiServiceConfig,
} from './types'

/**
 * Comprehensive AI Analyzer orchestrating all specialized analyzers
 */
export class ComprehensiveAnalyzer {
  private sentimentAnalyzer: SentimentAnalyzer
  private descriptionAnalyzer: DescriptionAnalyzer
  private amenityGapAnalyzer: AmenityGapAnalyzer
  private pricingAnalyzer: PricingAnalyzer
  private optimizationAnalyzer: OptimizationAnalyzer

  constructor(config: GeminiServiceConfig) {
    this.sentimentAnalyzer = new SentimentAnalyzer(config)
    this.descriptionAnalyzer = new DescriptionAnalyzer(config)
    this.amenityGapAnalyzer = new AmenityGapAnalyzer(config)
    this.pricingAnalyzer = new PricingAnalyzer(config)
    this.optimizationAnalyzer = new OptimizationAnalyzer(config)
  }

  /**
   * Perform comprehensive AI analysis of a listing
   */
  async analyzeComprehensive(
    data: AnalysisInputData
  ): Promise<GeminiAnalysisResult> {
    console.log('[ComprehensiveAnalyzer] Starte umfassende AI-Analyse...')

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
        this.sentimentAnalyzer.analyzeSentiment(data.reviews),
        this.descriptionAnalyzer.analyzeDescription(data.listing),
        this.amenityGapAnalyzer.analyzeAmenityGaps(
          data.listing,
          data.competitors
        ),
        this.pricingAnalyzer.analyzePricing(
          data.listing,
          data.competitors,
          data.marketContext
        ),
      ])

      // Generate optimization recommendations based on all analysis
      const optimizationRecommendations =
        await this.optimizationAnalyzer.generateOptimizationRecommendations({
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

      console.log(
        '[ComprehensiveAnalyzer] AI-Analyse erfolgreich abgeschlossen:',
        {
          processingTime,
          tokensUsed: totalTokensUsed,
          confidenceScore: result.analysisMetadata.confidenceScore,
        }
      )

      return result
    } catch (error) {
      console.error('[ComprehensiveAnalyzer] AI-Analyse fehlgeschlagen:', error)
      throw new Error(`AI-Analyse fehlgeschlagen: ${(error as Error).message}`)
    }
  }

  /**
   * Calculate overall confidence score from individual confidence scores
   */
  private calculateOverallConfidence(confidenceScores: number[]): number {
    const average =
      confidenceScores.reduce((sum, score) => sum + score, 0) /
      confidenceScores.length
    return Math.round(average * 100)
  }

  /**
   * Calculate data completeness score for a listing
   */
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
