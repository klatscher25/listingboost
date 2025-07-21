/**
 * @file test_apify_integration.js
 * @description Comprehensive Apify API integration test with real data
 * @created 2025-07-21
 * @todo Verify complete Apify pipeline with real Airbnb data
 */

// Test configuration
const TEST_CONFIG = {
  // Test Airbnb listing URL (real listing for testing)
  testUrl: 'https://www.airbnb.de/rooms/52007734', // Berlin apartment
  userId: 'test_user_' + Date.now(),
  timeout: 300000, // 5 minutes timeout
  retries: 3,
}

console.log('🧪 APIFY INTEGRATION TEST SUITE')
console.log('====================================')
console.log(`Test URL: ${TEST_CONFIG.testUrl}`)
console.log(`User ID: ${TEST_CONFIG.userId}`)
console.log(`Timeout: ${TEST_CONFIG.timeout / 1000}s`)
console.log('')

// Import required modules
async function runApifyIntegrationTest() {
  try {
    console.log('📦 Loading modules...')

    // Dynamic imports for ES modules
    const { apifyService } = await import('./lib/services/apify/index.js')
    const { enhancedAnalysisService } = await import(
      './lib/services/enhanced-analysis.js'
    )
    const calculateListingScore = (await import('./lib/scoring/index.js'))
      .default

    console.log('✅ Modules loaded successfully')
    console.log('')

    // Test 1: Service Health Check
    console.log('🔍 TEST 1: Service Health Check')
    console.log('--------------------------------')

    try {
      const serviceStatus = await apifyService.getServiceStatus()
      console.log('Service Status:', JSON.stringify(serviceStatus, null, 2))

      if (!serviceStatus.healthy) {
        console.error('❌ Apify service is not healthy!')
        return false
      }

      console.log('✅ Apify service is healthy')
    } catch (error) {
      console.error('❌ Service health check failed:', error.message)
      return false
    }

    console.log('')

    // Test 2: URL Scraper Test
    console.log('🔍 TEST 2: URL Scraper with Real Data')
    console.log('-------------------------------------')

    let scrapingResult
    try {
      console.log(`Scraping URL: ${TEST_CONFIG.testUrl}`)
      console.log('⏳ This may take 2-3 minutes...')

      const startTime = Date.now()
      scrapingResult = await apifyService.analyzeListing(
        TEST_CONFIG.testUrl,
        TEST_CONFIG.userId,
        {
          includeReviews: true,
          includeAvailability: false,
          includeCompetitors: false,
          forceUpdate: true,
        }
      )
      const duration = Date.now() - startTime

      console.log(`✅ Scraping completed in ${duration}ms`)
      console.log('')

      // Validate scraped data structure
      console.log('🔍 Validating scraped data structure...')

      if (!scrapingResult.listing) {
        console.error('❌ Missing listing data')
        return false
      }

      console.log('📊 Scraped Data Summary:')
      console.log(`- Title: ${scrapingResult.listing.title || 'N/A'}`)
      console.log(`- Price: ${scrapingResult.listing.price?.amount || 'N/A'}`)
      console.log(
        `- Rating: ${scrapingResult.listing.rating?.guestSatisfaction || 'N/A'}`
      )
      console.log(
        `- Reviews: ${scrapingResult.listing.rating?.reviewsCount || 'N/A'}`
      )
      console.log(`- Host: ${scrapingResult.listing.host?.name || 'N/A'}`)
      console.log(
        `- Superhost: ${scrapingResult.listing.host?.isSuperHost || 'N/A'}`
      )
      console.log(`- Images: ${scrapingResult.listing.images?.length || 'N/A'}`)
      console.log(
        `- Amenities: ${scrapingResult.listing.amenities?.length || 'N/A'} categories`
      )
      console.log('')

      // Check required fields
      const requiredFields = [
        'title',
        'id',
        'url',
        'price',
        'rating',
        'host',
        'images',
        'amenities',
      ]

      let missingFields = []
      for (const field of requiredFields) {
        if (!scrapingResult.listing[field]) {
          missingFields.push(field)
        }
      }

      if (missingFields.length > 0) {
        console.warn('⚠️ Missing fields:', missingFields.join(', '))
      } else {
        console.log('✅ All required fields present')
      }
    } catch (error) {
      console.error('❌ URL scraping failed:', error.message)
      console.error('Error details:', error)
      return false
    }

    console.log('')

    // Test 3: Data Transformation Test
    console.log('🔍 TEST 3: Data Transformation')
    console.log('------------------------------')

    let transformedData
    try {
      const { ApifyDataTransformer } = await import(
        './lib/services/apify/transformer.js'
      )

      transformedData = ApifyDataTransformer.transformListingData(
        scrapingResult.listing,
        TEST_CONFIG.userId
      )

      console.log('✅ Data transformation successful')
      console.log('')
      console.log('📊 Transformed Data Summary:')
      console.log(`- Airbnb ID: ${transformedData.airbnb_id}`)
      console.log(`- Title: ${transformedData.title}`)
      console.log(`- Price per night: ${transformedData.price_per_night}`)
      console.log(`- Rating: ${transformedData.overall_rating}`)
      console.log(`- Reviews count: ${transformedData.reviews_count}`)
      console.log(`- Host: ${transformedData.host_name}`)
      console.log(`- Superhost: ${transformedData.host_is_superhost}`)
      console.log(`- WiFi: ${transformedData.wifi_available}`)
      console.log(`- Kitchen: ${transformedData.kitchen_available}`)
      console.log(`- Analysis status: ${transformedData.analysis_status}`)
    } catch (error) {
      console.error('❌ Data transformation failed:', error.message)
      console.error('Error details:', error)
      return false
    }

    console.log('')

    // Test 4: Database Storage Simulation
    console.log('🔍 TEST 4: Database Storage Validation')
    console.log('--------------------------------------')

    try {
      // Validate database schema compatibility
      const { Database } = await import('./types/database.js')

      console.log('🔍 Validating database schema compatibility...')

      // Check if all required database fields are present
      const dbRequiredFields = [
        'user_id',
        'airbnb_id',
        'airbnb_url',
        'analysis_status',
        'created_at',
        'updated_at',
      ]

      let missingDbFields = []
      for (const field of dbRequiredFields) {
        if (transformedData[field] === undefined) {
          missingDbFields.push(field)
        }
      }

      if (missingDbFields.length > 0) {
        console.error(
          '❌ Missing required database fields:',
          missingDbFields.join(', ')
        )
        return false
      }

      console.log('✅ Database schema validation passed')

      // Validate data types
      console.log('🔍 Validating data types...')

      const typeValidations = [
        {
          field: 'price_per_night',
          type: 'number',
          value: transformedData.price_per_night,
        },
        {
          field: 'overall_rating',
          type: 'number',
          value: transformedData.overall_rating,
        },
        {
          field: 'reviews_count',
          type: 'number',
          value: transformedData.reviews_count,
        },
        {
          field: 'host_is_superhost',
          type: 'boolean',
          value: transformedData.host_is_superhost,
        },
        {
          field: 'wifi_available',
          type: 'boolean',
          value: transformedData.wifi_available,
        },
      ]

      let typeErrors = []
      for (const validation of typeValidations) {
        if (
          validation.value !== null &&
          typeof validation.value !== validation.type
        ) {
          typeErrors.push(
            `${validation.field}: expected ${validation.type}, got ${typeof validation.value}`
          )
        }
      }

      if (typeErrors.length > 0) {
        console.error('❌ Type validation errors:', typeErrors)
        return false
      }

      console.log('✅ Data type validation passed')
    } catch (error) {
      console.error('❌ Database validation failed:', error.message)
      return false
    }

    console.log('')

    // Test 5: Scoring System Integration
    console.log('🔍 TEST 5: Scoring System Integration')
    console.log('-------------------------------------')

    let scoringResult
    try {
      console.log('🔍 Testing scoring system with scraped data...')

      // Create additional data for scoring
      const additionalData = {
        reviews: [],
        availability: [],
        competitors: [],
        sentimentAnalysis: null,
      }

      scoringResult = await calculateListingScore(
        transformedData,
        additionalData
      )

      console.log('✅ Scoring calculation successful')
      console.log('')
      console.log('📊 Scoring Results:')
      console.log(
        `- Total Score: ${scoringResult.totalScore}/1000 (${scoringResult.percentage}%)`
      )
      console.log(`- Performance Level: ${scoringResult.performanceLevel}`)
      console.log(`- Data Completeness: ${scoringResult.dataCompleteness}%`)
      console.log('')
      console.log('📊 Category Scores:')

      Object.entries(scoringResult.categoryScores).forEach(
        ([category, score]) => {
          console.log(
            `- ${category}: ${score.score}/${score.maxScore} (${score.percentage}%)`
          )
        }
      )

      console.log('')
      console.log('💡 Top Recommendations:')
      scoringResult.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    } catch (error) {
      console.error('❌ Scoring system failed:', error.message)
      console.error('Error details:', error)
      return false
    }

    console.log('')

    // Test 6: Enhanced Analysis Service
    console.log('🔍 TEST 6: Enhanced Analysis Service')
    console.log('------------------------------------')

    try {
      console.log('🔍 Testing enhanced analysis service (without AI)...')

      const enhancedResult = await enhancedAnalysisService.analyzeComprehensive(
        TEST_CONFIG.testUrl,
        TEST_CONFIG.userId,
        {
          includeReviews: false,
          includeAvailability: false,
          includeCompetitors: false,
          forceUpdate: false,
          enableAI: false, // Disable AI for this test to focus on Apify
          aiAnalysisType: 'quick',
        }
      )

      console.log('✅ Enhanced analysis completed')
      console.log('')
      console.log('📊 Enhanced Analysis Results:')
      console.log(
        `- Original Score: ${enhancedResult.enhancedScoring.originalScore}`
      )
      console.log(
        `- Enhanced Score: ${enhancedResult.enhancedScoring.aiEnhancedScore}`
      )
      console.log(
        `- Confidence Level: ${enhancedResult.enhancedScoring.confidenceLevel}%`
      )
      console.log(
        `- Recommendations: ${enhancedResult.combinedRecommendations.length}`
      )
      console.log(
        `- Processing Time: ${enhancedResult.processingInfo.totalTime}ms`
      )
      console.log(
        `- AI Analysis: ${enhancedResult.processingInfo.aiAnalysisEnabled ? 'Enabled' : 'Disabled'}`
      )
    } catch (error) {
      console.error('❌ Enhanced analysis failed:', error.message)
      console.error('Error details:', error)
      return false
    }

    console.log('')

    // Final Test Summary
    console.log('📋 TEST SUMMARY')
    console.log('================')
    console.log('✅ Service Health Check: PASSED')
    console.log('✅ URL Scraping: PASSED')
    console.log('✅ Data Transformation: PASSED')
    console.log('✅ Database Validation: PASSED')
    console.log('✅ Scoring Integration: PASSED')
    console.log('✅ Enhanced Analysis: PASSED')
    console.log('')
    console.log('🎉 ALL TESTS PASSED!')
    console.log('')
    console.log('📊 Test Statistics:')
    console.log(`- Listing ID: ${scrapingResult.listing.id}`)
    console.log(`- Data Fields: ${Object.keys(transformedData).length}`)
    console.log(`- Score: ${scoringResult.totalScore}/1000`)
    console.log(`- Recommendations: ${scoringResult.recommendations.length}`)

    return true
  } catch (error) {
    console.error('💥 TEST SUITE FAILED:', error.message)
    console.error('Full error:', error)
    return false
  }
}

// Run the test suite
runApifyIntegrationTest()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Test suite completed successfully!')
      process.exit(0)
    } else {
      console.log('\n❌ Test suite failed!')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('\n💥 Test suite crashed:', error)
    process.exit(1)
  })
