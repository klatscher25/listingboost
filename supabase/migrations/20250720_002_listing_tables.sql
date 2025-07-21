-- ===================================================================
-- ListingBoost Pro - Listing Tables Schema
-- Created: 2025-07-20
-- Purpose: Core listing tables for Airbnb data
-- ===================================================================

-- ===================================================================
-- MAIN LISTINGS TABLE
-- ===================================================================

-- listings table - Main table for all Airbnb listing data from listing scraper
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Organization & archiving (SaaS integration)
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    is_archived BOOLEAN DEFAULT false,
    
    -- Status tracking
    analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'failed')),
    
    -- Airbnb identification & rankings
    airbnb_id TEXT UNIQUE NOT NULL,
    airbnb_url TEXT NOT NULL,
    home_tier INTEGER,
    
    -- Title & SEO data (for title scoring)
    title TEXT,
    seo_title TEXT,
    meta_description TEXT,
    sharing_config_title TEXT,
    
    -- Description data (for content scoring)
    description TEXT,
    html_description JSONB,
    sub_description JSONB,
    description_language TEXT,
    
    -- Property details (for category scoring)
    property_type TEXT,
    room_type TEXT,
    person_capacity INTEGER CHECK (person_capacity > 0),
    bedroom_count INTEGER,
    bed_count INTEGER,
    bathroom_count INTEGER,
    
    -- Location data (for location scoring)
    location TEXT,
    location_subtitle TEXT,
    coordinates_latitude DECIMAL,
    coordinates_longitude DECIMAL,
    location_descriptions JSONB,
    breadcrumbs JSONB,
    
    -- Rating data (for quality scoring)
    overall_rating DECIMAL CHECK (overall_rating >= 0.0 AND overall_rating <= 5.0),
    rating_accuracy DECIMAL CHECK (rating_accuracy >= 0.0 AND rating_accuracy <= 5.0),
    rating_checkin DECIMAL CHECK (rating_checkin >= 0.0 AND rating_checkin <= 5.0),
    rating_cleanliness DECIMAL CHECK (rating_cleanliness >= 0.0 AND rating_cleanliness <= 5.0),
    rating_communication DECIMAL CHECK (rating_communication >= 0.0 AND rating_communication <= 5.0),
    rating_location DECIMAL CHECK (rating_location >= 0.0 AND rating_location <= 5.0),
    rating_value DECIMAL CHECK (rating_value >= 0.0 AND rating_value <= 5.0),
    reviews_count INTEGER,
    
    -- Host data (for trust scoring)
    host_id TEXT,
    host_name TEXT,
    host_profile_image TEXT,
    host_is_superhost BOOLEAN,
    host_is_verified BOOLEAN,
    host_response_rate TEXT,
    host_response_time TEXT,
    host_rating_average DECIMAL,
    host_rating_count INTEGER,
    host_time_as_host_months INTEGER,
    host_time_as_host_years INTEGER,
    host_about TEXT,
    host_highlights JSONB,
    co_hosts JSONB,
    
    -- Price data (for value scoring)
    price_per_night INTEGER, -- in cents
    original_price INTEGER,
    discounted_price INTEGER,
    price_qualifier TEXT,
    price_breakdown JSONB,
    currency TEXT DEFAULT 'EUR',
    
    -- Image data (for photo scoring)
    thumbnail_url TEXT,
    images JSONB,
    images_count INTEGER,
    
    -- Amenities data for detailed feature scoring
    amenities JSONB,
    
    -- Essential features
    wifi_available BOOLEAN,
    kitchen_available BOOLEAN,
    parking_available BOOLEAN,
    air_conditioning_available BOOLEAN,
    heating_available BOOLEAN,
    pets_allowed BOOLEAN,
    self_checkin_available BOOLEAN,
    
    -- Comfort & convenience
    washer_available BOOLEAN,
    dryer_available BOOLEAN,
    dishwasher_available BOOLEAN,
    tv_available BOOLEAN,
    hair_dryer_available BOOLEAN,
    iron_available BOOLEAN,
    dedicated_workspace_available BOOLEAN,
    private_entrance_available BOOLEAN,
    
    -- Kitchen & dining
    refrigerator_available BOOLEAN,
    stove_available BOOLEAN,
    microwave_available BOOLEAN,
    coffee_maker_available BOOLEAN,
    toaster_available BOOLEAN,
    dining_table_available BOOLEAN,
    cooking_basics_available BOOLEAN,
    
    -- Safety & security
    smoke_alarm_available BOOLEAN,
    fire_extinguisher_available BOOLEAN,
    first_aid_kit_available BOOLEAN,
    carbon_monoxide_alarm_available BOOLEAN,
    
    -- Premium features
    hot_tub_available BOOLEAN,
    pool_available BOOLEAN,
    gym_available BOOLEAN,
    elevator_available BOOLEAN,
    balcony_available BOOLEAN,
    
    -- Host service level
    long_term_stays_allowed BOOLEAN,
    instant_book_available BOOLEAN,
    luggage_dropoff_allowed BOOLEAN,
    
    -- Family-friendly
    crib_available BOOLEAN,
    high_chair_available BOOLEAN,
    pack_n_play_available BOOLEAN,
    
    -- Booking rules (for UX scoring)
    house_rules JSONB,
    cancellation_policies JSONB,
    minimum_stay INTEGER,
    maximum_stay INTEGER,
    
    -- Marketing & highlights (for marketing scoring)
    highlights JSONB,
    brand_highlights JSONB,
    
    -- Availability
    is_available BOOLEAN,
    
    -- Deep links
    android_link TEXT,
    ios_link TEXT,
    
    -- Backup & metadata
    raw_scraped_data JSONB,
    last_scraped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- LISTING REVIEWS TABLE
