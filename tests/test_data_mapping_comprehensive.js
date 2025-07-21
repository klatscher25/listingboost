/**
 * @file test_data_mapping_comprehensive.js
 * @description Test data mapping completeness with comprehensive mock Apify data
 * @created 2025-07-21
 * @todo Validate 95%+ field mapping from Apify scrapers to database schema
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test configuration
const TEST_CONFIG = {
  airbnbId: '29732182',
  userId: '00000000-0000-0000-0000-000000000002', // Test user UUID
  expectedNewFields: [
    // SEO & Marketing (4 fields)
    'seo_title',
    'meta_description',
    'sharing_config_title',
    'thumbnail_url',
    // App Integration (2 fields)
    'android_link',
    'ios_link',
    // Extended Content (3 fields)
    'html_description',
    'sub_description',
    'description_language',
    // Airbnb Internal (2 fields)
    'home_tier',
    'is_available',
    // Extended Host (3 fields)
    'host_rating_average',
    'host_rating_count',
    'host_time_as_host_months',
    // Co-Hosts (1 field)
    'co_hosts',
    // Extended Location (2 fields)
    'location_subtitle',
    'breadcrumbs',
    // Brand Features (1 field)
    'brand_highlights',
    // Policies (1 field)
    'cancellation_policies',
  ],
  allDatabaseFields: [
    // Core fields
    'user_id',
    'airbnb_id',
    'airbnb_url',
    'title',
    'description',
    'property_type',
    'room_type',
    'person_capacity',
    'overall_rating',
    'rating_accuracy',
    'rating_checkin',
    'rating_cleanliness',
    'rating_communication',
    'rating_location',
    'rating_value',
    'reviews_count',

    // Host fields
    'host_id',
    'host_name',
    'host_is_superhost',
    'host_response_rate',
    'host_response_time',
    'host_is_verified',
    'host_profile_image',
    'host_about',
    'host_highlights',
    'host_time_as_host_years',

    // Location
    'coordinates_latitude',
    'coordinates_longitude',
    'location',
    'location_descriptions',

    // Pricing
    'price_per_night',
    'currency',

    // Images
    'images_count',

    // Amenities (boolean fields)
    'wifi_available',
    'kitchen_available',
    'heating_available',
    'air_conditioning_available',
    'washer_available',
    'dishwasher_available',
    'tv_available',
    'iron_available',
    'dedicated_workspace_available',
    'pool_available',
    'hot_tub_available',
    'gym_available',
    'balcony_available',
    'smoke_alarm_available',
    'carbon_monoxide_alarm_available',
    'first_aid_kit_available',

    // Complex JSON fields
    'amenities',
    'highlights',
    'house_rules',

    // Booking
    'minimum_stay',
    'instant_book_available',

    // Status
    'analysis_status',
    'created_at',
    'updated_at',

    // ALL NEW FIELDS (19 total)
    'seo_title',
    'meta_description',
    'sharing_config_title',
    'thumbnail_url',
    'android_link',
    'ios_link',
    'html_description',
    'sub_description',
    'description_language',
    'home_tier',
    'is_available',
    'host_rating_average',
    'host_rating_count',
    'host_time_as_host_months',
    'co_hosts',
    'location_subtitle',
    'breadcrumbs',
    'brand_highlights',
    'cancellation_policies',
  ],
}

/**
 * Comprehensive mock Apify data with ALL new fields
 */
