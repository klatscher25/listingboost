/**
 * @file lib/services/apify/scrapers.ts
 * @description Individual scraper implementations for Airbnb data
 * @created 2025-07-21
 * @todo CORE-001-02: Apify Scraper Integration Pipeline
 */

import { config } from '@/lib/config'
import { apifyClient } from './client'
import { MockScraper } from './mock-scraper'
import {
  AirbnbListingData,
  AirbnbReviewData,
  AirbnbAvailabilityData,
  AirbnbLocationData,
  ComprehensiveListingData,
  ApifyRequestOptions,
} from './types'

/**
 * Extract Airbnb listing ID from URL
 */
function extractAirbnbId(url: string): string {
  const match = url.match(/\/rooms\/(\d+)/)
  if (!match) {
    throw new Error(`Ungültige Airbnb-URL: ${url}`)
  }
  return match[1]
}

/**
 * Validate Airbnb URL format
 */
function validateAirbnbUrl(url: string): void {
  const airbnbUrlPattern =
    /^https:\/\/(www\.)?airbnb\.(com|de|fr|it|es|co\.uk)\/rooms\/\d+/
  if (!airbnbUrlPattern.test(url)) {
    throw new Error(`Ungültiges Airbnb-URL Format: ${url}`)
  }
}

/**
 * Scraper 1: Airbnb URL Scraper - Main listing details
 * Actor: tri_angle/airbnb-rooms-urls-scraper
 */
export class AirbnbUrlScraper {
  async scrape(
    airbnbUrl: string,
    options?: ApifyRequestOptions
  ): Promise<AirbnbListingData> {
    console.log('[UrlScraper] Starte Scraping für:', airbnbUrl)

    validateAirbnbUrl(airbnbUrl)

    // Check if we have valid Apify token OR development mode
    if (
      !config.APIFY_API_TOKEN ||
      config.APIFY_API_TOKEN === 'placeholder_apify_token' ||
      config.NODE_ENV === 'development'
    ) {
      console.warn(
        '[UrlScraper] Development mode oder Apify API Token nicht verfügbar, nutze Mock-Daten'
      )
      return MockScraper.generateMockListingData(airbnbUrl)
    }

    try {
      const input = {
        startUrls: [{ url: airbnbUrl }],
        maxListings: 1,
        includeReviews: false, // Reviews werden separat geholt
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
      }

      const result = await apifyClient.runActor<AirbnbListingData>(
        config.APIFY_ACTOR_URL_SCRAPER,
        input,
        {
          timeout: 30, // Reduced timeout
          memory: 1024,
          ...options,
        }
      )

      if (!result.data || result.data.length === 0) {
        throw new Error('Keine Listing-Daten vom URL Scraper erhalten')
      }

      const listing = result.data[0]
      console.log('[UrlScraper] Erfolgreich abgeschlossen:', {
        id: listing.id,
        title: listing.title,
        rating: listing.rating?.guestSatisfaction,
        amenitiesCount: listing.amenities?.length || 0,
      })

      return listing
    } catch (error) {
      console.warn(
        '[UrlScraper] Apify scraping fehlgeschlagen, nutze Mock-Daten:',
        error
      )
      return MockScraper.generateMockListingData(airbnbUrl)
    }
  }
}

/**
 * Scraper 2: Airbnb Review Scraper - Individual reviews
 * Actor: tri_angle/airbnb-reviews-scraper
 */
export class AirbnbReviewScraper {
  async scrape(
    airbnbUrl: string,
    options?: ApifyRequestOptions & { maxReviews?: number }
  ): Promise<AirbnbReviewData[]> {
    console.log('[ReviewScraper] Starte Scraping für:', airbnbUrl)

    validateAirbnbUrl(airbnbUrl)

    const { maxReviews = 100, ...apifyOptions } = options || {}

    const input = {
      startUrls: [{ url: airbnbUrl }],
      maxReviews,
      reviewLanguages: ['en', 'de', 'es', 'fr', 'it'], // Multi-language support
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
      },
    }

    const result = await apifyClient.runActor<AirbnbReviewData>(
      config.APIFY_ACTOR_REVIEW_SCRAPER,
      input,
      {
        timeout: 45, // 45 seconds
        memory: 512,
        ...apifyOptions,
      }
    )

    const reviews = result.data || []
    console.log('[ReviewScraper] Erfolgreich abgeschlossen:', {
      reviewCount: reviews.length,
      averageRating:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0,
    })

    return reviews
  }
}

/**
 * Scraper 3: Airbnb Availability Scraper - 365-day availability
 * Actor: rigelbytes/airbnb-availability-calendar
 */
export class AirbnbAvailabilityScraper {
  async scrape(
    airbnbUrl: string,
    options?: ApifyRequestOptions
  ): Promise<AirbnbAvailabilityData[]> {
    console.log('[AvailabilityScraper] Starte Scraping für:', airbnbUrl)

    validateAirbnbUrl(airbnbUrl)
    const listingId = extractAirbnbId(airbnbUrl)

    const input = {
      listingId: parseInt(listingId),
      calendarMonths: 12, // 12 months = 365 days
      currency: 'EUR', // DACH market focus
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
      },
    }