-- ===================================================================

-- listing_reviews table - Individual review data from review scraper
CREATE TABLE listing_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    airbnb_review_id TEXT UNIQUE NOT NULL,
    
    -- Review identification
    start_url TEXT,
    language TEXT,
    
    -- Review content
    text TEXT,
    localized_text TEXT,
    localized_review TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Review timing
    created_at_airbnb TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Reviewer data
    reviewer_id TEXT,
    reviewer_first_name TEXT,
    reviewer_host_name TEXT,
    reviewer_picture_url TEXT,
    reviewer_profile_path TEXT,
    reviewer_profile_picture TEXT,
    
    -- Host response
    response TEXT,
    reviewee_id TEXT,
    reviewee_first_name TEXT,
    reviewee_host_name TEXT,
    reviewee_picture_url TEXT,
    reviewee_profile_path TEXT,
    reviewee_profile_picture TEXT,
    
    -- Review categorization
    review_highlight TEXT,
    highlight_type TEXT,
    rating_accessibility_label TEXT,
    
    -- AI sentiment analysis (to be populated by Gemini)
    sentiment_score DECIMAL CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    sentiment_category TEXT CHECK (sentiment_category IN ('positive', 'neutral', 'negative')),
    topic_categories JSONB,
    quality_indicators JSONB,
    emotional_tone TEXT,
    
    -- Metadata
    raw_scraped_data JSONB,
    analyzed_at TIMESTAMPTZ
);

-- ===================================================================
-- LISTING IMAGES TABLE
-- ===================================================================

-- listing_images table - Separate table for detailed image analysis
CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    orientation TEXT CHECK (orientation IN ('LANDSCAPE', 'PORTRAIT')),
    position_order INTEGER,
    
    -- AI image analysis (to be implemented later)
    ai_analysis JSONB,
    room_category TEXT,
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    lighting_score INTEGER CHECK (lighting_score >= 0 AND lighting_score <= 100),
    composition_score INTEGER CHECK (composition_score >= 0 AND composition_score <= 100),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Uniqueness constraint
    UNIQUE(listing_id, position_order)
);

