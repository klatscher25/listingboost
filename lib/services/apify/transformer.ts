/**
 * @file lib/services/apify/transformer.ts
 * @description Transform Apify scraper data to database schema format
 * @created 2025-07-21
 * @todo CORE-001-02: Transform scraped data to scoring system format
 */

import { Database } from '@/types/database'
import {
  AirbnbListingData,
  AirbnbReviewData,
  AirbnbAvailabilityData,
  AirbnbLocationData,
  ComprehensiveListingData,
} from './types'

type ListingInsert = Database['public']['Tables']['listings']['Insert']
type ListingRow = Database['public']['Tables']['listings']['Row']

/**
 * Transform Apify listing data to database schema format
 */
export class ApifyDataTransformer {
  /**
   * Transform main listing data from URL scraper
   */
  static transformListingData(
    scrapedData: AirbnbListingData,
    userId: string
  ): ListingInsert {
    // Extract numeric values from price strings
    const extractPrice = (priceStr: string): number => {
      const match = priceStr.match(/[\d.,]+/)
      if (!match) return 0
      return parseFloat(match[0].replace(',', '.'))
    }

    // Extract numeric values from percentage strings
    const extractPercentage = (percentStr: string): string => {
      return percentStr.replace('%', '')
    }

    // Extract years from host experience string
    const extractHostYears = (timeStr: string): number => {
      const yearMatch = timeStr.match(/(\d+)\s*year/i)
      if (yearMatch) return parseInt(yearMatch[1])

      const monthMatch = timeStr.match(/(\d+)\s*month/i)
      if (monthMatch) return Math.floor(parseInt(monthMatch[1]) / 12)

      return 0
    }

    // Extract months from host experience string
    const extractHostMonths = (timeStr: string): number => {
      const yearMatch = timeStr.match(/(\d+)\s*year/i)
      const monthMatch = timeStr.match(/(\d+)\s*month/i)

      let totalMonths = 0
      if (yearMatch) totalMonths += parseInt(yearMatch[1]) * 12
      if (monthMatch) totalMonths += parseInt(monthMatch[1])

      return totalMonths
    }

    // Extract host response rate from hostDetails
    const extractHostResponseRate = (hostDetails: string[]): string | null => {
      if (!hostDetails) return null
      const responseRateItem = hostDetails.find((detail) =>
        detail.includes('Response rate:')
      )
      if (responseRateItem) {
        const match = responseRateItem.match(/(\d+%)/i)
        return match ? match[1] : null
      }
      return null
    }

    // Extract host response time from hostDetails
    const extractHostResponseTime = (hostDetails: string[]): string | null => {
      if (!hostDetails) return null
      const responseTimeItem = hostDetails.find((detail) =>
        detail.includes('Responds')
      )
      if (responseTimeItem) {
        return responseTimeItem.replace('Responds ', '').trim()
      }
      return null
    }

    // Check amenity availability
    const hasAmenity = (amenityTitle: string): boolean => {
      if (!scrapedData.amenities) return false

      return scrapedData.amenities.some((category) =>
        category.values?.some(
          (amenity) =>
            amenity.title.toLowerCase().includes(amenityTitle.toLowerCase()) &&
            amenity.available === true
        )
      )
    }

    // Extract essential amenities from amenity structure
    const extractAmenities = () => {
      const amenityMap = {
        wifi_available: hasAmenity('wifi') || hasAmenity('internet'),
        kitchen_available: hasAmenity('kitchen'),
        heating_available: hasAmenity('heating') || hasAmenity('heat'),
        air_conditioning_available:
          hasAmenity('air conditioning') || hasAmenity('ac'),
        washer_available: hasAmenity('washer') || hasAmenity('washing machine'),
        dishwasher_available: hasAmenity('dishwasher'),
        tv_available: hasAmenity('tv') || hasAmenity('television'),
        iron_available: hasAmenity('iron'),
        dedicated_workspace_available:
          hasAmenity('dedicated workspace') || hasAmenity('workspace'),
        pool_available: hasAmenity('pool') || hasAmenity('swimming'),
        hot_tub_available: hasAmenity('hot tub') || hasAmenity('jacuzzi'),
        gym_available: hasAmenity('gym') || hasAmenity('fitness'),
        balcony_available: hasAmenity('balcony') || hasAmenity('terrace'),
        smoke_alarm_available:
          hasAmenity('smoke alarm') || hasAmenity('smoke detector'),
        carbon_monoxide_alarm_available:
          hasAmenity('carbon monoxide') || hasAmenity('co alarm'),
        first_aid_kit_available:
          hasAmenity('first aid') || hasAmenity('first-aid'),
      }
      return amenityMap
    }

    const amenities = extractAmenities()

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

      // SEO & Marketing Data (Previously Unused)
      seo_title: scrapedData.seoTitle || null,
      meta_description: scrapedData.metaDescription || null,
      sharing_config_title: scrapedData.sharingConfigTitle || null,
      thumbnail_url: scrapedData.thumbnail || null,

      // App Integration (Previously Unused)
      android_link: scrapedData.androidLink || null,
      ios_link: scrapedData.iosLink || null,

      // Extended Content Data (Previously Unused)
      html_description: scrapedData.htmlDescription || null,
      sub_description: scrapedData.subDescription || null,
      description_language: scrapedData.descriptionOriginalLanguage || null,

      // Airbnb Internal Data (Previously Unused)
      home_tier: scrapedData.homeTier || null,
      is_available: scrapedData.isAvailable || null,

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

      // Host Information
      host_id: scrapedData.host?.id || null,
      host_name: scrapedData.host?.name || null,
      host_is_superhost: scrapedData.host?.isSuperHost || false,
      host_response_rate: scrapedData.host?.hostDetails
        ? extractHostResponseRate(scrapedData.host.hostDetails)
        : null,
      host_response_time: scrapedData.host?.hostDetails
        ? extractHostResponseTime(scrapedData.host.hostDetails)
        : null,
      host_is_verified: scrapedData.host?.isVerified || false,
      host_profile_image: scrapedData.host?.profileImage || null,
      host_about: scrapedData.host?.about || null,
      host_highlights: scrapedData.host?.highlights || null,
      host_time_as_host_years: scrapedData.host?.timeAsHost
        ? extractHostYears(
            scrapedData.host.timeAsHost.years || scrapedData.host.timeAsHost
          )
        : null,
      host_time_as_host_months: scrapedData.host?.timeAsHost
        ? extractHostMonths(
            scrapedData.host.timeAsHost.months || scrapedData.host.timeAsHost
          )
        : null,
      host_rating_average: scrapedData.host?.ratingAverage || null,
      host_rating_count: scrapedData.host?.ratingCount || null,

      // Co-Hosts (Previously Unused)
      co_hosts: scrapedData.coHosts || null,

      // Location
      coordinates_latitude: scrapedData.coordinates?.latitude || null,
      coordinates_longitude: scrapedData.coordinates?.longitude || null,
      location: scrapedData.location || null,
      location_subtitle: scrapedData.locationSubtitle || null,
      location_descriptions: scrapedData.locationDescriptions || null,
      breadcrumbs: scrapedData.breadcrumbs || null,

      // Pricing
      price_per_night: scrapedData.price?.amount
        ? extractPrice(scrapedData.price.amount)
        : null,
      currency: 'EUR', // DACH market default

      // Images
      images_count: scrapedData.images?.length || null,

      // Amenities (Boolean fields)
      ...amenities,

      // Complex data as JSON
      amenities: scrapedData.amenities || null,
      highlights: scrapedData.highlights || null,
      house_rules: scrapedData.houseRules || null,
      cancellation_policies: scrapedData.cancellationPolicies || null,

      // Brand & Marketing Features (Previously Unused)
      brand_highlights: scrapedData.brandHighlights || null,

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

  /**
   * Transform reviews data for sentiment analysis
   */
  static transformReviewData(reviews: AirbnbReviewData[]) {
    return reviews.map((review) => ({
      id: review.id,
      text: review.text || review.localizedText,
      rating: review.rating,
      createdAt: review.createdAt,
      language: review.language,
      reviewerId: review.reviewer.id,
      reviewerName: review.reviewer.firstName,
      hasResponse: !!review.response,
    }))
  }

  /**
   * Transform availability data for occupancy analysis
   */
  static transformAvailabilityData(availability: AirbnbAvailabilityData[]) {
    const totalDays = availability.length
    const availableDays = availability.filter((d) => d.available).length
    const occupancyRate =
      totalDays > 0 ? ((totalDays - availableDays) / totalDays) * 100 : 0

    return {
      totalDays,
      availableDays,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      availabilityByMonth: this.groupAvailabilityByMonth(availability),
      pricingVariation: this.analyzePricingVariation(availability),
    }
  }

  /**
   * Transform competitor data for market analysis
   */
  static transformCompetitorData(competitors: AirbnbLocationData[]) {
    const competitorAnalysis = competitors.map((comp) => ({
      id: comp.id,
      title: comp.title,
      rating: comp.rating.guestSatisfaction || 0,
      reviewsCount: comp.rating.reviewsCount || 0,
      price: comp.price.amount
        ? parseFloat(comp.price.amount.replace(/[^0-9.]/g, ''))
        : 0,
      isSuperHost: comp.host.isSuperHost,
      propertyType: comp.roomType,
      personCapacity: comp.personCapacity,
    }))

    // Market position analysis
    const ratings = competitorAnalysis.map((c) => c.rating).filter((r) => r > 0)
    const prices = competitorAnalysis.map((c) => c.price).filter((p) => p > 0)

    return {
      competitors: competitorAnalysis,
      marketStats: {
        averageRating:
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0,
        averagePrice:
          prices.length > 0
            ? prices.reduce((a, b) => a + b, 0) / prices.length
            : 0,
        superhostPercentage: Math.round(
          (competitorAnalysis.filter((c) => c.isSuperHost).length /
            competitorAnalysis.length) *
            100
        ),
        totalCompetitors: competitorAnalysis.length,
      },
    }
  }

  /**
   * Create comprehensive data package for scoring system
   */
  static createScoringDataPackage(
    comprehensiveData: ComprehensiveListingData,
    userId: string
  ) {
    const transformedListing = this.transformListingData(
      comprehensiveData.listing,
      userId
    )
    const reviewAnalysis = this.transformReviewData(comprehensiveData.reviews)
    const availabilityAnalysis = this.transformAvailabilityData(
      comprehensiveData.availability
    )
    const competitorAnalysis = this.transformCompetitorData(
      comprehensiveData.competitors
    )

    return {
      listingData: transformedListing,
      additionalData: {
        reviews: reviewAnalysis,
        availability: comprehensiveData.availability, // Raw data for scoring function
        availabilityAnalysis, // Analysis results
        competitors: competitorAnalysis.competitors, // Array for scoring function
        competitorAnalysis, // Full analysis with market stats
        sentimentAnalysis: null, // To be filled by AI service
        scrapingMetadata: {
          scrapedAt: comprehensiveData.scrapedAt,
          dataCompleteness: comprehensiveData.dataCompleteness,
          processingTime: comprehensiveData.processingTime,
        },
      },
    }
  }

  /**
   * Helper: Group availability by month
   */
  private static groupAvailabilityByMonth(
    availability: AirbnbAvailabilityData[]
  ) {
    const monthGroups: Record<string, { available: number; total: number }> = {}

    availability.forEach((day) => {
      const monthKey = day.date.substring(0, 7) // YYYY-MM
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = { available: 0, total: 0 }
      }
      monthGroups[monthKey].total++
      if (day.available) {
        monthGroups[monthKey].available++
      }
    })

    return Object.entries(monthGroups).map(([month, data]) => ({
      month,
      availabilityRate: Math.round((data.available / data.total) * 100),
      totalDays: data.total,
      availableDays: data.available,
    }))
  }

