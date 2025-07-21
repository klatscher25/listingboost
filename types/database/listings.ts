/**
 * @file types/database/listings.ts
 * @description Listings and analysis table definitions - the core business entities
 * @created 2025-07-21
 * @todo F002-02: Listings table schema
 */

import type {
  Json,
  BaseRow,
  BaseInsert,
  BaseUpdate,
  UserRelation,
  AnalysisType,
  AnalysisStatus,
  AnalysisMetadata
} from './core'

/**
 * LISTINGS TABLE - Complete Airbnb listing data (restored from original backup)
 */
export interface ListingsTable {
  Row: BaseRow & UserRelation & {
    // Organization relationship  
    organization_id: string | null
    
    // Core status
    is_archived: boolean
    analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed'
    
    // Airbnb identifiers
    airbnb_id: string
    airbnb_url: string
    home_tier: number | null
    
    // Basic info
    title: string | null
    seo_title: string | null
    meta_description: string | null
    sharing_config_title: string | null
    description: string | null
    html_description: Json | null
    sub_description: Json | null
    description_language: string | null
    
    // Property details
    property_type: string | null
    room_type: string | null
    person_capacity: number | null
    bedroom_count: number | null
    bed_count: number | null
    bathroom_count: number | null
    
    // Location
    location: string | null
    location_subtitle: string | null
    coordinates_latitude: number | null
    coordinates_longitude: number | null
    location_descriptions: Json | null
    breadcrumbs: Json | null
    
    // Ratings and reviews
    overall_rating: number | null
    rating_accuracy: number | null
    rating_checkin: number | null
    rating_cleanliness: number | null
    rating_communication: number | null
    rating_location: number | null
    rating_value: number | null
    reviews_count: number | null
    
    // Host information
    host_id: string | null
    host_name: string | null
    host_profile_image: string | null
    host_is_superhost: boolean | null
    host_is_verified: boolean | null
    host_response_rate: string | null
    host_response_time: string | null
    host_rating_average: number | null
    host_rating_count: number | null
    host_time_as_host_months: number | null
    host_time_as_host_years: number | null
    host_about: string | null
    host_highlights: Json | null
    co_hosts: Json | null
    
    // Pricing
    price_per_night: number | null
    original_price: number | null
    discounted_price: number | null
    price_qualifier: string | null
    price_breakdown: Json | null
    currency: string
    
    // Media
    thumbnail_url: string | null
    images: Json | null
    images_count: number | null
    
    // Amenities (complete list from original)
    amenities: Json | null
    wifi_available: boolean | null
    kitchen_available: boolean | null
    parking_available: boolean | null
    air_conditioning_available: boolean | null
    heating_available: boolean | null
    pets_allowed: boolean | null
    self_checkin_available: boolean | null
    washer_available: boolean | null
    dryer_available: boolean | null
    dishwasher_available: boolean | null
    tv_available: boolean | null
    hair_dryer_available: boolean | null
    iron_available: boolean | null
    dedicated_workspace_available: boolean | null
    private_entrance_available: boolean | null
    refrigerator_available: boolean | null
    stove_available: boolean | null
    microwave_available: boolean | null
    coffee_maker_available: boolean | null
    toaster_available: boolean | null
    dining_table_available: boolean | null
    cooking_basics_available: boolean | null
    smoke_alarm_available: boolean | null
    fire_extinguisher_available: boolean | null
    first_aid_kit_available: boolean | null
    carbon_monoxide_alarm_available: boolean | null
    hot_tub_available: boolean | null
    pool_available: boolean | null
    gym_available: boolean | null
    elevator_available: boolean | null
    balcony_available: boolean | null
    long_term_stays_allowed: boolean | null
    instant_book_available: boolean | null
    luggage_dropoff_allowed: boolean | null
    crib_available: boolean | null
    high_chair_available: boolean | null
    pack_n_play_available: boolean | null
    
    // Rules and policies
    house_rules: Json | null
    cancellation_policies: Json | null
    minimum_stay: number | null
    maximum_stay: number | null
    
    // Marketing
    highlights: Json | null
    brand_highlights: Json | null
    
    // Availability and links
    is_available: boolean | null
    android_link: string | null
    ios_link: string | null
    
    // Scraping metadata
    raw_scraped_data: Json | null
    last_scraped_at: string | null
  }
  Insert: BaseInsert & UserRelation & {
    // Organization relationship
    organization_id?: string | null
    
    // Core fields (required)
    airbnb_id: string
    airbnb_url: string
    
    // Status fields
    is_archived?: boolean
    analysis_status?: 'pending' | 'analyzing' | 'completed' | 'failed'
    
    // Optional fields
    home_tier?: number | null
    title?: string | null
    seo_title?: string | null
    meta_description?: string | null
    sharing_config_title?: string | null
    description?: string | null
    html_description?: Json | null
    sub_description?: Json | null
    description_language?: string | null
    property_type?: string | null
    room_type?: string | null
    person_capacity?: number | null
    bedroom_count?: number | null
    bed_count?: number | null
    bathroom_count?: number | null
    location?: string | null
    location_subtitle?: string | null
    coordinates_latitude?: number | null
    coordinates_longitude?: number | null
    location_descriptions?: Json | null
    breadcrumbs?: Json | null
    overall_rating?: number | null
    rating_accuracy?: number | null
    rating_checkin?: number | null
    rating_cleanliness?: number | null
    rating_communication?: number | null
    rating_location?: number | null
    rating_value?: number | null
    reviews_count?: number | null
    host_id?: string | null
    host_name?: string | null
    host_profile_image?: string | null
    host_is_superhost?: boolean | null
    host_is_verified?: boolean | null
    host_response_rate?: string | null
    host_response_time?: string | null
    host_rating_average?: number | null
    host_rating_count?: number | null
    host_time_as_host_months?: number | null
    host_time_as_host_years?: number | null
    host_about?: string | null
    host_highlights?: Json | null
    co_hosts?: Json | null
    price_per_night?: number | null
    original_price?: number | null
    discounted_price?: number | null
    price_qualifier?: string | null
    price_breakdown?: Json | null
    currency?: string
    thumbnail_url?: string | null
    images?: Json | null
    images_count?: number | null
    amenities?: Json | null
    wifi_available?: boolean | null
    kitchen_available?: boolean | null
    parking_available?: boolean | null
    air_conditioning_available?: boolean | null
    heating_available?: boolean | null
    pets_allowed?: boolean | null
    self_checkin_available?: boolean | null
    washer_available?: boolean | null
    dryer_available?: boolean | null
    dishwasher_available?: boolean | null
    tv_available?: boolean | null
    hair_dryer_available?: boolean | null
    iron_available?: boolean | null
    dedicated_workspace_available?: boolean | null
    private_entrance_available?: boolean | null
    refrigerator_available?: boolean | null
    stove_available?: boolean | null
    microwave_available?: boolean | null
    coffee_maker_available?: boolean | null
    toaster_available?: boolean | null
    dining_table_available?: boolean | null
    cooking_basics_available?: boolean | null
    smoke_alarm_available?: boolean | null
    fire_extinguisher_available?: boolean | null
    first_aid_kit_available?: boolean | null
    carbon_monoxide_alarm_available?: boolean | null
    hot_tub_available?: boolean | null
    pool_available?: boolean | null
    gym_available?: boolean | null
    elevator_available?: boolean | null
    balcony_available?: boolean | null
    long_term_stays_allowed?: boolean | null
    instant_book_available?: boolean | null
    luggage_dropoff_allowed?: boolean | null
    crib_available?: boolean | null
    high_chair_available?: boolean | null
    pack_n_play_available?: boolean | null
    house_rules?: Json | null
    cancellation_policies?: Json | null
    minimum_stay?: number | null
    maximum_stay?: number | null
    highlights?: Json | null
    brand_highlights?: Json | null
    is_available?: boolean | null
    android_link?: string | null
    ios_link?: string | null
    raw_scraped_data?: Json | null
    last_scraped_at?: string | null
  }
  Update: {
    [K in keyof ListingsTable['Insert']]?: ListingsTable['Insert'][K]
  }
}

