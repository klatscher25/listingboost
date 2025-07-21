/**
 * @file lib/services/apify/scrapers/utils.ts
 * @description Utility functions for Apify scrapers
 * @created 2025-07-21
 * @todo CORE-001-02: Scraper utilities
 */

/**
 * Extract Airbnb listing ID from URL
 */
export function extractAirbnbId(url: string): string {
  const match = url.match(/\/rooms\/(\d+)/)
  if (!match) {
    throw new Error(`Ungültige Airbnb-URL: ${url}`)
  }
  return match[1]
}

/**
 * Validate Airbnb URL format
 */
export function validateAirbnbUrl(url: string): void {
  const airbnbUrlPattern =
    /^https:\/\/(www\.)?airbnb\.(com|de|fr|it|es|co\.uk)\/rooms\/\d+/
  if (!airbnbUrlPattern.test(url)) {
    throw new Error(`Ungültiges Airbnb-URL Format: ${url}`)
  }
}

/**
 * Extract location from listing for competitor search
 */
export function extractLocationFromListing(listing: unknown): string {
  const listingData = listing as {
    title?: string
    coordinates?: { latitude: number; longitude: number }
  }

  // Try to extract city/area from title or description
  if (listingData.title) {
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
      if (listingData.title.includes(city)) {
        return `${city}, Deutschland`
      }
    }

    // Try to extract from coordinates if available
    if (listingData.coordinates) {
      return `${listingData.coordinates.latitude},${listingData.coordinates.longitude}`
    }
  }

  // Fallback to generic German search
  return 'Deutschland'
}