-- ===================================================================
-- LISTING AVAILABILITY TABLE
-- ===================================================================

-- listing_availability table - Daily availability data from availability scraper
CREATE TABLE listing_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Availability data
    date DATE NOT NULL,
    available BOOLEAN,
    available_for_checkin BOOLEAN,
    available_for_checkout BOOLEAN,
    
    -- Price data for this day
    price_per_night INTEGER, -- in cents
    minimum_stay INTEGER,
    currency TEXT DEFAULT 'EUR',
    
    -- Booking restrictions
    blocked_reason TEXT,
    special_event TEXT,
    seasonal_pricing BOOLEAN,
    
    -- Metadata
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    data_source TEXT DEFAULT 'apify-availability-scraper',
    
    -- Uniqueness constraint
    UNIQUE(listing_id, date)
);

-- ===================================================================
-- PRICE CHECKS TABLE
-- ===================================================================

-- price_checks table - Historical price tracking from availability scraper
CREATE TABLE price_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Price request
    check_in_date DATE,
    check_out_date DATE,
    guest_count INTEGER,
    
    -- Price results
    price_per_night INTEGER, -- in cents
    total_price INTEGER,
    original_price INTEGER,
    discounted_price INTEGER,
    is_available BOOLEAN,
    currency TEXT DEFAULT 'EUR',
    
    -- Competitor comparison (from location scraper)
    avg_competitor_price INTEGER,
    competitor_count INTEGER,
    price_position TEXT CHECK (price_position IN ('above_average', 'competitive', 'below_average')),
    price_percentile INTEGER CHECK (price_percentile >= 0 AND price_percentile <= 100),
    market_context JSONB,
    
    -- Availability details
    booking_restrictions JSONB,
    minimum_stay_required INTEGER,
    instant_book_available BOOLEAN,
    
    -- Metadata
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    raw_scraped_data JSONB
);

-- ===================================================================
-- LOCATION COMPETITORS TABLE
-- ===================================================================

-- location_competitors table - Competitor listings from location scraper
CREATE TABLE location_competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_location TEXT NOT NULL,
    airbnb_id TEXT NOT NULL,
    
    -- Basic listing data
    title TEXT,
    description TEXT,
    description_language TEXT,
    url TEXT,
    thumbnail TEXT,
    android_link TEXT,
    ios_link TEXT,
    
    -- Property details for comparison
    room_type TEXT,
    person_capacity INTEGER,
    bedroom_count INTEGER,
    bed_count INTEGER,
    bathroom_count INTEGER,
    property_type TEXT,
    
    -- Location data
    coordinates_latitude DECIMAL,
    coordinates_longitude DECIMAL,
    location_descriptions JSONB,
    
    -- Rating data for benchmarking
    overall_rating DECIMAL CHECK (overall_rating >= 0.0 AND overall_rating <= 5.0),
    rating_accuracy DECIMAL CHECK (rating_accuracy >= 0.0 AND rating_accuracy <= 5.0),
    rating_checkin DECIMAL CHECK (rating_checkin >= 0.0 AND rating_checkin <= 5.0),
    rating_cleanliness DECIMAL CHECK (rating_cleanliness >= 0.0 AND rating_cleanliness <= 5.0),
    rating_communication DECIMAL CHECK (rating_communication >= 0.0 AND rating_communication <= 5.0),
    rating_location DECIMAL CHECK (rating_location >= 0.0 AND rating_location <= 5.0),
    rating_value DECIMAL CHECK (rating_value >= 0.0 AND rating_value <= 5.0),
    reviews_count INTEGER,
    
    -- Host information
    host_id TEXT,
    host_name TEXT,
    host_is_superhost BOOLEAN,
    host_profile_image TEXT,
    host_highlights JSONB,
    host_about JSONB,
    co_hosts JSONB,
    
    -- Price data for market benchmarking
    price_per_night INTEGER, -- in cents
    price_amount TEXT,
    price_qualifier TEXT,
    price_breakdown JSONB,
    cleaning_fee INTEGER,
    service_fee INTEGER,
    total_before_taxes INTEGER,
    currency TEXT DEFAULT 'USD',
    
    -- Amenities data for feature comparison
    amenities JSONB,
    wifi_available BOOLEAN,
    kitchen_available BOOLEAN,
    parking_available BOOLEAN,
    air_conditioning_available BOOLEAN,
    pets_allowed BOOLEAN,
    self_checkin_available BOOLEAN,
    
    -- Booking rules for comparison
    house_rules JSONB,
    minimum_stay INTEGER,
    instant_book_available BOOLEAN,
    
    -- Marketing features
    highlights JSONB,
    home_tier INTEGER,
    
    -- Market analysis data
    distance_to_center_km DECIMAL,
    neighborhood TEXT,
    locale TEXT,
    language TEXT,
    
    -- Metadata
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    search_parameters JSONB,
    data_source TEXT DEFAULT 'apify-location-scraper',
    raw_scraped_data JSONB,
    
    -- Uniqueness constraint
    UNIQUE(search_location, airbnb_id, scraped_at)
);