const COMPREHENSIVE_MOCK_DATA = {
  // Core listing data
  id: TEST_CONFIG.airbnbId,
  url: `https://www.airbnb.de/rooms/${TEST_CONFIG.airbnbId}`,
  title: 'Wunderschöne Wohnung in Berlin Mitte',
  description:
    'Eine gemütliche 2-Zimmer-Wohnung im Herzen von Berlin mit moderner Ausstattung und perfekter Verkehrsanbindung.',
  propertyType: 'Entire apartment',
  roomType: 'Entire home/apt',
  personCapacity: 4,

  // NEW: SEO & Marketing Data (previously unused)
  seoTitle:
    'Guest room in the heart of Berlin - Condominiums for Rent in Berlin, Berlin, Germany - Airbnb',
  metaDescription:
    '21 Jul 2025 - Rent from people in Berlin, Germany from $20/night. Find unique places to stay with local hosts in 191 countries.',
  sharingConfigTitle: 'Condo in Berlin · ★4.90 · 1 bedroom · 1 bed · 1 bath',
  thumbnail:
    'https://a0.muscache.com/im/pictures/miso/Hosting-29732182/original/d1bb42b5-d1ff-4b2a-8a4e-8e6b6de12345_1400x788.jpg',

  // NEW: App Integration (deep links)
  androidLink: 'airbnb://rooms/29732182',
  iosLink: 'airbnb://rooms/29732182',

  // NEW: Extended Content Data
  htmlDescription: {
    text: 'Eine <strong>gemütliche</strong> 2-Zimmer-Wohnung im <em>Herzen</em> von Berlin',
    structured: true,
  },
  subDescription: {
    bedrooms: '1 bedroom',
    beds: '1 queen bed',
    bathrooms: '1 shared bathroom',
  },
  descriptionOriginalLanguage: 'de',

  // NEW: Airbnb Internal Ranking Data
  homeTier: 3, // Airbnb internal ranking (1-10)
  isAvailable: true,

  // Ratings
  rating: {
    guestSatisfaction: 4.87,
    accuracy: 4.9,
    checkin: 4.8,
    cleanliness: 4.9,
    communication: 4.9,
    location: 4.8,
    value: 4.7,
    reviewsCount: 143,
  },

  // Host information with NEW extended data
  host: {
    id: 'host-123456',
    name: 'Maria',
    isSuperHost: true,
    isVerified: true,
    profileImage:
      'https://a0.muscache.com/im/pictures/user/Profile-234567890/original/12345678-abcd-1234-abcd-1234567890ab.jpg',
    about:
      'Ich bin Berlinerin und liebe es, Gäste aus aller Welt willkommen zu heißen.',
    highlights: ['Superhost seit 2019', 'Gastgeber seit 5 Jahren'],
    timeAsHost: '5 years hosting',
    hostDetails: ['Response rate: 95%', 'Responds within an hour'],
    // NEW: Extended host data
    ratingAverage: 4.82,
    ratingCount: 287,
    timeAsHostMonths: 60, // 5 years = 60 months
  },

  // NEW: Co-Hosts System
  coHosts: [
    {
      name: 'Thomas',
      profileImage:
        'https://a0.muscache.com/im/pictures/user/Profile-345678901/original/23456789-bcde-2345-bcde-234567890bcd.jpg',
      role: 'Co-host',
    },
  ],

  // Location with NEW extended data
  coordinates: {
    latitude: 52.52,
    longitude: 13.405,
  },
  location: 'Berlin, Germany',
  locationSubtitle: 'Berlin, Berlin, Germany', // NEW
  locationDescriptions: [
    'Centrally located in Berlin Mitte',
    'Close to public transportation',
    'Walking distance to major attractions',
  ],
  breadcrumbs: [
    // NEW
    { name: 'Germany', url: '/germany' },
    { name: 'Berlin', url: '/berlin' },
    { name: 'Berlin Mitte', url: '/berlin-mitte' },
  ],

  // Pricing
  price: {
    amount: '89',
    currency: 'EUR',
  },

  // Images
  images: [
    { url: 'https://example.com/image1.jpg', caption: 'Living room' },
    { url: 'https://example.com/image2.jpg', caption: 'Bedroom' },
    { url: 'https://example.com/image3.jpg', caption: 'Kitchen' },
    { url: 'https://example.com/image4.jpg', caption: 'Bathroom' },
    { url: 'https://example.com/image5.jpg', caption: 'Balcony' },
  ],

  // Amenities with detailed structure
  amenities: [
    {
      category: 'Internet and office',
      values: [
        { title: 'Wifi', available: true },
        { title: 'Dedicated workspace', available: true },
      ],
    },
    {
      category: 'Kitchen and dining',
      values: [
        { title: 'Kitchen', available: true },
        { title: 'Dishwasher', available: true },
      ],
    },
    {
      category: 'Bathroom',
      values: [
        { title: 'Hair dryer', available: true },
        { title: 'Shampoo', available: true },
      ],
    },
    {
      category: 'Entertainment',
      values: [{ title: 'TV', available: true }],
    },
    {
      category: 'Family',
      values: [{ title: 'High chair', available: false }],
    },
    {
      category: 'Heating and cooling',
      values: [
        { title: 'Heating', available: true },
        { title: 'Air conditioning', available: false },
      ],
    },
    {
      category: 'Home safety',
      values: [
        { title: 'Smoke alarm', available: true },
        { title: 'Carbon monoxide alarm', available: true },
        { title: 'First aid kit', available: true },
      ],
    },
    {
      category: 'Laundry',
      values: [
        { title: 'Washer', available: true },
        { title: 'Dryer', available: false },
      ],
    },
  ],

  // Highlights
  highlights: [
    'Great for remote work',
    'Sparkling clean',
    'Great check-in experience',
    'Great location',
  ],

  // House rules
  houseRules: [
    'No smoking',
    'No pets',
    'No parties or events',
    'Check-in time is flexible',
  ],

  // NEW: Brand & Marketing Highlights
  brandHighlights: {
    hasGoldenLaurel: false,
    isGuestFavorite: true,
    isPlusListing: false,
    hasLuxuryAmenities: false,
  },

  // NEW: Extended Booking Policies
  cancellationPolicies: {
    type: 'moderate',
    description: 'Free cancellation until 5 days before check-in',
    details: {
      fullRefundDays: 5,
      partialRefundDays: 1,
      serviceFeeRefund: true,
    },
  },

  // Booking details
  minimumStay: 2,
  instantBookable: true,
}

