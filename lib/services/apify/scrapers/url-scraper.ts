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

    // Check if we have valid Apify token
    if (
      !config.APIFY_API_TOKEN ||
      config.APIFY_API_TOKEN === 'placeholder_apify_token'
    ) {
      throw new Error(
        '[UrlScraper] APIFY_API_TOKEN ist erforderlich'
      )
    }

    try {
      console.log('[UrlScraper] Starting scrape with actor:', config.APIFY_ACTOR_URL_SCRAPER)
      
      const input = {
        startUrls: [{ url: airbnbUrl }],
        maxListings: 1,
        includeReviews: false, // Reviews werden separat geholt
        // ✅ FIX: Deutsche Sprache für lokalisierte Titel und Beschreibungen
        locale: 'de-DE', // Korrekte deutsche Locale (laut Apify Validation)
        currency: 'EUR', // Euro für deutsche Nutzer
        // Simplified proxy config for faster scraping
        proxyConfiguration: {
          useApifyProxy: true,
          // Deutschland-spezifische Proxy-Konfiguration für bessere Lokalisierung
          groups: ['RESIDENTIAL'],
          countryCode: 'DE'
        },
        // Zusätzliche Konfiguration für deutsche Inhalte
        scrapeOptions: {
          extractGermanContent: true,
          preferLocalizedTitles: true,
          extractDescriptionInGerman: true
        }
      }

      // Use synchronous endpoint to avoid polling issues
      const result = await apifyClient.runActorSync<AirbnbListingData>(
        config.APIFY_ACTOR_URL_SCRAPER,
        input,
        {
          memory: options?.memory || 2048, // Increased memory
          timeout: options?.timeout || 60,  // Increased timeout
          ...options, // Let options override defaults
        }
      )

      if (!result.data || result.data.length === 0) {
        throw new Error('Keine Listing-Daten vom URL Scraper erhalten')
      }

      const listing = result.data[0]
      console.log('[UrlScraper] ✅ Successfully scraped listing:', listing.id)

      return listing
    } catch (error) {
      console.error('[UrlScraper] Apify scraping fehlgeschlagen:', error)
      throw new Error(
        `[UrlScraper] Fehler beim Scrapen von ${airbnbUrl}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      )
    }
  }
}
