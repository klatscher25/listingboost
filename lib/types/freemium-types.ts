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
    // Complete 1000-point system categories (ScoringSystem.md compliant)
    hostPerformance: number // Host Performance & Trust (180 points)
    guestSatisfaction: number // Guest Satisfaction & Reviews (200 points)
    contentOptimization: number // Listing Content & Optimization (180 points)
    visualPresentation: number // Visual Presentation (120 points)
    propertyFeatures: number // Property Features & Amenities (140 points)
    pricingStrategy: number // Pricing Strategy (100 points)
    availabilityBooking: number // Availability & Booking (80 points)
    locationMarket: number // Location & Market Position (60 points)
    businessPerformance: number // Business Performance (40 points)
    trustSafety: number // Trust & Safety (40 points)

    // Simplified categories for freemium display (derived from above)
    title: number // Derived from contentOptimization
    description: number // Derived from contentOptimization
    photos: number // Derived from visualPresentation
    pricing: number // Derived from pricingStrategy
    amenities: number // Derived from propertyFeatures
    location: number // Derived from locationMarket
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
