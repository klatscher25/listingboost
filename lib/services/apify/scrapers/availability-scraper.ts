/**
 * @file lib/services/apify/scrapers/availability-scraper.ts
 * @description Airbnb Availability Scraper - 365-day availability
 * @created 2025-07-21
 * @todo CORE-001-02: Availability Scraper implementation
 */

import { config } from '@/lib/config'
import { apifyClient } from '../client'
import { AirbnbAvailabilityData, ApifyRequestOptions } from '../types'
import { validateAirbnbUrl, extractAirbnbId } from './utils'

/**
 * Scraper 3: Airbnb Availability Scraper - 365-day availability
 * Actor: rigelbytes/airbnb-availability-calendar
 */
export class AirbnbAvailabilityScraper {
  async scrape(
    airbnbUrl: string,
    options?: ApifyRequestOptions
  ): Promise<AirbnbAvailabilityData[]> {
    // [AvailabilityScraper] Starte Scraping für: ${airbnbUrl}

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
    // [AvailabilityScraper] Erfolgreich abgeschlossen: ${availability.length} days total

    return availability
  }
}
