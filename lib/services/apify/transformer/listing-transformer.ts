/**
 * @file lib/services/apify/transformer/listing-transformer.ts
 * @description Main listing data transformation
 * @created 2025-07-21
 * @todo CORE-001-02: Listing data transformation
 */

import { Database } from '@/types/database'
import { AirbnbListingData } from '../types'
import {
  extractPrice,
  extractHostYears,
  extractHostMonths,
  extractHostResponseRate,
  extractHostResponseTime,
} from './utils'
import { extractAmenities } from './amenity-transformer'

type ListingInsert = Database['public']['Tables']['listings']['Insert']

/**
 * Transform main listing data from URL scraper
 */
export function transformListingData(
  scrapedData: AirbnbListingData,
  userId: string
): ListingInsert {
  const amenities = extractAmenities(scrapedData)

  const transformedListing: ListingInsert = {
    // User & Basic Info
    user_id: userId,
    airbnb_id: scrapedData.id,
    airbnb_url: scrapedData.url,

    // Basic Listing Details
    title: scrapedData.title || null,
    description: scrapedData.description || null,
    property_type: scrapedData.propertyType || null,
    room_type: scrapedData.roomType || null,

    // SEO & Marketing Data (Type assertions for optional properties)
    seo_title: (scrapedData as any)?.seoTitle || null,
    meta_description: (scrapedData as any)?.metaDescription || null,
    sharing_config_title: (scrapedData as any)?.sharingConfigTitle || null,
    thumbnail_url: (scrapedData as any)?.thumbnail || null,

    // App Integration (Type assertions for optional properties)
    android_link: (scrapedData as any)?.androidLink || null,
    ios_link: (scrapedData as any)?.iosLink || null,

    // Extended Content Data (Type assertions for optional properties)
    html_description: (scrapedData as any)?.htmlDescription || null,
    sub_description: (scrapedData as any)?.subDescription || null,
    description_language:
      (scrapedData as any)?.descriptionOriginalLanguage || null,

    // Airbnb Internal Data (Type assertions for optional properties)
    home_tier: (scrapedData as any)?.homeTier || null,
    is_available: (scrapedData as any)?.isAvailable || null,

    // Capacity & Rooms
    person_capacity: scrapedData.personCapacity || null,

    // Ratings
    overall_rating: scrapedData.rating?.guestSatisfaction || null,
    rating_accuracy: scrapedData.rating?.accuracy || null,
    rating_checkin: scrapedData.rating?.checkin || null,
    rating_cleanliness: scrapedData.rating?.cleanliness || null,
    rating_communication: scrapedData.rating?.communication || null,
    rating_location: scrapedData.rating?.location || null,
    rating_value: scrapedData.rating?.value || null,
    reviews_count: scrapedData.rating?.reviewsCount || null,

    // Host Information (with type assertions for optional properties)
    host_id: scrapedData.host?.id || null,
    host_name: scrapedData.host?.name || null,
    host_is_superhost: scrapedData.host?.isSuperHost || false,
    host_response_rate: (scrapedData.host as any)?.hostDetails
      ? extractHostResponseRate((scrapedData.host as any).hostDetails)
      : (scrapedData.host as any)?.responseRate || null,
    host_response_time: (scrapedData.host as any)?.hostDetails
      ? extractHostResponseTime((scrapedData.host as any).hostDetails)
      : (scrapedData.host as any)?.responseTime || null,
    host_is_verified: (scrapedData.host as any)?.isVerified || false,
    host_profile_image: scrapedData.host?.profileImage || null,
    host_about: Array.isArray(scrapedData.host?.about)
      ? (scrapedData.host.about as string[]).join(' ')
      : (scrapedData.host?.about as string | undefined) || null,
    host_highlights: scrapedData.host?.highlights || null,
    host_time_as_host_years: scrapedData.host?.timeAsHost
      ? extractHostYears(
          (scrapedData.host.timeAsHost as any)?.years ||
            scrapedData.host.timeAsHost
        )
      : null,
    host_time_as_host_months: scrapedData.host?.timeAsHost
      ? extractHostMonths(
          (scrapedData.host.timeAsHost as any)?.months ||
            scrapedData.host.timeAsHost
        )
      : null,
    host_rating_average: (scrapedData.host as any)?.ratingAverage || null,
    host_rating_count: (scrapedData.host as any)?.ratingCount || null,

    // Co-Hosts (Previously Unused)
    co_hosts: scrapedData.coHosts || null,

    // Location (with type assertions for optional properties)
    coordinates_latitude: scrapedData.coordinates?.latitude || null,
    coordinates_longitude: scrapedData.coordinates?.longitude || null,
    location: (scrapedData as any)?.location || null,
    location_subtitle: (scrapedData as any)?.locationSubtitle || null,
    location_descriptions: (scrapedData as any)?.locationDescriptions || null,
    breadcrumbs: (scrapedData as any)?.breadcrumbs || null,

    // Pricing
    price_per_night: scrapedData.price?.amount
      ? extractPrice(scrapedData.price.amount)
      : null,
    currency: 'EUR', // DACH market default

    // Images  
    images: scrapedData.images || null,
    images_count: scrapedData.images?.length || null,

    // Amenities (Boolean fields)
    ...amenities,

    // Complex data as JSON
    amenities: scrapedData.amenities || null,
    highlights: scrapedData.highlights || null,
    house_rules: scrapedData.houseRules || null,
    cancellation_policies: (scrapedData as any)?.cancellationPolicies || null,

    // Brand & Marketing Features (Type assertion for optional property)
    brand_highlights: (scrapedData as any)?.brandHighlights || null,

    // Booking details
    minimum_stay: scrapedData.minimumStay || null,
    instant_book_available: scrapedData.instantBookable || null,

    // Status
    analysis_status: 'analyzing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return transformedListing
}