-- ===================================================================
-- LISTING SCORES TABLE
-- ===================================================================

-- listing_scores table - AI ratings and scoring results
CREATE TABLE listing_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Scoring placeholder (details to be defined later)
    overall_score INTEGER,
    category_scores JSONB,
    scoring_details JSONB,
    
    -- AI analysis data
    gemini_analysis_raw TEXT,
    improvement_recommendations JSONB,
    analysis_summary JSONB,
    
    -- Scoring metadata
    scored_at TIMESTAMPTZ DEFAULT NOW(),
    gemini_model_version TEXT DEFAULT 'gemini-2.5-flash',
    scoring_version TEXT,
    scoring_methodology TEXT
);

-- ===================================================================
-- UPDATE TRIGGERS
-- ===================================================================

-- Add triggers for tables with updated_at
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- PERFORMANCE INDEXES
-- ===================================================================

-- Critical indexes for performance
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_airbnb_id ON listings(airbnb_id);
CREATE INDEX idx_listings_overall_rating ON listings(overall_rating);
CREATE INDEX idx_listings_analysis_status ON listings(analysis_status);
CREATE INDEX idx_listings_organization ON listings(organization_id);

CREATE INDEX idx_listing_reviews_listing_id ON listing_reviews(listing_id);
CREATE INDEX idx_listing_reviews_rating ON listing_reviews(rating);
CREATE INDEX idx_listing_reviews_airbnb_id ON listing_reviews(airbnb_review_id);

CREATE INDEX idx_listing_images_listing_order ON listing_images(listing_id, position_order);

CREATE INDEX idx_listing_availability_listing_date ON listing_availability(listing_id, date);
CREATE INDEX idx_listing_availability_date_available ON listing_availability(date, available);

CREATE INDEX idx_price_checks_listing_checked ON price_checks(listing_id, checked_at);

CREATE INDEX idx_location_competitors_search_scraped ON location_competitors(search_location, scraped_at);
CREATE INDEX idx_location_competitors_airbnb_id ON location_competitors(airbnb_id);
CREATE INDEX idx_location_competitors_price ON location_competitors(price_per_night);

CREATE INDEX idx_listing_scores_listing_id ON listing_scores(listing_id);
CREATE INDEX idx_listing_scores_overall_score ON listing_scores(overall_score);

-- ===================================================================
-- SUCCESS CONFIRMATION
-- ===================================================================

-- Log successful migration
INSERT INTO audit_logs (action, resource_type, new_values, created_at) 
VALUES ('migration_completed', 'database', '{"migration": "20250720_002_listing_tables", "tables_created": 7}'::jsonb, NOW());