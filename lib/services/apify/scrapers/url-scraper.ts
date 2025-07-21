/**
 * @file lib/services/apify/scrapers/url-scraper.ts
 * @description Airbnb URL Scraper - Main listing details
 * @created 2025-07-21
 * @todo CORE-001-02: URL Scraper implementation
 */

import { config } from '@/lib/config'
import { apifyClient } from '../client'
import { AirbnbListingData, ApifyRequestOptions } from '../types'
import { validateAirbnbUrl } from './utils'

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
      throw new Error(
        '[UrlScraper] APIFY_API_TOKEN ist erforderlich für die Produktion'
      )
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
      console.error('[UrlScraper] Apify scraping fehlgeschlagen:', error)
      throw new Error(
        `[UrlScraper] Fehler beim Scrapen von ${airbnbUrl}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      )
    }
  }
}
