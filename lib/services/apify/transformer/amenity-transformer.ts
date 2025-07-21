/**
 * @file lib/services/apify/transformer/amenity-transformer.ts
 * @description Amenity extraction and transformation logic
 * @created 2025-07-21
 * @todo CORE-001-02: Amenity transformation
 */

import { AirbnbListingData } from '../types'

/**
 * Check amenity availability
 */
function hasAmenity(
  scrapedData: AirbnbListingData,
  amenityTitle: string
): boolean {
  if (!scrapedData.amenities) return false

  return scrapedData.amenities.some((category) =>
    category.values?.some(
      (amenity) =>
        amenity.title.toLowerCase().includes(amenityTitle.toLowerCase()) &&
        amenity.available === true
    )
  )
}

/**
 * Extract essential amenities from amenity structure
 */
export function extractAmenities(scrapedData: AirbnbListingData) {
  const amenityMap = {
    wifi_available:
      hasAmenity(scrapedData, 'wifi') || hasAmenity(scrapedData, 'internet'),
    kitchen_available: hasAmenity(scrapedData, 'kitchen'),
    heating_available:
      hasAmenity(scrapedData, 'heating') || hasAmenity(scrapedData, 'heat'),
    air_conditioning_available:
      hasAmenity(scrapedData, 'air conditioning') ||
      hasAmenity(scrapedData, 'ac'),
    washer_available:
      hasAmenity(scrapedData, 'washer') ||
      hasAmenity(scrapedData, 'washing machine'),
    dishwasher_available: hasAmenity(scrapedData, 'dishwasher'),
    tv_available:
      hasAmenity(scrapedData, 'tv') || hasAmenity(scrapedData, 'television'),
    iron_available: hasAmenity(scrapedData, 'iron'),
    dedicated_workspace_available:
      hasAmenity(scrapedData, 'dedicated workspace') ||
      hasAmenity(scrapedData, 'workspace'),
    pool_available:
      hasAmenity(scrapedData, 'pool') || hasAmenity(scrapedData, 'swimming'),
    hot_tub_available:
      hasAmenity(scrapedData, 'hot tub') || hasAmenity(scrapedData, 'jacuzzi'),
    gym_available:
      hasAmenity(scrapedData, 'gym') || hasAmenity(scrapedData, 'fitness'),
    balcony_available:
      hasAmenity(scrapedData, 'balcony') || hasAmenity(scrapedData, 'terrace'),
    smoke_alarm_available:
      hasAmenity(scrapedData, 'smoke alarm') ||
      hasAmenity(scrapedData, 'smoke detector'),
    carbon_monoxide_alarm_available:
      hasAmenity(scrapedData, 'carbon monoxide') ||
      hasAmenity(scrapedData, 'co alarm'),
    first_aid_kit_available:
      hasAmenity(scrapedData, 'first aid') ||
      hasAmenity(scrapedData, 'first-aid'),
  }
  return amenityMap
}
