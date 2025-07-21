/**
 * @file lib/services/apify/scrapers/index.ts
 * @description Export all scraper classes (modular structure for <400 line limit)
 * @created 2025-07-21
 * @todo CORE-001-02: Scraper module exports
 */

// Individual scrapers
export { AirbnbUrlScraper } from './url-scraper'
export { AirbnbReviewScraper } from './review-scraper'
export { AirbnbAvailabilityScraper } from './availability-scraper'
export { AirbnbLocationScraper } from './location-scraper'

// Comprehensive orchestrator
export { ComprehensiveAirbnbScraper } from './comprehensive-scraper'

// Utilities
export * from './utils'

// Create pre-instantiated scraper instances for backward compatibility
import { AirbnbUrlScraper } from './url-scraper'
import { AirbnbReviewScraper } from './review-scraper'
import { AirbnbAvailabilityScraper } from './availability-scraper'
import { AirbnbLocationScraper } from './location-scraper'
import { ComprehensiveAirbnbScraper } from './comprehensive-scraper'

export const urlScraper = new AirbnbUrlScraper()
export const reviewScraper = new AirbnbReviewScraper()
export const availabilityScraper = new AirbnbAvailabilityScraper()
export const locationScraper = new AirbnbLocationScraper()
export const comprehensiveScraper = new ComprehensiveAirbnbScraper()
