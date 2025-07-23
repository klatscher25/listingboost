/**
 * @file lib/utils/data-conversion.ts
 * @description Data conversion utilities for different data formats
 * @created 2025-07-23
 * @todo Convert between Apify data format and database listing format
 */

import type { AirbnbListingData } from '@/lib/services/apify/types'
import type { EnhancedFakeData } from '@/lib/types/freemium-api-types'
import { Database } from '@/types/database'

type ListingData = Database['public']['Tables']['listings']['Row']

/**
 * Convert Apify listing data or enhanced fake data to database listing format
 * for use with the 1000-point scoring system
 */
export function convertToListingData(
  listing: AirbnbListingData | EnhancedFakeData
): ListingData {
  const isRealData = 'coordinates' in listing

  if (isRealData) {
    const realListing = listing as AirbnbListingData

    return {
      id: `freemium_${Date.now()}`,
      airbnb_url: realListing.url || '',
      title: realListing.title || '',
      description: realListing.description || '',
      overall_rating: realListing.rating?.guestSatisfaction || null,
      reviews_count: realListing.rating?.reviewsCount || null,
      host_is_superhost: realListing.host?.isSuperHost || false,
      host_response_rate: realListing.host?.responseRate || null,
      host_response_time: realListing.host?.responseTime || null,
      price_per_night: parseFloat(realListing.price?.amount || '0') || null,
      images_count: realListing.images?.length || null,
      amenities: realListing.amenities
        ? JSON.stringify(realListing.amenities)
        : null,
      minimum_stay: null, // Not available in Apify data
      location: realListing.coordinates
        ? JSON.stringify({
            latitude: realListing.coordinates.latitude,
            longitude: realListing.coordinates.longitude,
          })
        : null,
      property_type: realListing.propertyType || null,
      room_type: realListing.roomType || null,
      person_capacity: realListing.personCapacity || null,
      bedrooms: realListing.bedrooms || null,
      bathrooms: realListing.baths || null,
      rating_accuracy: realListing.rating?.accuracy || null,
      rating_cleanliness: realListing.rating?.cleanliness || null,
      rating_location: realListing.rating?.location || null,
      rating_value: realListing.rating?.value || null,
      rating_checkin: null, // Not available in Apify data
      rating_communication: null, // Not available in Apify data
      images: realListing.images ? JSON.stringify(realListing.images) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Minimal required fields for scoring system
      user_id: 'freemium_user',
      raw_scraped_data: JSON.stringify(realListing),
      analysis_results: null,
      last_analyzed: null,
    } as unknown as ListingData
  } else {
    const fakeListing = listing as EnhancedFakeData

    return {
      id: `freemium_fake_${Date.now()}`,
      airbnb_url: fakeListing.url || '',
      title: fakeListing.title || '',
      description: fakeListing.description || '',
      overall_rating: fakeListing.rating?.guestSatisfaction || null,
      reviews_count: fakeListing.rating?.reviewsCount || null,
      host_is_superhost: fakeListing.host?.isSuperHost || false,
      host_response_rate: fakeListing.host?.responseRate || null,
      host_response_time: fakeListing.host?.responseTime || null,
      price_per_night: parseFloat(fakeListing.price?.amount || '0') || null,
      images_count: fakeListing.images?.length || null,
      amenities: fakeListing.amenities
        ? JSON.stringify(fakeListing.amenities)
        : null,
      minimum_stay: null,
      location: JSON.stringify({
        latitude: 48.1351, // Munich default for fake data
        longitude: 11.582,
      }),
      property_type: fakeListing.propertyType || null,
      room_type: fakeListing.roomType || null,
      person_capacity: fakeListing.personCapacity || null,
      bedrooms: fakeListing.bedrooms || null,
      bathrooms: fakeListing.baths || null,
      rating_accuracy: fakeListing.rating?.accuracy || null,
      rating_cleanliness: fakeListing.rating?.cleanliness || null,
      rating_location: fakeListing.rating?.location || null,
      rating_value: fakeListing.rating?.value || null,
      rating_checkin: null,
      rating_communication: null,
      images: fakeListing.images ? JSON.stringify(fakeListing.images) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Optional fields
      user_id: 'freemium_user',
      raw_scraped_data: JSON.stringify(fakeListing),
      analysis_results: null,
      last_analyzed: null,
    } as unknown as ListingData
  }
}
