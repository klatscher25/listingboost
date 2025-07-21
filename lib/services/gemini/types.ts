/**
 * @file lib/services/gemini/types.ts
 * @description TypeScript types for Google Gemini AI service integration
 * @created 2025-07-21
 * @todo CORE-001-03: Gemini AI Analysis Engine types
 */

// Base Gemini AI Request/Response Types
export interface GeminiRequest {
  contents: GeminiContent[]
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
    maxOutputTokens?: number
    candidateCount?: number
    stopSequences?: string[]
  }
  safetySettings?: GeminiSafetySetting[]
}

export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

export interface GeminiPart {
  text: string
}

export interface GeminiSafetySetting {
  category:
    | 'HARM_CATEGORY_HARASSMENT'
    | 'HARM_CATEGORY_HATE_SPEECH'
    | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
    | 'HARM_CATEGORY_DANGEROUS_CONTENT'
  threshold:
    | 'BLOCK_NONE'
    | 'BLOCK_ONLY_HIGH'
    | 'BLOCK_MEDIUM_AND_ABOVE'
    | 'BLOCK_LOW_AND_ABOVE'
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[]
  promptFeedback?: {
    blockReason?: string
    safetyRatings?: GeminiSafetyRating[]
  }
}

export interface GeminiCandidate {
  content?: GeminiContent
  finishReason?:
    | 'FINISH_REASON_UNSPECIFIED'
    | 'STOP'
    | 'MAX_TOKENS'
    | 'SAFETY'
    | 'RECITATION'
    | 'OTHER'
  safetyRatings?: GeminiSafetyRating[]
}

export interface GeminiSafetyRating {
  category: string
  probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH'
}

// Gemini Error Types
export interface GeminiError extends Error {
  status?: number
  code?: string
  details?: string
  type: 'GEMINI_ERROR'
  retryAfter?: number
}

// Analysis Types for Business Logic
export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative'
  confidence: number // 0-1
  positiveScore: number // 0-1
  negativeScore: number // 0-1
  neutralScore: number // 0-1
  keyThemes: string[]
  emotionalTone: string[]
  language: 'de' | 'en' | 'other'
  analysisDate: string
}

export interface ReviewSentimentAnalysis {
  reviews: Array<{
    reviewId: string
    text: string
    sentiment: SentimentAnalysis
    keyInsights: string[]
  }>
  aggregatedSentiment: SentimentAnalysis
  themeSummary: {
    [theme: string]: {
      mentionCount: number
      averageSentiment: number
      keyPoints: string[]
    }
  }
}

export interface DescriptionAnalysis {
  qualityScore: number // 0-100
  readabilityScore: number // 0-100
  keywordDensity: {
    [keyword: string]: number
  }
  missingElements: string[]
  improvementSuggestions: string[]
  strengthsIdentified: string[]
  languageQuality: {
    grammar: number // 0-100
    clarity: number // 0-100
    appeal: number // 0-100
  }
  suggestedRewrite?: string
}

export interface AmenityGapAnalysis {
  missingAmenities: Array<{
    amenity: string
    importance: 'high' | 'medium' | 'low'
    competitorAdoptionRate: number // 0-100
    estimatedImpact: string
  }>
  strengthAmenities: string[]
  marketComparison: {
    averageAmenityCount: number
    topPerformerAmenities: string[]
    gapScore: number // 0-100
  }
  recommendations: string[]
}

export interface PricingRecommendation {
  suggestedPrice: number
  priceRange: {
    minimum: number
    optimal: number
    maximum: number
  }
  reasoning: string[]
  marketPosition: 'budget' | 'mid-range' | 'premium' | 'luxury'
  competitiveAdvantage: string[]
  seasonalAdjustments?: {
    [season: string]: {
      priceMultiplier: number
      reasoning: string
    }
  }
  confidenceLevel: number // 0-100
}

export interface OptimizationRecommendations {
  priority: 'low' | 'medium' | 'high' | 'critical'
  category:
    | 'pricing'
    | 'amenities'
    | 'description'
    | 'photos'
    | 'host_profile'
    | 'reviews'
  recommendations: Array<{
    action: string
    impact: 'low' | 'medium' | 'high'
    effort: 'low' | 'medium' | 'high'
    timeline: string
    expectedResult: string
  }>
  estimatedScoreImprovement: number // Points out of 1000
}

// Comprehensive AI Analysis Result
export interface GeminiAnalysisResult {
  listingId: string
  analyzedAt: string

  // Core Analysis Components
  sentimentAnalysis: ReviewSentimentAnalysis
  descriptionAnalysis: DescriptionAnalysis
  amenityGapAnalysis: AmenityGapAnalysis
  pricingRecommendation: PricingRecommendation

  // Action Items
  optimizationRecommendations: OptimizationRecommendations[]

  // Meta Information
  analysisMetadata: {
    tokensUsed: number
    processingTime: number
    confidenceScore: number // 0-100
    dataQuality: {
      reviewsQuality: number // 0-100
      competitorDataQuality: number // 0-100
      listingDataCompleteness: number // 0-100
    }
  }
}

// Input Data Structure for Analysis
export interface AnalysisInputData {
  listing: {
    title: string
    description: string
    amenities: any[]
    price: number
    currency: string
    location: string
    ratings: {
      overall: number
      accuracy?: number
      cleanliness?: number
      communication?: number
      location?: number
      value?: number
      checkin?: number
    }
    host: {
      name: string
      isSuperhost: boolean
      responseRate?: string
      responseTime?: string
      about?: string
    }
  }
  reviews: Array<{
    id: string
    text: string
    rating?: number
    language?: string
    createdAt: string
  }>
  competitors: Array<{
    title: string
    price: number
    rating: number
    amenities?: string[]
    propertyType?: string
    isSuperhost?: boolean
  }>
  marketContext: {
    averagePrice: number
    averageRating: number
    superhostPercentage: number
    location: string
  }
}

// Configuration for Gemini Service
export interface GeminiServiceConfig {
  apiKey: string
  model: 'gemini-1.5-pro' | 'gemini-1.5-flash'
  region: 'us' | 'eu'
  timeout: number
  maxRetries: number
  rateLimitPerMinute: number
  enableSafetyFilters: boolean
  defaultTemperature: number
  defaultMaxTokens: number
}

// Rate Limiting Types
export interface RateLimitInfo {
  requestsRemaining: number
  resetTime: number
  tokensUsed: number
  tokensRemaining: number
}