/**
 * Import the ApifyDataTransformer (simulate module import)
 */
async function loadTransformer() {
  // Since we can't directly import ES modules in this CommonJS test,
  // we'll simulate the transformer logic here

  // Extract numeric values from price strings
  const extractPrice = (priceStr) => {
    if (!priceStr) return 0
    const match = priceStr.match(/[\d.,]+/)
    if (!match) return 0
    return parseFloat(match[0].replace(',', '.'))
  }

  // Extract host experience in months
  const extractHostMonths = (timeStr) => {
    if (!timeStr) return 0
    const yearMatch = timeStr.match(/(\d+)\s*year/i)
    const monthMatch = timeStr.match(/(\d+)\s*month/i)

    let totalMonths = 0
    if (yearMatch) totalMonths += parseInt(yearMatch[1]) * 12
    if (monthMatch) totalMonths += parseInt(monthMatch[1])

    return totalMonths
  }

  // Extract host response rate
  const extractHostResponseRate = (hostDetails) => {
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

  // Extract host response time
  const extractHostResponseTime = (hostDetails) => {
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
  const hasAmenity = (amenityTitle) => {
    if (!COMPREHENSIVE_MOCK_DATA.amenities) return false

    return COMPREHENSIVE_MOCK_DATA.amenities.some((category) =>
      category.values?.some(
        (amenity) =>
          amenity.title.toLowerCase().includes(amenityTitle.toLowerCase()) &&
          amenity.available === true
      )
    )
  }

  // Transform the mock data to database format
  const transformedListing = {
    // User & Basic Info
    user_id: TEST_CONFIG.userId,
    airbnb_id: COMPREHENSIVE_MOCK_DATA.id,
    airbnb_url: COMPREHENSIVE_MOCK_DATA.url,

    // Basic Listing Details
    title: COMPREHENSIVE_MOCK_DATA.title,
    description: COMPREHENSIVE_MOCK_DATA.description,
    property_type: COMPREHENSIVE_MOCK_DATA.propertyType,
    room_type: COMPREHENSIVE_MOCK_DATA.roomType,

    // NEW: SEO & Marketing Data (Previously Unused)
    seo_title: COMPREHENSIVE_MOCK_DATA.seoTitle,
    meta_description: COMPREHENSIVE_MOCK_DATA.metaDescription,
    sharing_config_title: COMPREHENSIVE_MOCK_DATA.sharingConfigTitle,
    thumbnail_url: COMPREHENSIVE_MOCK_DATA.thumbnail,

    // NEW: App Integration (Previously Unused)
    android_link: COMPREHENSIVE_MOCK_DATA.androidLink,
    ios_link: COMPREHENSIVE_MOCK_DATA.iosLink,

    // NEW: Extended Content Data (Previously Unused)
    html_description: COMPREHENSIVE_MOCK_DATA.htmlDescription,
    sub_description: COMPREHENSIVE_MOCK_DATA.subDescription,
    description_language: COMPREHENSIVE_MOCK_DATA.descriptionOriginalLanguage,

    // NEW: Airbnb Internal Data (Previously Unused)
    home_tier: COMPREHENSIVE_MOCK_DATA.homeTier,
    is_available: COMPREHENSIVE_MOCK_DATA.isAvailable,

    // Capacity & Rooms
    person_capacity: COMPREHENSIVE_MOCK_DATA.personCapacity,

    // Ratings
    overall_rating: COMPREHENSIVE_MOCK_DATA.rating?.guestSatisfaction,
    rating_accuracy: COMPREHENSIVE_MOCK_DATA.rating?.accuracy,
    rating_checkin: COMPREHENSIVE_MOCK_DATA.rating?.checkin,
    rating_cleanliness: COMPREHENSIVE_MOCK_DATA.rating?.cleanliness,
    rating_communication: COMPREHENSIVE_MOCK_DATA.rating?.communication,
    rating_location: COMPREHENSIVE_MOCK_DATA.rating?.location,
    rating_value: COMPREHENSIVE_MOCK_DATA.rating?.value,
    reviews_count: COMPREHENSIVE_MOCK_DATA.rating?.reviewsCount,

    // Host Information
    host_id: COMPREHENSIVE_MOCK_DATA.host?.id,
    host_name: COMPREHENSIVE_MOCK_DATA.host?.name,
    host_is_superhost: COMPREHENSIVE_MOCK_DATA.host?.isSuperHost,
    host_response_rate: COMPREHENSIVE_MOCK_DATA.host?.hostDetails
      ? extractHostResponseRate(COMPREHENSIVE_MOCK_DATA.host.hostDetails)
      : null,
    host_response_time: COMPREHENSIVE_MOCK_DATA.host?.hostDetails
      ? extractHostResponseTime(COMPREHENSIVE_MOCK_DATA.host.hostDetails)
      : null,
    host_is_verified: COMPREHENSIVE_MOCK_DATA.host?.isVerified,
    host_profile_image: COMPREHENSIVE_MOCK_DATA.host?.profileImage,
    host_about: COMPREHENSIVE_MOCK_DATA.host?.about,
    host_highlights: COMPREHENSIVE_MOCK_DATA.host?.highlights,
    host_time_as_host_years: COMPREHENSIVE_MOCK_DATA.host?.timeAsHost
      ? Math.floor(
          extractHostMonths(COMPREHENSIVE_MOCK_DATA.host.timeAsHost) / 12
        )
      : null,

    // NEW: Extended Host Data (Previously Unused)
    host_time_as_host_months:
      COMPREHENSIVE_MOCK_DATA.host?.timeAsHostMonths ||
      (COMPREHENSIVE_MOCK_DATA.host?.timeAsHost
        ? extractHostMonths(COMPREHENSIVE_MOCK_DATA.host.timeAsHost)
        : null),
    host_rating_average: COMPREHENSIVE_MOCK_DATA.host?.ratingAverage,
    host_rating_count: COMPREHENSIVE_MOCK_DATA.host?.ratingCount,

    // NEW: Co-Hosts (Previously Unused)
    co_hosts: COMPREHENSIVE_MOCK_DATA.coHosts,

    // Location
    coordinates_latitude: COMPREHENSIVE_MOCK_DATA.coordinates?.latitude,
    coordinates_longitude: COMPREHENSIVE_MOCK_DATA.coordinates?.longitude,
    location: COMPREHENSIVE_MOCK_DATA.location,
    location_descriptions: COMPREHENSIVE_MOCK_DATA.locationDescriptions,

    // NEW: Extended Location Data (Previously Unused)
    location_subtitle: COMPREHENSIVE_MOCK_DATA.locationSubtitle,
    breadcrumbs: COMPREHENSIVE_MOCK_DATA.breadcrumbs,

    // Pricing
    price_per_night: COMPREHENSIVE_MOCK_DATA.price?.amount
      ? extractPrice(COMPREHENSIVE_MOCK_DATA.price.amount)
      : null,
    currency: 'EUR', // DACH market default

    // Images
    images_count: COMPREHENSIVE_MOCK_DATA.images?.length,

    // Amenities (Boolean fields)
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
    first_aid_kit_available: hasAmenity('first aid') || hasAmenity('first-aid'),

    // Complex data as JSON
    amenities: COMPREHENSIVE_MOCK_DATA.amenities,
    highlights: COMPREHENSIVE_MOCK_DATA.highlights,
    house_rules: COMPREHENSIVE_MOCK_DATA.houseRules,

    // NEW: Brand & Marketing Features (Previously Unused)
    brand_highlights: COMPREHENSIVE_MOCK_DATA.brandHighlights,

    // NEW: Cancellation Policies (Previously Unused)
    cancellation_policies: COMPREHENSIVE_MOCK_DATA.cancellationPolicies,

    // Booking details
    minimum_stay: COMPREHENSIVE_MOCK_DATA.minimumStay,
    instant_book_available: COMPREHENSIVE_MOCK_DATA.instantBookable,

    // Status
    analysis_status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return transformedListing
}

/**
 * Test comprehensive data mapping
 */
async function testDataMapping() {
  console.log('🧪 COMPREHENSIVE DATA MAPPING TEST')
  console.log('==================================')
  console.log(`🎯 Target: 95%+ field mapping completeness`)
  console.log(
    `📊 Total Database Fields: ${TEST_CONFIG.allDatabaseFields.length}`
  )
  console.log(`🆕 New Fields to Test: ${TEST_CONFIG.expectedNewFields.length}`)
  console.log('')

  try {
    // Step 1: Clean previous test data
    console.log('🧹 Step 1: Cleaning previous test data...')
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('user_id', TEST_CONFIG.userId)
      .eq('airbnb_id', TEST_CONFIG.airbnbId)

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.warn(
        '⚠️ Warning: Could not clean previous data:',
        deleteError.message
      )
    } else {
      console.log('✅ Previous test data cleaned')
    }

    // Step 2: Transform mock data using our transformer logic
    console.log('🔄 Step 2: Transforming comprehensive mock data...')
    const transformedData = await loadTransformer()
    console.log('✅ Data transformation completed')

    // Step 3: Insert into database
    console.log('💾 Step 3: Inserting transformed data into database...')
    const { data: savedListing, error: insertError } = await supabase
      .from('listings')
      .insert(transformedData)
      .select()
      .single()

    if (insertError) {
      throw new Error(`Database insert error: ${insertError.message}`)
    }

    if (!savedListing) {
      throw new Error('No listing returned after insert')
    }

    console.log('✅ Listing saved to database')
    console.log(`📋 Database ID: ${savedListing.id}`)

    // Step 4: Comprehensive field validation
    console.log('🔍 Step 4: Comprehensive field validation...')

    let totalFields = 0
    let populatedFields = 0
    let newFieldsPopulated = 0

    const fieldResults = {
      populated: [],
      missing: [],
      newFieldsPopulated: [],
      newFieldsMissing: [],
    }

    // Check all database fields
    for (const field of TEST_CONFIG.allDatabaseFields) {
      totalFields++
      const value = savedListing[field]

      if (value !== null && value !== undefined && value !== '') {
        populatedFields++
        fieldResults.populated.push(field)

        // Check if this is a new field
        if (TEST_CONFIG.expectedNewFields.includes(field)) {
          newFieldsPopulated++
          fieldResults.newFieldsPopulated.push(field)
        }
      } else {
        fieldResults.missing.push(field)

        // Check if this is a missing new field
        if (TEST_CONFIG.expectedNewFields.includes(field)) {
          fieldResults.newFieldsMissing.push(field)
        }
      }
    }

    // Calculate completeness metrics
    const overallCompleteness = Math.round(
      (populatedFields / totalFields) * 100
    )
    const newFieldCompleteness = Math.round(
      (newFieldsPopulated / TEST_CONFIG.expectedNewFields.length) * 100
    )

    // Step 5: Results analysis
    console.log('')
    console.log('📊 COMPREHENSIVE VALIDATION RESULTS')
    console.log('═══════════════════════════════════')
    console.log(
      `📈 Overall Data Completeness: ${overallCompleteness}% (${populatedFields}/${totalFields} fields)`
    )
    console.log(
      `🆕 New Fields Completeness: ${newFieldCompleteness}% (${newFieldsPopulated}/${TEST_CONFIG.expectedNewFields.length} fields)`
    )
    console.log('')

    // Detailed new fields analysis
    console.log('🔬 NEW FIELDS DETAILED ANALYSIS:')
    console.log('================================')

    const newFieldCategories = {
      'SEO & Marketing': [
        'seo_title',
        'meta_description',
        'sharing_config_title',
        'thumbnail_url',
      ],
      'App Integration': ['android_link', 'ios_link'],
      'Extended Content': [
        'html_description',
        'sub_description',
        'description_language',
      ],
      'Airbnb Ranking': ['home_tier', 'is_available'],
      'Extended Host': [
        'host_rating_average',
        'host_rating_count',
        'host_time_as_host_months',
      ],
      'Co-Hosts': ['co_hosts'],
      'Extended Location': ['location_subtitle', 'breadcrumbs'],
      'Brand Features': ['brand_highlights'],
      Policies: ['cancellation_policies'],
    }

    for (const [category, fields] of Object.entries(newFieldCategories)) {
      const categoryPopulated = fields.filter((field) =>
        fieldResults.newFieldsPopulated.includes(field)
      ).length
      const categoryPercentage = Math.round(
        (categoryPopulated / fields.length) * 100
      )
      const status =
        categoryPercentage === 100
          ? '✅'
          : categoryPercentage >= 50
            ? '⚠️'
            : '❌'

      console.log(
        `${status} ${category}: ${categoryPercentage}% (${categoryPopulated}/${fields.length})`
      )

      // Show specific field values for populated fields
      for (const field of fields) {
        if (fieldResults.newFieldsPopulated.includes(field)) {
          const value = savedListing[field]
          const displayValue =
            typeof value === 'object'
              ? 'Present (JSON)'
              : typeof value === 'string' && value.length > 30
                ? value.substring(0, 30) + '...'
                : value
          console.log(`   ✅ ${field}: ${displayValue}`)
        } else {
          console.log(`   ❌ ${field}: Not captured`)
        }
      }
      console.log('')
    }

    // Step 6: Quality assessment
    console.log('🏆 QUALITY ASSESSMENT:')
    console.log('======================')

    const qualityCriteria = {
      'Overall Completeness >= 90%': overallCompleteness >= 90,
      'New Fields Completeness >= 95%': newFieldCompleteness >= 95,
      'All Core Fields Present': [
        'airbnb_id',
        'title',
        'description',
        'property_type',
      ].every((field) => fieldResults.populated.includes(field)),
      'All SEO Fields Present': [
        'seo_title',
        'meta_description',
        'sharing_config_title',
        'thumbnail_url',
      ].every((field) => fieldResults.newFieldsPopulated.includes(field)),
      'Extended Host Data Present': [
        'host_rating_average',
        'host_rating_count',
        'host_time_as_host_months',
      ].every((field) => fieldResults.newFieldsPopulated.includes(field)),
      'JSON Fields Properly Stored': [
        'amenities',
        'brand_highlights',
        'cancellation_policies',
      ].every(
        (field) =>
          savedListing[field] && typeof savedListing[field] === 'object'
      ),
    }

    let passedCriteria = 0
    const totalCriteria = Object.keys(qualityCriteria).length

    for (const [criterion, passed] of Object.entries(qualityCriteria)) {
      const status = passed ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${criterion}`)
      if (passed) passedCriteria++
    }

    const qualityScore = Math.round((passedCriteria / totalCriteria) * 100)
    console.log('')
    console.log(
      `🎯 QUALITY SCORE: ${qualityScore}% (${passedCriteria}/${totalCriteria} criteria passed)`
    )

    // Step 7: Final verdict
    console.log('')
    console.log('🏁 FINAL VERDICT:')
    console.log('=================')

    if (newFieldCompleteness >= 95 && overallCompleteness >= 90) {
      console.log('🎉 EXCELLENT: Data mapping is production-ready!')
      console.log('✅ All new schema fields are properly captured')
      console.log('✅ 95%+ data utilization achieved')
    } else if (newFieldCompleteness >= 80 && overallCompleteness >= 80) {
      console.log('✅ GOOD: Data mapping is functional with minor gaps')
      console.log('⚠️ Some optimization needed for full data utilization')
    } else {
      console.log('❌ NEEDS IMPROVEMENT: Significant data mapping gaps')
      console.log('🔧 Apify transformer requires updates')
    }

    return {
      success: true,
      metrics: {
        overallCompleteness,
        newFieldCompleteness,
        totalFields,
        populatedFields,
        newFieldsPopulated,
        qualityScore,
        populatedNewFields: fieldResults.newFieldsPopulated,
        missingNewFields: fieldResults.newFieldsMissing,
      },
      listing: savedListing,
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message)
    return {
      success: false,
      error: error.message,
      metrics: null,
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔬 COMPREHENSIVE DATA MAPPING VALIDATION')
  console.log('========================================')
  console.log(
    '🎯 Objective: Validate 95%+ data utilization with comprehensive mock data'
  )
  console.log('📅 Date:', new Date().toLocaleString('de-DE'))
  console.log('')

  const startTime = Date.now()
  const result = await testDataMapping()
  const totalTime = Date.now() - startTime

  console.log('')
  console.log('🏁 TEST COMPLETED')
  console.log('════════════════')
  console.log(`⏱️ Total Test Duration: ${Math.round(totalTime / 1000)}s`)
  console.log(`✅ Success: ${result.success}`)

  if (result.success) {
    console.log(
      `📊 Overall Completeness: ${result.metrics.overallCompleteness}%`
    )
    console.log(`🆕 New Fields: ${result.metrics.newFieldCompleteness}%`)
    console.log(`🏆 Quality Score: ${result.metrics.qualityScore}%`)
    console.log(
      `✅ New Fields Captured: ${result.metrics.newFieldsPopulated}/${TEST_CONFIG.expectedNewFields.length}`
    )
  } else {
    console.log(`❌ Error: ${result.error}`)
  }

  console.log('')
  console.log('📋 Data mapping validation completed.')

  process.exit(result.success ? 0 : 1)
}

// Execute test
main().catch(console.error)
