/**
 * @file lib/types/freemium-api-types.ts
 * @description Type definitions for freemium API
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from api/freemium/analyze/route.ts for CLAUDE.md compliance
 */

import { AirbnbListingData } from '@/lib/services/apify/types'

export interface FreemiumAnalysisResult {
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

export interface FreemiumAnalysisData {
  listing: AirbnbListingData | EnhancedFakeData
  analysis: FreemiumAnalysisResult
  recommendations: string[]
  isRealData: boolean
}

export interface EnhancedFakeData {
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
    isSuperHost: boolean
    profileImage?: string
    responseRate?: string
    responseTime?: string
  }
  price: {
    amount: string
    qualifier: string
    label: string
  }
  images?: Array<{
    url: string
    caption?: string
    orientation?: string
    width?: number
    height?: number
  }>
  amenities: Array<{
    title: string
    values: Array<{
      title: string
      icon: string
      available: boolean
    }>
  }>
}
