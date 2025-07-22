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
    title: number
    description: number
    photos: number
    pricing: number
    amenities: number
    location: number
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
