/**
 * @file lib/services/apify/analysis-service.ts
 * @description Core analysis service for Apify listings
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-04: Extracted from index.ts for CLAUDE.md compliance
 */

import { supabaseAdmin } from '@/lib/supabase'
import calculateListingScore from '@/lib/scoring'
import { comprehensiveScraper } from './scrapers'
import { ApifyDataTransformer } from './transformer'
import { ComprehensiveListingData } from './types'
import { ApifyError } from './client'

export interface AnalysisResult {
  listing: any
  scoring: any
  scrapingMetadata: {
    scrapedAt: string
    dataCompleteness: any
    processingTime: any
    dataSource: 'apify_scraper'
  }
  analyzedAt: string
}

/**
 * Core analysis service for Apify listings
 */
export class ApifyAnalysisService {
  /**
   * Analyze a single Airbnb listing with full scraping + scoring pipeline
   */
  async analyzeListing(
    airbnbUrl: string,
    userId: string,
    options?: {
      includeReviews?: boolean
      includeAvailability?: boolean
      includeCompetitors?: boolean
      forceUpdate?: boolean
    }
  ): Promise<AnalysisResult> {
    const {
      includeReviews = true,
      includeAvailability = false, // Disabled by default due to rate limits
      includeCompetitors = true,
      forceUpdate = false,
    } = options || {}

    console.log('[ApifyAnalysisService] Starte Listing-Analyse:', {
      airbnbUrl,
      userId,
      options,
    })

    try {
      // Extract Airbnb ID for database lookup
      const airbnbIdMatch = airbnbUrl.match(/\/rooms\/(\d+)/)
      if (!airbnbIdMatch) {
        throw new Error(
          'Ungültige Airbnb-URL - ID konnte nicht extrahiert werden'
        )
      }
      const airbnbId = airbnbIdMatch[1]

      // Check for existing data if not forcing update
      const existingListing = await this.checkExistingListing(
        airbnbId,
        userId,
        forceUpdate
      )

      if (existingListing) {
        return existingListing
      }

      // Scrape comprehensive data from Apify
      console.log('[ApifyAnalysisService] Starte Apify-Scraping...')
      const comprehensiveData = await comprehensiveScraper.analyzeComplete(
        airbnbUrl,
        {
          includeReviews,
          includeAvailability,
          includeCompetitors,
          maxReviews: 50, // Limit for performance
          maxCompetitors: 25, // Limit for performance
        }
      )

      // Transform scraped data to database format
      console.log('[ApifyAnalysisService] Transformiere Scraping-Daten...')
      const scoringPackage = ApifyDataTransformer.createScoringDataPackage(
        comprehensiveData,
        userId
      )

      // Save or update listing in database
      const savedListing = await this.saveOrUpdateListing(
        airbnbId,
        userId,
        scoringPackage,
        comprehensiveData
      )

      // Calculate comprehensive scoring with real data
      console.log('[ApifyAnalysisService] Berechne Scoring mit echten Daten...')
      const scoringResult = await calculateListingScore(
        savedListing,
        scoringPackage.additionalData
      )

      // Update analysis status
      await supabaseAdmin
        .from('listings')
        .update({
          analysis_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', savedListing.id)

      const result: AnalysisResult = {
        listing: this.formatListingResponse(savedListing),
        scoring: scoringResult,
        scrapingMetadata: {
          scrapedAt: comprehensiveData.scrapedAt,
          dataCompleteness: comprehensiveData.dataCompleteness,
          processingTime: comprehensiveData.processingTime,
          dataSource: 'apify_scraper',
        },
        analyzedAt: new Date().toISOString(),
      }

      console.log('[ApifyAnalysisService] Analyse erfolgreich abgeschlossen:', {
        listingId: savedListing.id,
        totalScore: scoringResult.totalScore,
        performanceLevel: scoringResult.performanceLevel,
        processingTime: comprehensiveData.processingTime.total,
      })

      return result
    } catch (error) {
      console.error('[ApifyAnalysisService] Analyse fehlgeschlagen:', error)

      // Handle specific Apify errors
      if (error instanceof ApifyError) {
        if (error.type === 'RATE_LIMIT') {
          throw new Error(
            `Rate-Limit erreicht. Bitte versuchen Sie es in ${Math.ceil((error.retryAfter || 0) / 60000)} Minuten erneut.`
          )
        }
        throw new Error(`Scraping-Fehler: ${error.message}`)
      }

      // Re-throw with German error message
      throw new Error(
        `Listing-Analyse fehlgeschlagen: ${(error as Error).message}`
      )
    }
  }

  /**
   * Check for existing listing data
   */
  private async checkExistingListing(
    airbnbId: string,
    userId: string,
    forceUpdate: boolean
  ): Promise<AnalysisResult | null> {
    if (forceUpdate) return null

    console.log('[ApifyAnalysisService] Prüfe bestehende Listing-Daten...')

    // Database query with timeout
    const dbTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database query timeout nach 5 Sekunden'))
      }, 5000)
    })

    const dbQuery = supabaseAdmin
      .from('listings')
      .select('*')
      .eq('airbnb_id', airbnbId)
      .eq('user_id', userId)
      .single()

    try {
      const { data: existingListing } = await Promise.race([dbQuery, dbTimeout])

      if (!existingListing?.updated_at) return null

      const lastUpdate = new Date(existingListing.updated_at)
      const hoursSinceUpdate =
        (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)

      if (hoursSinceUpdate < 24) {
        // Data is fresh (less than 24 hours)
        console.log(
          '[ApifyAnalysisService] Verwende bestehende Daten (weniger als 24h alt)'
        )
        const scoringResult = await calculateListingScore(existingListing)

        return {
          listing: this.formatListingResponse(existingListing),
          scoring: scoringResult,
          scrapingMetadata: {
            scrapedAt: existingListing.updated_at,
            dataCompleteness: {
              listing: true,
              reviews: true,
              availability: true,
              competitors: true,
            },
            processingTime: { total: 0 },
            dataSource: 'existing_cache' as any,
          },
          analyzedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      console.warn('[ApifyAnalysisService] Database query failed:', error)
      // Continue without existing data if DB query fails
    }

    return null
  }

  /**
   * Save or update listing in database
   */
  private async saveOrUpdateListing(
    airbnbId: string,
    userId: string,
    scoringPackage: any,
    comprehensiveData: any
  ) {
    // Check if listing exists
    const { data: existingListing } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('airbnb_id', airbnbId)
      .eq('user_id', userId)
      .single()

    if (existingListing) {
      console.log(
        '[ApifyAnalysisService] Aktualisiere bestehenden Listing-Eintrag...'
      )
      const updates = ApifyDataTransformer.updateListingWithScrapedData(
        existingListing,
        comprehensiveData.listing
      )

      const { data, error } = await supabaseAdmin
        .from('listings')
        .update(updates)
        .eq('id', existingListing.id)
        .select()
        .single()

      if (error) {
        console.error(
          '[ApifyAnalysisService] Fehler beim Aktualisieren:',
          error
        )
        throw new Error(
          `Fehler beim Aktualisieren des Listings: ${error.message}`
        )
      }
      return data
    } else {
      console.log('[ApifyAnalysisService] Erstelle neuen Listing-Eintrag...')
      const { data, error } = await supabaseAdmin
        .from('listings')
        .insert(scoringPackage.listingData)
        .select()
        .single()

      if (error) {
        console.error('[ApifyAnalysisService] Fehler beim Erstellen:', error)
        throw new Error(`Fehler beim Speichern des Listings: ${error.message}`)
      }
      return data
    }
  }

  /**
   * Format listing data for API response
   */
  private formatListingResponse(listing: any) {
    return {
      id: listing.id,
      airbnb_id: listing.airbnb_id,
      title: listing.title,
      location: listing.location,
      overall_rating: listing.overall_rating,
      reviews_count: listing.reviews_count,
      price_per_night: listing.price_per_night,
      currency: listing.currency,
      images_count: listing.images_count,
      host_is_superhost: listing.host_is_superhost,
      property_type: listing.property_type,
      room_type: listing.room_type,
      person_capacity: listing.person_capacity,
      analysis_status: listing.analysis_status,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
    }
  }
}
