/**
 * @file lib/services/apify/scrapers/location-scraper.ts
 * @description Airbnb Location Scraper - Competitor listings
 * @created 2025-07-21
 * @todo CORE-001-02: Location Scraper implementation
 */

import { config } from '@/lib/config'
import { apifyClient } from '../client'
import { AirbnbLocationData, ApifyRequestOptions } from '../types'

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
}
