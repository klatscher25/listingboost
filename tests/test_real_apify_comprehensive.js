/**
 * @file test_real_apify_comprehensive.js
 * @description Comprehensive test of complete Apify integration with real listing data
 * @created 2025-07-21
 * @todo Validate 95%+ data utilization from Apify scrapers to database
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
  airbnbUrl: 'https://www.airbnb.de/rooms/29732182',
  airbnbId: '29732182',
  userId: '00000000-0000-0000-0000-000000000001', // Test user UUID for validation
  maxWaitTime: 300000, // 5 minutes maximum wait time
  expectedDataFields: {
    // Core listing fields
    core: [
      'airbnb_id',
      'title',
      'description',
      'property_type',
      'room_type',
      'person_capacity',
    ],

    // NEW: SEO & Marketing fields (previously unused)
    seo: [
      'seo_title',
      'meta_description',
      'sharing_config_title',
      'thumbnail_url',
    ],

    // NEW: App integration fields (previously unused)
    app: ['android_link', 'ios_link'],

    // NEW: Extended content fields (previously unused)
    content: ['html_description', 'sub_description', 'description_language'],

    // NEW: Airbnb internal ranking (previously unused)
    ranking: ['home_tier', 'is_available'],

    // Host information
    host: [
      'host_id',
      'host_name',
      'host_is_superhost',
      'host_response_rate',
      'host_response_time',
    ],

    // NEW: Extended host data (previously unused)
    hostExtended: [
      'host_rating_average',
      'host_rating_count',
      'host_time_as_host_months',
    ],

    // NEW: Co-hosts system (previously unused)
    coHosts: ['co_hosts'],

    // Location data
    location: ['coordinates_latitude', 'coordinates_longitude', 'location'],

    // NEW: Extended location data (previously unused)
    locationExtended: ['location_subtitle', 'breadcrumbs'],

    // Ratings
    ratings: [
      'overall_rating',
      'rating_accuracy',
      'rating_checkin',
      'rating_cleanliness',
      'rating_communication',
      'rating_location',
      'rating_value',
      'reviews_count',
    ],

    // Pricing
    pricing: ['price_per_night', 'currency'],

    // Amenities
    amenities: [
      'wifi_available',
      'kitchen_available',
      'heating_available',
      'air_conditioning_available',
    ],

    // NEW: Brand highlights (previously unused)
    brand: ['brand_highlights'],

    // NEW: Cancellation policies (previously unused)
    policies: ['cancellation_policies'],

    // Images
    images: ['images_count'],

    // Booking
    booking: ['minimum_stay', 'instant_book_available'],

    // Status
    status: ['analysis_status', 'created_at', 'updated_at'],
  },
}

/**
 * Test API endpoint with real Airbnb listing
 */
