/**
 * @file lib/services/gemini/utils/data-transformer.ts
 * @description Data transformation utilities for Gemini AI service
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-02: Extracted from index.ts for CLAUDE.md compliance
 */

import { AnalysisInputData } from '../types'

/**
 * Transform scraped data to AI analysis input format
 */
export function transformScrapedDataToAIInput(
  listing: any,
  reviews: any[] = [],
  competitors: any[] = [],
  marketContext?: any
): AnalysisInputData {
  return {
    listing: {
      title: listing.title || '',
      description: listing.description || '',
      amenities: listing.amenities || [],
      price: listing.price_per_night || 0,
      currency: listing.currency || 'EUR',
      location: listing.location || '',
      ratings: {
        overall: listing.overall_rating || 0,
        accuracy: listing.rating_accuracy,
        cleanliness: listing.rating_cleanliness,
        communication: listing.rating_communication,
        location: listing.rating_location,
        value: listing.rating_value,
        checkin: listing.rating_checkin,
      },
      host: {
        name: listing.host_name || '',
        isSuperhost: listing.host_is_superhost || false,
        responseRate: listing.host_response_rate,
        responseTime: listing.host_response_time,
        about: listing.host_about,
      },
    },
    reviews: reviews.map((review) => ({
      id: review.id || Math.random().toString(),
      text: review.text || review.localizedText || '',
      rating: review.rating,
      language: review.language || 'de',
      createdAt: review.createdAt || new Date().toISOString(),
    })),
    competitors: competitors.map((comp) => ({
      title: comp.title || '',
      price: comp.price || 0,
      rating: comp.rating || 0,
      amenities: comp.amenities || [],
      propertyType: comp.propertyType,
      isSuperhost: comp.isSuperhost || false,
    })),
    marketContext: marketContext || {
      averagePrice:
        competitors.length > 0
          ? competitors.reduce((sum, c) => sum + (c.price || 0), 0) /
            competitors.length
          : 75,
      averageRating:
        competitors.length > 0
          ? competitors.reduce((sum, c) => sum + (c.rating || 0), 0) /
            competitors.length
          : 4.5,
      superhostPercentage:
        competitors.length > 0
          ? (competitors.filter((c) => c.isSuperhost).length /
              competitors.length) *
            100
          : 30,
      location: listing.location || '',
    },
  }
}
