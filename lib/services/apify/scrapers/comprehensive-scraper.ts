/**
 * @file lib/services/apify/scrapers/comprehensive-scraper.ts
 * @description Comprehensive scraper orchestrator
 * @created 2025-07-21
 * @todo CORE-001-02: Comprehensive scraper implementation
 */

import { config } from '@/lib/config'
import { ComprehensiveListingData } from '../types'
import { AirbnbUrlScraper } from './url-scraper'
import { AirbnbReviewScraper } from './review-scraper'
import { AirbnbAvailabilityScraper } from './availability-scraper'
import { AirbnbLocationScraper } from './location-scraper'
import { extractLocationFromListing } from './utils'

/**
 * Comprehensive scraper orchestrator
 * Coordinates all 4 scrapers for complete analysis
 */
export class ComprehensiveAirbnbScraper {
  private urlScraper = new AirbnbUrlScraper()
  private reviewScraper = new AirbnbReviewScraper()
  private availabilityScraper = new AirbnbAvailabilityScraper()
  private locationScraper = new AirbnbLocationScraper()

  /**
   * Run all scrapers for comprehensive listing analysis
   */
  async analyzeComplete(
    airbnbUrl: string,
    options?: {
      includeReviews?: boolean
      includeAvailability?: boolean
      includeCompetitors?: boolean
      maxReviews?: number
      maxCompetitors?: number
    }
  ): Promise<ComprehensiveListingData> {
    const startTime = Date.now()
    const {
      includeReviews = true,
      includeAvailability = true,
      includeCompetitors = true,
      maxReviews = 100,
      maxCompetitors = 50,
    } = options || {}

    // [ComprehensiveScraper] Starte vollständige Analyse für: ${airbnbUrl}

    // Check if we should use mock data
    if (
      !config.APIFY_API_TOKEN ||
      config.APIFY_API_TOKEN === 'placeholder_apify_token' ||
      config.NODE_ENV === 'development'
    ) {
      throw new Error(
        '[ComprehensiveScraper] APIFY_API_TOKEN ist erforderlich für die Produktion'
      )
    }

    try {
      // Step 1: Get main listing data (always required)
      console.log('[ComprehensiveScraper] Schritt 1/4: Listing-Daten...')
      const listingStartTime = Date.now()
      const listing = await this.urlScraper.scrape(airbnbUrl)
      const listingTime = Date.now() - listingStartTime

      // Step 2-4: Run remaining scrapers in parallel for efficiency
      console.log('[ComprehensiveScraper] Schritte 2-4: Parallel-Scraping...')
      const parallelTasks = []

      // Reviews
      if (includeReviews) {
        parallelTasks.push(
          this.reviewScraper
            .scrape(airbnbUrl, { maxReviews })
            .then((reviews) => ({
              reviews,
              reviewsTime: Date.now() - startTime,
            }))
            .catch((error) => {
              console.error(
                '[ComprehensiveScraper] Review-Scraping fehlgeschlagen:',
                error
              )
              return { reviews: [], reviewsTime: 0 }
            })
        )
      }

      // Availability
      if (includeAvailability) {
        parallelTasks.push(
          this.availabilityScraper
            .scrape(airbnbUrl)
            .then((availability) => ({
              availability,
              availabilityTime: Date.now() - startTime,
            }))
            .catch((error) => {
              console.error(
                '[ComprehensiveScraper] Availability-Scraping fehlgeschlagen:',
                error
              )
              return { availability: [], availabilityTime: 0 }
            })
        )
      }

      // Competitors
      if (includeCompetitors) {
        const location = extractLocationFromListing(listing)
        parallelTasks.push(
          this.locationScraper
            .scrape(location, { maxListings: maxCompetitors })
            .then((competitors) => ({
              competitors,
              competitorsTime: Date.now() - startTime,
            }))
            .catch((error) => {
              console.error(
                '[ComprehensiveScraper] Location-Scraping fehlgeschlagen:',
                error
              )
              return { competitors: [], competitorsTime: 0 }
            })
        )
      }

      // Wait for all parallel tasks
      const results = await Promise.all(parallelTasks)

      // Combine results
      const reviews = includeReviews
        ? results.find((r) => 'reviews' in r)?.reviews || []
        : []
      const availability = includeAvailability
        ? results.find((r) => 'availability' in r)?.availability || []
        : []
      const competitors = includeCompetitors
        ? results.find((r) => 'competitors' in r)?.competitors || []
        : []

      const totalTime = Date.now() - startTime

      const comprehensiveData: ComprehensiveListingData = {
        listing,
        reviews,
        availability,
        competitors,
        scrapedAt: new Date().toISOString(),
        dataCompleteness: {
          listing: true,
          reviews: includeReviews ? reviews.length > 0 : true,
          availability: includeAvailability ? availability.length > 0 : true,
          competitors: includeCompetitors ? competitors.length > 0 : true,
        },
        processingTime: {
          listing: listingTime,
          reviews: includeReviews
            ? results.find((r) => 'reviewsTime' in r)?.reviewsTime || 0
            : 0,
          availability: includeAvailability
            ? results.find((r) => 'availabilityTime' in r)?.availabilityTime ||
              0
            : 0,
          competitors: includeCompetitors
            ? results.find((r) => 'competitorsTime' in r)?.competitorsTime || 0
            : 0,
          total: totalTime,
        },
      }

      console.log('[ComprehensiveScraper] Analyse erfolgreich abgeschlossen:', {
        totalTime: `${Math.round(totalTime / 1000)}s`,
        listing: !!comprehensiveData.listing,
        reviews: comprehensiveData.reviews.length,
        availability: comprehensiveData.availability.length,
        competitors: comprehensiveData.competitors.length,
      })

      return comprehensiveData
    } catch (error) {
      console.error(
        '[ComprehensiveScraper] Umfassende Analyse fehlgeschlagen:',
        error
      )
      throw error
    }
  }
}