async function testApifyIntegration() {
  console.log('🚀 STARTING COMPREHENSIVE APIFY INTEGRATION TEST')
  console.log('📋 Test Configuration:')
  console.log(`   • URL: ${TEST_CONFIG.airbnbUrl}`)
  console.log(`   • Airbnb ID: ${TEST_CONFIG.airbnbId}`)
  console.log(`   • User ID: ${TEST_CONFIG.userId}`)
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
      // PGRST116 = no rows to delete
      console.error(
        '⚠️  Warning: Could not clean previous data:',
        deleteError.message
      )
    } else {
      console.log('✅ Previous test data cleaned')
    }

    // Step 2: Call the analyze API endpoint
    console.log('📡 Step 2: Calling analyze API endpoint...')
    const startTime = Date.now()

    const analyzeResponse = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        airbnb_url: TEST_CONFIG.airbnbUrl,
        analysis_type: 'comprehensive',
        force_update: true,
        enable_ai: false, // Disable AI for pure Apify testing
        ai_analysis_type: 'full',
      }),
    })

    const responseTime = Date.now() - startTime
    console.log(`⏱️  API Response Time: ${responseTime}ms`)

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text()
      throw new Error(`API Error ${analyzeResponse.status}: ${errorText}`)
    }

    const apiResult = await analyzeResponse.json()
    console.log('✅ API call successful')
    console.log(
      `📊 Scoring Result: ${apiResult.scoring?.totalScore}/1000 (${apiResult.scoring?.performanceLevel})`
    )

    // Step 3: Verify database storage
    console.log('🗄️  Step 3: Verifying database storage...')

    const { data: savedListing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', TEST_CONFIG.userId)
      .eq('airbnb_id', TEST_CONFIG.airbnbId)
      .single()

    if (fetchError) {
      throw new Error(`Database fetch error: ${fetchError.message}`)
    }

    if (!savedListing) {
      throw new Error('No listing found in database after API call')
    }

    console.log('✅ Listing saved to database')
    console.log(`📋 Database ID: ${savedListing.id}`)

    // Step 4: Comprehensive data field validation
    console.log('🔍 Step 4: Comprehensive data field validation...')

    const validationResults = {}
    let totalFields = 0
    let populatedFields = 0
    let newFieldsFound = 0

    // Validate each field category
    for (const [category, fields] of Object.entries(
      TEST_CONFIG.expectedDataFields
    )) {
      validationResults[category] = {
        total: fields.length,
        populated: 0,
        missing: [],
        values: {},
      }

      for (const field of fields) {
        totalFields++
        const value = savedListing[field]

        if (value !== null && value !== undefined && value !== '') {
          populatedFields++
          validationResults[category].populated++
          validationResults[category].values[field] = value

          // Check if this is a new field from schema updates
          if (
            [
              'seo',
              'app',
              'content',
              'ranking',
              'hostExtended',
              'coHosts',
              'locationExtended',
              'brand',
              'policies',
            ].includes(category)
          ) {
            newFieldsFound++
          }
        } else {
          validationResults[category].missing.push(field)
        }
      }
    }

    // Calculate data completeness
    const dataCompleteness = Math.round((populatedFields / totalFields) * 100)
    const newFieldUtilization = Math.round((newFieldsFound / 15) * 100) // 15 new fields total

    console.log('')
    console.log('📊 VALIDATION RESULTS:')
    console.log('═══════════════════════')
    console.log(
      `📈 Overall Data Completeness: ${dataCompleteness}% (${populatedFields}/${totalFields} fields)`
    )
    console.log(
      `🆕 New Fields Utilization: ${newFieldUtilization}% (${newFieldsFound}/15 new fields)`
    )
    console.log('')

    // Detailed category results
    for (const [category, result] of Object.entries(validationResults)) {
      const percentage = Math.round((result.populated / result.total) * 100)
      const status = percentage >= 80 ? '✅' : percentage >= 50 ? '⚠️' : '❌'

      console.log(
        `${status} ${category.toUpperCase()}: ${percentage}% (${result.populated}/${result.total})`
      )

      if (result.missing.length > 0 && result.missing.length <= 3) {
        console.log(`   Missing: ${result.missing.join(', ')}`)
      }
    }

    console.log('')

    // Step 5: NEW FIELDS DEEP DIVE
    console.log('🔬 Step 5: New Fields Deep Dive Analysis...')
    console.log('════════════════════════════════════════')

    const newFieldsAnalysis = {
      'SEO & Marketing': {
        seo_title: savedListing.seo_title,
        meta_description: savedListing.meta_description,
        sharing_config_title: savedListing.sharing_config_title,
        thumbnail_url: savedListing.thumbnail_url,
      },
      'App Integration': {
        android_link: savedListing.android_link,
        ios_link: savedListing.ios_link,
      },
      'Extended Content': {
        html_description: savedListing.html_description
          ? 'Present (JSON)'
          : null,
        sub_description: savedListing.sub_description ? 'Present (JSON)' : null,
        description_language: savedListing.description_language,
      },
      'Airbnb Ranking': {
        home_tier: savedListing.home_tier,
        is_available: savedListing.is_available,
      },
      'Extended Host Data': {
        host_rating_average: savedListing.host_rating_average,
        host_rating_count: savedListing.host_rating_count,
        host_time_as_host_months: savedListing.host_time_as_host_months,
      },
      'Co-Hosts System': {
        co_hosts: savedListing.co_hosts ? 'Present (JSON)' : null,
      },
      'Extended Location': {
        location_subtitle: savedListing.location_subtitle,
        breadcrumbs: savedListing.breadcrumbs ? 'Present (JSON)' : null,
      },
      'Brand Features': {
        brand_highlights: savedListing.brand_highlights
          ? 'Present (JSON)'
          : null,
      },
      Policies: {
        cancellation_policies: savedListing.cancellation_policies
          ? 'Present (JSON)'
          : null,
      },
    }

    for (const [category, fields] of Object.entries(newFieldsAnalysis)) {
      console.log(`\n📦 ${category}:`)
      for (const [field, value] of Object.entries(fields)) {
        if (value !== null && value !== undefined) {
          const displayValue =
            typeof value === 'string' && value.length > 50
              ? value.substring(0, 50) + '...'
              : value
          console.log(`   ✅ ${field}: ${displayValue}`)
        } else {
          console.log(`   ❌ ${field}: Not captured`)
        }
      }
    }

    // Step 6: Performance & Quality Assessment
    console.log('')
    console.log('📈 Step 6: Performance & Quality Assessment...')
    console.log('═══════════════════════════════════════════')
    console.log(`⏱️  Total Processing Time: ${responseTime}ms`)
    console.log(
      `📊 Scoring System: ${apiResult.scoring?.totalScore}/1000 points`
    )
    console.log(`🎯 Performance Level: ${apiResult.scoring?.performanceLevel}`)
    console.log(
      `📅 Data Freshness: ${new Date(savedListing.updated_at).toLocaleString('de-DE')}`
    )
    console.log(`🔄 Analysis Status: ${savedListing.analysis_status}`)

    // Step 7: Success Criteria Evaluation
    console.log('')
    console.log('🎯 Step 7: Success Criteria Evaluation...')
    console.log('═══════════════════════════════════════')

    const successCriteria = {
      'Data Completeness >= 90%': dataCompleteness >= 90,
      'New Fields Utilization >= 80%': newFieldUtilization >= 80,
      'API Response Time < 60s': responseTime < 60000,
      'Scoring System Functional': apiResult.scoring?.totalScore > 0,
      'Database Storage Successful': savedListing.id !== null,
      'Analysis Status Complete': savedListing.analysis_status === 'completed',
    }

    let passedCriteria = 0
    const totalCriteria = Object.keys(successCriteria).length

    for (const [criterion, passed] of Object.entries(successCriteria)) {
      const status = passed ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${criterion}`)
      if (passed) passedCriteria++
    }

    const overallScore = Math.round((passedCriteria / totalCriteria) * 100)
    console.log('')
    console.log(
      `🏆 OVERALL TEST SCORE: ${overallScore}% (${passedCriteria}/${totalCriteria} criteria passed)`
    )

    // Step 8: Recommendations
    console.log('')
    console.log('💡 Step 8: Recommendations...')
    console.log('═══════════════════════════')

    if (dataCompleteness < 95) {
      console.log(
        '📈 Improve data completeness by checking Apify scraper field mappings'
      )
    }

    if (newFieldUtilization < 90) {
      console.log(
        '🆕 Update Apify transformer to capture more new fields from schema'
      )
    }

    if (responseTime > 30000) {
      console.log('⚡ Consider caching strategies for better response times')
    }

    if (overallScore >= 85) {
      console.log('🎉 EXCELLENT: Apify integration is production-ready!')
    } else if (overallScore >= 70) {
      console.log(
        '✅ GOOD: Apify integration is functional with minor improvements needed'
      )
    } else {
      console.log(
        '⚠️  NEEDS WORK: Significant improvements required before production'
      )
    }

    return {
      success: true,
      metrics: {
        dataCompleteness,
        newFieldUtilization,
        responseTime,
        overallScore,
        totalFields,
        populatedFields,
        newFieldsFound,
      },
      listing: savedListing,
      scoring: apiResult.scoring,
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
  console.log('🔬 COMPREHENSIVE APIFY INTEGRATION TEST')
  console.log('=====================================')
  console.log(
    '🎯 Objective: Validate 95%+ data utilization from Apify to database'
  )
  console.log('📅 Date:', new Date().toLocaleString('de-DE'))
  console.log('🌐 Target Listing: https://www.airbnb.de/rooms/29732182')
  console.log('')

  const startTime = Date.now()
  const result = await testApifyIntegration()
  const totalTime = Date.now() - startTime

  console.log('')
  console.log('🏁 TEST COMPLETED')
  console.log('════════════════')
  console.log(`⏱️  Total Test Duration: ${Math.round(totalTime / 1000)}s`)
  console.log(`✅ Success: ${result.success}`)

  if (result.success) {
    console.log(`📊 Data Completeness: ${result.metrics.dataCompleteness}%`)
    console.log(`🆕 New Fields: ${result.metrics.newFieldUtilization}%`)
    console.log(`🏆 Overall Score: ${result.metrics.overallScore}%`)
  } else {
    console.log(`❌ Error: ${result.error}`)
  }

  console.log('')
  console.log('📋 Test completed. Results logged above.')

  process.exit(result.success ? 0 : 1)
}

// Execute test
main().catch(console.error)