    const result = await apifyClient.runActor<AirbnbAvailabilityData>(
      config.APIFY_ACTOR_AVAILABILITY_SCRAPER,
      input,
      {
        timeout: 30, // 30 seconds
        memory: 512,
        ...options,
      }
    )

    const availability = result.data || []
    console.log('[AvailabilityScraper] Erfolgreich abgeschlossen:', {
      daysTotal: availability.length,
      daysAvailable: availability.filter((d) => d.available).length,
      occupancyRate:
        availability.length > 0
          ? Math.round(
              (1 -
                availability.filter((d) => d.available).length /
                  availability.length) *
                100
            )
          : 0,
    })

    return availability
  }
}

/**
 * Scraper 4: Airbnb Location Scraper - Competitor listings
 * Actor: tri_angle/airbnb-scraper
 */
export class AirbnbLocationScraper {
  async scrape(
    location: string,
    options?: ApifyRequestOptions & {
      maxListings?: number
      priceMin?: number
      priceMax?: number
      propertyTypes?: string[]
    }
  ): Promise<AirbnbLocationData[]> {
    console.log('[LocationScraper] Starte Scraping für Location:', location)

    const {
      maxListings = 50,
      priceMin = 20,
      priceMax = 500,
      propertyTypes = [],
      ...apifyOptions
    } = options || {}

    const input = {
      locationQuery: location,
      maxListings,
      includeReviews: false,
      checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 1 week from now
      checkOut: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 9 days from now
      adults: 2,
      children: 0,
      infants: 0,
      currency: 'EUR',
      minPrice: priceMin,
      maxPrice: priceMax,
      propertyTypes: propertyTypes.length > 0 ? propertyTypes : undefined,
      sortBy: 'GUEST_RATING', // Sort by rating for quality competitors
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
      },
    }

    const result = await apifyClient.runActor<AirbnbLocationData>(
      config.APIFY_ACTOR_LOCATION_SCRAPER,
      input,
      {
        timeout: 60, // 60 seconds for location searches
        memory: 2048, // More memory for large result sets
        ...apifyOptions,
      }
    )

    const competitors = result.data || []
    console.log('[LocationScraper] Erfolgreich abgeschlossen:', {
      competitorCount: competitors.length,
      averageRating:
        competitors.length > 0
          ? competitors.reduce(
              (sum, c) => sum + (c.rating?.guestSatisfaction || 0),
              0
            ) / competitors.length
          : 0,
      priceRange:
        competitors.length > 0
          ? {
              min: Math.min(
                ...competitors.map((c) =>
                  parseFloat(c.price.amount.replace(/[^0-9.]/g, ''))
                )
              ),
              max: Math.max(
                ...competitors.map((c) =>
                  parseFloat(c.price.amount.replace(/[^0-9.]/g, ''))
                )
              ),
            }
          : null,
    })

    return competitors
  }

  /**
   * Extract location from listing for competitor search
   */
  static extractLocationFromListing(listing: AirbnbListingData): string {
    // Try to extract city/area from title or description
    if (listing.title) {
      // Common German cities
      const germanCities = [
        'Berlin',
        'München',
        'Hamburg',
        'Köln',
        'Frankfurt',
        'Stuttgart',
        'Düsseldorf',
        'Leipzig',
        'Nürnberg',
      ]
      for (const city of germanCities) {
        if (listing.title.includes(city)) {
          return `${city}, Deutschland`
        }
      }

      // Try to extract from coordinates if available
      if (listing.coordinates) {
        return `${listing.coordinates.latitude},${listing.coordinates.longitude}`
      }
    }

    // Fallback to generic German search
    return 'Deutschland'
  }
}

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

    console.log(
      '[ComprehensiveScraper] Starte vollständige Analyse für:',
      airbnbUrl
    )

    // Check if we should use mock data
    if (
      !config.APIFY_API_TOKEN ||
      config.APIFY_API_TOKEN === 'placeholder_apify_token' ||
      config.NODE_ENV === 'development'
    ) {
      console.warn(
        '[ComprehensiveScraper] Development mode oder Apify API Token nicht verfügbar, nutze Mock-Daten'
      )
      return MockScraper.generateMockComprehensiveData(airbnbUrl)
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
        const location =
          AirbnbLocationScraper.extractLocationFromListing(listing)
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

/**
 * Export scraper instances for direct use
 */
export const urlScraper = new AirbnbUrlScraper()
export const reviewScraper = new AirbnbReviewScraper()
export const availabilityScraper = new AirbnbAvailabilityScraper()
export const locationScraper = new AirbnbLocationScraper()
export const comprehensiveScraper = new ComprehensiveAirbnbScraper()
