/**
 * @file lib/services/apify/types.ts
 * @description TypeScript types for Apify scraper responses
 * @created 2025-07-21
 * @todo CORE-001-02: Apify Scraper Integration Pipeline
 */

/**
 * Base type for all Apify actor results
 */
export interface ApifyActorResult<T = unknown> {
  data: T[]
  executionId: string
  status: 'SUCCEEDED' | 'FAILED' | 'TIMED_OUT' | 'ABORTED'
  statusMessage?: string
  error?: {
    type: string
    message: string
  }
}

/**
 * Airbnb URL Scraper (tri_angle/airbnb-rooms-urls-scraper) Response
 */
export interface AirbnbListingData {
  id: string
  url: string
  title: string
  description?: string
  propertyType: string
  roomType: string
  personCapacity: number
  bedrooms?: number
  beds?: number
  baths?: number

  // Ratings
  rating: {
    accuracy?: number
    checkin?: number
    cleanliness?: number
    communication?: number
    location?: number
    value?: number
    guestSatisfaction?: number
    reviewsCount: number
  }

  // Host Information
  host: {
    id: string
    name: string
    firstName?: string
    isSuperHost: boolean
    profileImage?: string
    about?: string[]
    highlights?: string[]
    responseRate?: string
    responseTime?: string
    timeAsHost?: string
    verificationLevel?: string
  }

  // Location & Coordinates
  coordinates?: {
    latitude: number
    longitude: number
  }

  // Pricing
  price: {
    amount: string
    qualifier: string
    label: string
    breakDown?: {
      basePrice?: {
        description: string
        price: string
      }
      serviceFee?: {
        description: string
        price: string
      }
      cleaningFee?: {
        description: string
        price: string
      }
      totalBeforeTaxes?: {
        description: string
        price: string
      }
    }
  }

  // Images
  images?: Array<{
    url: string
    caption?: string
    orientation?: 'LANDSCAPE' | 'PORTRAIT'
    width?: number
    height?: number
  }>

  // Amenities
  amenities: Array<{
    title: string
    values: Array<{
      title: string
      subtitle?: string
      icon: string
      available: boolean | string
    }>
  }>

  // Highlights
  highlights?: Array<{
    title: string
    subtitle?: string
    icon?: string
    type?: string
  }>

  // Location Descriptions
  locationDescriptions?: Array<{
    title: string
    content: string
  }>

  // House Rules
  houseRules?: {
    general?: Array<{
      title: string
      values: Array<{
        title: string
        icon: string
      }>
    }>
    additional?: string
  }

  // Availability & Booking
  minimumStay?: number
  instantBookable?: boolean

  // Language & Locale
  locale?: string
  language?: string

  // Co-hosts
  coHosts?: Array<{
    id: string
    name: string
    profileImage?: string
  }>
}

/**
 * Airbnb Review Scraper (tri_angle/airbnb-reviews-scraper) Response
 */
export interface AirbnbReviewData {
  id: string
  startUrl: string
  language: string
  text: string
  localizedText?: string
  localizedReview?: string | null
  createdAt: string
  rating: number

  // Reviewer Information
  reviewer: {
    id: string
    firstName: string
    hostName: string
    pictureUrl?: string
    profilePath: string
    profilePicture?: string
  }

  // Reviewee (Host) Information
  reviewee: {
    id: string
    firstName: string
    hostName: string
    pictureUrl?: string
    profilePath: string
    profilePicture?: string
  }

  // Review Metadata
  reviewHighlight?: string
  highlightType?: string
  response?: string | null
  ratingAccessibilityLabel?: string
}

/**
 * Airbnb Availability Scraper (rigelbytes/airbnb-availability-calendar) Response
 */
export interface AirbnbAvailabilityData {
  date: string
  available: boolean
  availableForCheckin: boolean
  availableForCheckout: boolean
  price?: {
    amount: number
    currency: string
  }
  minimumStay?: number
}

/**
 * Airbnb Location Scraper (tri_angle/airbnb-scraper) Response
 */
export interface AirbnbLocationData {
  id: string
  url: string
  androidLink: string
  iosLink: string
  title: string
  description: string
  descriptionOriginalLanguage: string
  thumbnail: string

  // Property Details
  roomType: string
  propertyType?: string
  personCapacity: number

  // Location
  coordinates?: {
    latitude: number
    longitude: number
  }

  // Ratings
  rating: {
    accuracy?: number
    checkin?: number
    cleanliness?: number
    communication?: number
    location?: number
    value?: number
    guestSatisfaction?: number
    reviewsCount: number
  }

  // Host Information
  host: {
    id: string
    name: string
    isSuperHost: boolean
    profileImage?: string
    highlights?: string[]
    about?: string[]
  }

  // Pricing
  price: {
    amount: string
    qualifier: string
    label: string
    breakDown?: {
      basePrice?: {
        description: string
        price: string
      }
      serviceFee?: {
        description: string
        price: string
      }
      totalBeforeTaxes?: {
        description: string
        price: string
      }
    }
  }

  // Property Features
  subDescription?: {
    title: string
    items: string[]
  }

  // Amenities (same structure as main listing)
  amenities: Array<{
    title: string
    values: Array<{
      title: string
      subtitle?: string
      icon: string
      available: boolean | string
    }>
  }>

  // Highlights
  highlights?: Array<{
    title: string
    subtitle?: string
    icon?: string
  }>

  // Location Descriptions
  locationDescriptions?: Array<{
    title: string
    content: string
  }>

  // House Rules
  houseRules?: {
    general?: Array<{
      title: string
      values: Array<{
        title: string
        icon: string
      }>
    }>
    additional?: string
  }

  // Images
  images?: Array<{
    url: string
    caption?: string
  }>

  // Co-hosts
  coHosts?: Array<{
    id: string
    name: string
  }>

  // Language & Locale
  locale?: string
  language?: string

  // Superhost Status
  isSuperHost: boolean
  homeTier?: number
}

/**
 * Error types for Apify operations
 */
export interface ApifyError {
  type:
    | 'RATE_LIMIT'
    | 'TIMEOUT'
    | 'INVALID_INPUT'
    | 'NETWORK_ERROR'
    | 'ACTOR_ERROR'
  message: string
  details?: unknown
  retryAfter?: number
  actorId?: string
  executionId?: string
}

/**
 * Request options for Apify actors
 */
export interface ApifyRequestOptions {
  timeout?: number
  memory?: number
  retries?: number
  priority?: number
  webhookUrl?: string
}

/**
 * Consolidated data from all scrapers
 */
export interface ComprehensiveListingData {
  // From URL Scraper
  listing: AirbnbListingData

  // From Review Scraper
  reviews: AirbnbReviewData[]

  // From Availability Scraper
  availability: AirbnbAvailabilityData[]

  // From Location Scraper (competitors)
  competitors: AirbnbLocationData[]

  // Analysis metadata
  scrapedAt: string
  dataCompleteness: {
    listing: boolean
    reviews: boolean
    availability: boolean
    competitors: boolean
  }

  // Processing status
  processingTime: {
    listing: number
    reviews: number
    availability: number
    competitors: number
    total: number
  }
}
