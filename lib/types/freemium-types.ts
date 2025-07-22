/**
 * @file lib/types/freemium-types.ts
 * @description Type definitions for freemium dashboard system
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from app/freemium/dashboard/[token]/page.tsx for CLAUDE.md compliance
 */

export interface AmenityValue {
  title: string
  icon: string
  available: boolean
}

export interface Amenity {
  title: string
  values: AmenityValue[]
}

export interface ListingImage {
  url: string
  caption?: string
  orientation?: string
  width?: number
  height?: number
}

export interface ListingData {
  id: string
  url: string
  title: string
  description: string
  propertyType: string
  roomType: string
  personCapacity: number
  bedrooms?: number
  beds?: number
  baths?: number
  rating: {
    guestSatisfaction: number
    accuracy: number
    cleanliness: number
    location: number
    value: number
    reviewsCount: number
  }
  host: {
    id: string
    name: string
    firstName?: string
    isSuperHost: boolean
    profileImage?: string
    about?: string[]
    highlights?: string[]
    responseRate?: string
    responseTime?: string
    timeAsHost?: string
    verificationLevel?: string
  }
  price: {
    amount: string
    qualifier: string
    label: string
  }
  images?: ListingImage[]
  amenities: Amenity[]
}

export interface AnalysisResult {
  overallScore: number
  categoryScores: {
    title: number
    description: number
    photos: number
    pricing: number
    amenities: number
    location: number
  }
}

export interface FreemiumAIInsights {
  listingOptimization: {
    titleScore: number
    titleSuggestions: string[]
    descriptionScore: number
    descriptionImprovements: string[]
    photoScore: number
    photoRecommendations: string[]
    amenityScore: number
    missingAmenities: string[]
  }
  hostCredibility: {
    currentScore: number
    improvementTips: string[]
    superhostBenefits: string[]
  }
  seasonalOptimization: {
    currentSeason: string
    seasonalTips: string[]
    pricingHints: string[]
  }
  ratingImprovement: {
    currentStrengths: string[]
    improvementAreas: string[]
    guestExperienceTips: string[]
  }
  amenityGapAnalysis: {
    criticalGaps: string[]
    budgetFriendlyUpgrades: string[]
    highImpactAdditions: string[]
  }
}

export interface FreemiumData {
  listing: ListingData
  analysis: AnalysisResult
  recommendations: string[]
  isRealData: boolean
}

export interface AIInsightsResponse {
  insights: FreemiumAIInsights
  metadata: {
    generatedAt: string
    processingTime: number
    model: string
    language: string
    token: string
  }
}
