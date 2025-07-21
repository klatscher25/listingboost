/**
 * @file lib/services/apify/transformer/main-transformer.ts
 * @description Main transformer class (backward compatibility wrapper)
 * @created 2025-07-21
 * @todo CORE-001-02: Main transformer class
 */

import { Database } from '@/types/database'
import { AirbnbListingData, ComprehensiveListingData } from '../types'
import { transformListingData } from './listing-transformer'
import {
  transformReviewData,
  transformAvailabilityData,
  transformCompetitorData,
  createScoringDataPackage,
} from './analysis-transformer'

type ListingRow = Database['public']['Tables']['listings']['Row']

/**
 * Transform Apify scraper data to database schema format
 */
export class ApifyDataTransformer {
  /**
   * Transform main listing data from URL scraper
   */
  static transformListingData = transformListingData

  /**
   * Transform reviews data for sentiment analysis
   */
  static transformReviewData = transformReviewData

  /**
   * Transform availability data for occupancy analysis
   */
  static transformAvailabilityData = transformAvailabilityData

  /**
   * Transform competitor data for market analysis
   */
  static transformCompetitorData = transformCompetitorData

  /**
   * Create comprehensive data package for scoring system
   */
  static createScoringDataPackage(
    comprehensiveData: ComprehensiveListingData,
    userId: string
  ) {
    return createScoringDataPackage(comprehensiveData, userId, (data, userId) =>
      transformListingData(data as AirbnbListingData, userId)
    )
  }

  /**
   * Update existing listing with new scraped data
   */
  static updateListingWithScrapedData(
    existingListing: ListingRow,
    scrapedData: AirbnbListingData
  ): Partial<ListingRow> {
    const transformed = transformListingData(
      scrapedData,
      existingListing.user_id
    )

    // Only update fields that have new data, preserve existing data
    const updates: Partial<ListingRow> = {
      ...transformed,
      id: existingListing.id, // Preserve database ID
      created_at: existingListing.created_at, // Preserve creation date
      updated_at: new Date().toISOString(),
      analysis_status: 'analyzing',
    }

    return updates
  }
}