  /**
   * Helper: Analyze pricing variation for dynamic pricing detection
   */
  private static analyzePricingVariation(
    availability: AirbnbAvailabilityData[]
  ) {
    const prices = availability
      .filter((day) => day.price && day.price.amount > 0)
      .map((day) => day.price!.amount)

    if (prices.length === 0) {
      return { hasVariation: false, variation: 0, minPrice: 0, maxPrice: 0 }
    }

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const variation =
      maxPrice > 0 ? ((maxPrice - minPrice) / minPrice) * 100 : 0

    return {
      hasVariation: variation > 5, // 5% variation threshold
      variation: Math.round(variation * 100) / 100,
      minPrice,
      maxPrice,
      averagePrice:
        Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) /
        100,
    }
  }

  /**
   * Update existing listing with new scraped data
   */
  static updateListingWithScrapedData(
    existingListing: ListingRow,
    scrapedData: AirbnbListingData
  ): Partial<ListingRow> {
    const transformed = this.transformListingData(
      scrapedData,
      existingListing.user_id
    )

    // Only update fields that have new data, preserve existing data
    const updates: Partial<ListingRow> = {
      ...transformed,
      id: existingListing.id, // Preserve database ID
      created_at: existingListing.created_at, // Preserve creation date
      updated_at: new Date().toISOString(),
      analysis_status: 'analyzing',
    }

    return updates
  }
}
