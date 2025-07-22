/**
 * @file lib/services/gemini/utils.ts
 * @description Utility functions for Gemini service
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from analyzer.ts for CLAUDE.md compliance
 */

import { ReviewSentimentAnalysis } from './types'

/**
 * Create empty sentiment analysis result
 */
export function createEmptySentimentAnalysis(): ReviewSentimentAnalysis {
  return {
    reviews: [],
    aggregatedSentiment: {
      overallSentiment: 'neutral',
      confidence: 0.0,
      positiveScore: 0.0,
      negativeScore: 0.0,
      neutralScore: 1.0,
      keyThemes: [],
      emotionalTone: [],
      language: 'de',
      analysisDate: new Date().toISOString(),
    },
    themeSummary: {},
  }
}

/**
 * Calculate overall confidence score from multiple confidence scores
 */
export function calculateOverallConfidence(confidenceScores: number[]): number {
  if (confidenceScores.length === 0) return 0.0
  return (
    confidenceScores.reduce((sum, score) => sum + score, 0) /
    confidenceScores.length
  )
}

/**
 * Calculate data completeness score based on available data
 */
export function calculateDataCompleteness(
  hasTitle: boolean,
  hasDescription: boolean,
  hasReviews: boolean,
  hasAmenities: boolean,
  hasPrice: boolean
): number {
  const factors = [hasTitle, hasDescription, hasReviews, hasAmenities, hasPrice]
  const completenessScore = factors.filter(Boolean).length / factors.length
  return Math.round(completenessScore * 100) / 100
}

/**
 * Validate and clean JSON response from AI
 */
export function validateAndCleanJsonResponse(response: string): any {
  try {
    // Clean common issues with AI-generated JSON
    let cleanedResponse = response.trim()

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse
        .replace(/```json\n?/, '')
        .replace(/\n?```$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse
        .replace(/```\n?/, '')
        .replace(/\n?```$/, '')
    }

    // Remove any text before the first {
    const firstBrace = cleanedResponse.indexOf('{')
    if (firstBrace > 0) {
      cleanedResponse = cleanedResponse.substring(firstBrace)
    }

    // Remove any text after the last }
    const lastBrace = cleanedResponse.lastIndexOf('}')
    if (lastBrace > -1 && lastBrace < cleanedResponse.length - 1) {
      cleanedResponse = cleanedResponse.substring(0, lastBrace + 1)
    }

    return JSON.parse(cleanedResponse)
  } catch (error) {
    console.warn('[Gemini Utils] Failed to parse JSON response:', error)
    console.warn(
      '[Gemini Utils] Raw response:',
      response.substring(0, 200) + '...'
    )
    return null
  }
}

/**
 * Extract relevant amenities from mixed amenity data
 */
export function extractRelevantAmenities(amenities: any[]): string[] {
  const relevantAmenities: string[] = []

  for (const amenity of amenities) {
    if (typeof amenity === 'string') {
      relevantAmenities.push(amenity)
    } else if (typeof amenity === 'object' && amenity !== null) {
      if (amenity.available && (amenity.name || amenity.title)) {
        relevantAmenities.push(amenity.name || amenity.title)
      }

      // Check for nested values array
      if (Array.isArray(amenity.values)) {
        for (const value of amenity.values) {
          if (value.available && value.title) {
            relevantAmenities.push(value.title)
          }
        }
      }
    }
  }

  return relevantAmenities
}

/**
 * Calculate pricing tier based on price amount
 */
export function calculatePricingTier(
  priceAmount: string | number
): 'budget' | 'mid-range' | 'luxury' {
  const price =
    typeof priceAmount === 'string'
      ? parseFloat(priceAmount.replace(/[^\d.,]/g, '').replace(',', '.'))
      : priceAmount

  if (isNaN(price)) return 'mid-range'

  // German market pricing tiers (EUR per night)
  if (price < 60) return 'budget'
  if (price < 150) return 'mid-range'
  return 'luxury'
}

/**
 * Truncate text while preserving word boundaries
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}

/**
 * Generate analysis metadata
 */
export function generateAnalysisMetadata(
  startTime: number,
  tokensUsed: number,
  model: string = 'gemini-pro'
): {
  processingTime: number
  tokensUsed: number
  model: string
  timestamp: string
} {
  return {
    processingTime: Date.now() - startTime,
    tokensUsed,
    model,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Merge confidence scores with weights
 */
export function mergeConfidenceScores(
  scores: { value: number; weight: number }[]
): number {
  if (scores.length === 0) return 0

  const totalWeight = scores.reduce((sum, score) => sum + score.weight, 0)
  if (totalWeight === 0) return 0

  const weightedSum = scores.reduce(
    (sum, score) => sum + score.value * score.weight,
    0
  )
  return Math.round((weightedSum / totalWeight) * 100) / 100
}

/**
 * Sanitize text input for AI prompts
 */
export function sanitizeTextInput(
  text: string,
  maxLength: number = 1000
): string {
  return text
    .replace(/[^\w\s\-.,!?äöüÄÖÜß]/g, '') // Keep only safe characters including German umlauts
    .substring(0, maxLength)
    .trim()
}

/**
 * Create fallback analysis result when AI fails
 */
export function createFallbackAnalysisResult(
  inputData: any,
  analysisType: string
): any {
  const baseResult = {
    confidenceScore: 0.1,
    fallback: true,
    analysisType,
    processedAt: new Date().toISOString(),
  }

  switch (analysisType) {
    case 'sentiment':
      return {
        ...baseResult,
        ...createEmptySentimentAnalysis(),
        improvementAreas: [
          'Mehr Bewertungen sammeln',
          'Gäste-Feedback aktiv einholen',
        ],
      }

    case 'description':
      return {
        ...baseResult,
        titleAnalysis: {
          clarity: 5,
          appeal: 5,
          keywords: [],
          improvements: ['Titel überarbeiten', 'Keywords hinzufügen'],
          lengthOptimal: false,
        },
        descriptionAnalysis: {
          completeness: 4,
          engagement: 4,
          structure: 4,
          missingElements: ['Detailierte Beschreibung', 'Highlights'],
          strengths: [],
          improvements: ['Beschreibung erweitern', 'Struktur verbessern'],
        },
      }

    case 'amenity':
      return {
        ...baseResult,
        missingEssentials: [
          { name: 'WLAN', importance: 'critical', impactOnBookings: 95 },
        ],
        missingComfort: [],
        luxuryUpgrades: [],
        competitiveGaps: [],
        priorityRecommendations: [],
      }

    case 'pricing':
      return {
        ...baseResult,
        priceAssessment: {
          currentPrice: 0,
          marketPosition: 'unknown',
          competitiveness: 5.0,
          valuePerception: 5.0,
        },
        recommendedPricing: { basePrice: 0 },
        actionableInsights: ['Marktanalyse durchführen', 'Preise überprüfen'],
      }

    default:
      return baseResult
  }
}
