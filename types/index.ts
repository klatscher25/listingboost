// Core types for ListingBoost Pro

export interface User {
  id: string
  email: string
  name?: string
  plan: 'free' | 'starter' | 'growth' | 'professional'
  createdAt: Date
  updatedAt: Date
}

export interface Listing {
  id: string
  userId: string
  airbnbUrl: string
  title: string
  description: string
  price: number
  score?: number
  lastAnalyzed?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AnalysisResult {
  id: string
  listingId: string
  score: number
  recommendations: Recommendation[]
  metrics: AnalysisMetrics
  createdAt: Date
}

export interface Recommendation {
  category: 'title' | 'description' | 'pricing' | 'photos' | 'amenities'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: number
}

export interface AnalysisMetrics {
  titleScore: number
  descriptionScore: number
  pricingScore: number
  photosScore: number
  amenitiesScore: number
}