/**
 * ANALYSIS RESULTS TABLE - Scoring and insights
 */
export interface AnalysisResultsTable {
  Row: BaseRow & UserRelation & {
    listing_id: string
    analysis_type: AnalysisType
    status: AnalysisStatus
    
    // Core scores
    total_score: number | null
    score_breakdown: Json | null
    
    // Analysis results
    recommendations: Json | null
    ai_insights: string | null
    market_comparison: Json | null
    
    // Processing metadata
    processing_started_at: string | null
    processing_completed_at: string | null
    processing_duration_seconds: number | null
    error_message: string | null
    metadata: AnalysisMetadata | null
  }
  Insert: BaseInsert & UserRelation & {
    listing_id: string
    analysis_type: AnalysisType
    status?: AnalysisStatus
    total_score?: number | null
    score_breakdown?: Json | null
    recommendations?: Json | null
    ai_insights?: string | null
    market_comparison?: Json | null
    processing_started_at?: string | null
    processing_completed_at?: string | null
    processing_duration_seconds?: number | null
    error_message?: string | null
    metadata?: AnalysisMetadata | null
  }
  Update: BaseUpdate & {
    user_id?: string
    listing_id?: string
    analysis_type?: AnalysisType
    status?: AnalysisStatus
    total_score?: number | null
    score_breakdown?: Json | null
    recommendations?: Json | null
    ai_insights?: string | null
    market_comparison?: Json | null
    processing_started_at?: string | null
    processing_completed_at?: string | null
    processing_duration_seconds?: number | null
    error_message?: string | null
    metadata?: AnalysisMetadata | null
  }
}