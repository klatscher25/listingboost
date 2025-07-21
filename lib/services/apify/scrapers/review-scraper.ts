/**
 * @file lib/services/apify/scrapers/review-scraper.ts
 * @description Airbnb Review Scraper - Individual reviews
 * @created 2025-07-21
 * @todo CORE-001-02: Review Scraper implementation
 */

import { config } from '@/lib/config'
import { apifyClient } from '../client'
import { AirbnbReviewData, ApifyRequestOptions } from '../types'
import { validateAirbnbUrl } from './utils'

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
