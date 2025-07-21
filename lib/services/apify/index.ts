/**
 * @file lib/services/apify/index.ts
 * @description Main Apify service orchestrator with integrated scoring
 * @created 2025-07-21
 * @todo CORE-001-02: Complete Apify integration with scoring system
 */

import { supabaseAdmin } from '@/lib/supabase'
import calculateListingScore from '@/lib/scoring'
import {
  comprehensiveScraper,
  urlScraper,
  reviewScraper,
  availabilityScraper,
  locationScraper,
} from './scrapers'
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
 * Main Apify service class for listing analysis
 */
export class ApifyService {
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

    console.log('[ApifyService] Starte Listing-Analyse:', {
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

      // Check if listing already exists and is recent (unless force update)
      let existingListing = null
      if (!forceUpdate) {
        console.log('[ApifyService] Prüfe bestehende Listing-Daten...')

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
          const { data } = await Promise.race([dbQuery, dbTimeout])
          existingListing = data
        } catch (error) {
          console.warn('[ApifyService] Database query failed:', error)
          // Continue without existing data if DB query fails
          existingListing = null
        }

        // If recent data exists, return existing analysis
        if (existingListing && existingListing.updated_at) {
          const lastUpdate = new Date(existingListing.updated_at)
          const hoursSinceUpdate =
            (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)

          if (hoursSinceUpdate < 24) {
            // Data is fresh (less than 24 hours)
            console.log(
              '[ApifyService] Verwende bestehende Daten (weniger als 24h alt)'
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
        }
      }

      // Scrape comprehensive data from Apify
      console.log('[ApifyService] Starte Apify-Scraping...')
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
      console.log('[ApifyService] Transformiere Scraping-Daten...')
      const scoringPackage = ApifyDataTransformer.createScoringDataPackage(
        comprehensiveData,
        userId
      )

      // Save/update listing in database
      let savedListing
      if (existingListing) {
        console.log(
          '[ApifyService] Aktualisiere bestehenden Listing-Eintrag...'
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
          console.error('[ApifyService] Fehler beim Aktualisieren:', error)
          throw new Error(
            `Fehler beim Aktualisieren des Listings: ${error.message}`
          )
        }
        savedListing = data
      } else {
        console.log('[ApifyService] Erstelle neuen Listing-Eintrag...')
        const { data, error } = await supabaseAdmin
          .from('listings')
          .insert(scoringPackage.listingData)
          .select()
          .single()

        if (error) {
          console.error('[ApifyService] Fehler beim Erstellen:', error)
          throw new Error(
            `Fehler beim Speichern des Listings: ${error.message}`
          )
        }
        savedListing = data
      }

      // Calculate comprehensive scoring with real data
      console.log('[ApifyService] Berechne Scoring mit echten Daten...')
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

      console.log('[ApifyService] Analyse erfolgreich abgeschlossen:', {
        listingId: savedListing.id,
        totalScore: scoringResult.totalScore,
        performanceLevel: scoringResult.performanceLevel,
        processingTime: comprehensiveData.processingTime.total,
      })

      return result
    } catch (error) {
      console.error('[ApifyService] Analyse fehlgeschlagen:', error)

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
   * Quick listing analysis using only basic scraper (faster, less comprehensive)
   */
  async quickAnalyze(
    airbnbUrl: string,
    userId: string
  ): Promise<AnalysisResult> {
    console.log('[ApifyService] Starte Schnell-Analyse:', airbnbUrl)

    try {
      // Only scrape basic listing data with timeout
      const scrapingTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Quick scraping timeout nach 15 Sekunden'))
        }, 15000)
      })

      const scrapingPromise = urlScraper.scrape(airbnbUrl)
      const listingData = await Promise.race([scrapingPromise, scrapingTimeout])

      // Transform to database format
      const transformedData = ApifyDataTransformer.transformListingData(
        listingData,
        userId
      )

      // Save to database with timeout
      console.log('[ApifyService] Speichere in Datenbank...')

      const dbTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Database save timeout nach 10 Sekunden'))
        }, 10000)
      })

      const dbSave = supabaseAdmin
        .from('listings')
        .insert(transformedData)
        .select()
        .single()

      const { data: savedListing, error } = await Promise.race([
        dbSave,
        dbTimeout,
      ])

      if (error) {
        throw new Error(`Fehler beim Speichern: ${error.message}`)
      }

      // Calculate scoring with limited data
      const scoringResult = await calculateListingScore(savedListing, {
        reviews: [],
        availability: [],
        competitors: [],
        sentimentAnalysis: null,
      })

      return {
        listing: this.formatListingResponse(savedListing),
        scoring: scoringResult,
        scrapingMetadata: {
          scrapedAt: new Date().toISOString(),
          dataCompleteness: {
            listing: true,
            reviews: false,
            availability: false,
            competitors: false,
          },
          processingTime: { total: 30000 }, // Estimated
          dataSource: 'apify_scraper',
        },
        analyzedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('[ApifyService] Schnell-Analyse fehlgeschlagen:', error)
      throw new Error(
        `Schnell-Analyse fehlgeschlagen: ${(error as Error).message}`
      )
    }
  }

  /**
   * Analyze competitors for market positioning
   */
  async analyzeMarket(
    location: string,
    options?: {
      maxListings?: number
      priceRange?: { min: number; max: number }
    }
  ): Promise<any> {
    const { maxListings = 50, priceRange } = options || {}

    console.log('[ApifyService] Starte Markt-Analyse für:', location)

    try {
      const competitors = await locationScraper.scrape(location, {
        maxListings,
        priceMin: priceRange?.min,
        priceMax: priceRange?.max,
      })

      const analysis = ApifyDataTransformer.transformCompetitorData(competitors)

      return {
        location,
        competitors: analysis.competitors,
        marketStats: analysis.marketStats,
        analyzedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('[ApifyService] Markt-Analyse fehlgeschlagen:', error)
      throw new Error(
        `Markt-Analyse fehlgeschlagen: ${(error as Error).message}`
      )
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

  /**
   * Check service health and rate limit status
   */
  async getServiceStatus() {
    try {
      const { apifyClient } = await import('./client')

      const actors = [
        'tri_angle~airbnb-rooms-urls-scraper',
        'tri_angle~airbnb-reviews-scraper',
        'rigelbytes~airbnb-availability-calendar',
        'tri_angle~airbnb-scraper',
      ]

      // Check each actor status
      const actorStatus = await Promise.allSettled(
        actors.map(async (actorId) => {
          try {
            // Test if actor exists by checking its details
            const actorInfo = await fetch(
              `https://api.apify.com/v2/acts/${actorId}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
                },
              }
            )

            return {
              actorId,
              available: actorInfo.ok,
              status: actorInfo.ok ? 'available' : 'not_found',
            }
          } catch (error) {
            return {
              actorId,
              available: false,
              status: 'error',
              error: (error as Error).message,
            }
          }
        })
      )

      const results = actorStatus.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        }
        return {
          actorId: actors[index],
          available: false,
          status: 'error',
          error: 'Promise rejected',
        }
      })

      const healthyActors = results.filter((r) => r.available).length

      return {
        healthy: healthyActors > 0,
        actors: results,
        summary: {
          total: actors.length,
          available: healthyActors,
          unavailable: actors.length - healthyActors,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        healthy: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

/**
 * Export singleton service instance
 */
export const apifyService = new ApifyService()

/**
 * Re-export types and components for external use
 */
export * from './types'
export * from './scrapers'
export * from './transformer'
export { ApifyError } from './client'
