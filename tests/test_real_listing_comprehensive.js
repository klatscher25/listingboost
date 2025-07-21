/**
 * @file test_real_listing_comprehensive.js
 * @description Comprehensive test of all Apify endpoints with real listing
 * @created 2025-07-21
 */

const http = require('http')
const https = require('https')

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUrl: 'https://www.airbnb.de/rooms/29732182', // User specified listing
  timeout: 300000, // 5 minutes
}

console.log('🧪 COMPREHENSIVE APIFY ENDPOINTS TEST')
console.log('=====================================')
console.log(`Test Listing: ${TEST_CONFIG.testUrl}`)
console.log(`Base URL: ${TEST_CONFIG.baseUrl}`)
console.log('')

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const requestModule = urlObj.protocol === 'https:' ? https : http

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: options.timeout || TEST_CONFIG.timeout,
    }

    const req = requestModule.request(requestOptions, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            ok: res.statusCode >= 200 && res.statusCode < 300,
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            ok: false,
            error: 'JSON parse error',
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`))
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }

    req.end()
  })
}

async function testHealthEndpoint() {
  console.log('🔍 TEST 1: Health Endpoint')
  console.log('---------------------------')

  try {
    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/analyze/health`
    )

    console.log(`Status: ${response.status}`)
    console.log(
      `Health Status: ${response.data.success ? '✅ Healthy' : '❌ Unhealthy'}`
    )

    if (response.data.data) {
      console.log(
        `Overall Health: ${response.data.data.overallHealthy ? '✅' : '❌'}`
      )
      console.log(
        `Apify Health: ${response.data.data.apifyHealthy ? '✅' : '❌'}`
      )
      console.log(
        `Gemini Health: ${response.data.data.geminiHealthy ? '✅' : '❌'}`
      )
    }

    return response.ok
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
    return false
  }
}

async function testStatusEndpoint() {
  console.log('')
  console.log('🔍 TEST 2: Status Endpoint')
  console.log('---------------------------')

  try {
    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/analyze/status`
    )

    console.log(`Status: ${response.status}`)
    console.log(
      `Service Health: ${response.data.data?.healthy ? '✅ Healthy' : '❌ Degraded'}`
    )

    if (response.data.data?.actors) {
      console.log('Actor Status:')
      response.data.data.actors.forEach((actor) => {
        console.log(
          `  - ${actor.actorId}: ${actor.available ? '✅ Available' : '❌ Not Available'}`
        )
      })

      if (response.data.data.summary) {
        console.log(
          `Summary: ${response.data.data.summary.available}/${response.data.data.summary.total} actors available`
        )
      }
    }

    return response.ok
  } catch (error) {
    console.error('❌ Status check failed:', error.message)
    return false
  }
}

async function testQuickAnalysis() {
  console.log('')
  console.log('🔍 TEST 3: Quick Analysis Endpoint')
  console.log('------------------------------------')
  console.log('⏳ Testing quick analysis (lightweight)...')

  try {
    const startTime = Date.now()

    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/analyze`, {
      method: 'POST',
      body: {
        airbnb_url: TEST_CONFIG.testUrl,
        analysis_type: 'quick',
        force_update: true,
        enable_ai: false,
      },
    })

    const duration = Date.now() - startTime

    console.log(`Status: ${response.status}`)
    console.log(`Duration: ${Math.round(duration / 1000)}s`)

    if (response.ok && response.data.success) {
      console.log('✅ Quick analysis successful')

      const data = response.data.data
      console.log('')
      console.log('📊 Quick Analysis Results:')
      console.log(`- Listing ID: ${data.listing?.airbnb_id || 'N/A'}`)
      console.log(`- Title: ${data.listing?.title || 'N/A'}`)
      console.log(`- Price: ${data.listing?.price_per_night || 'N/A'}€`)
      console.log(`- Rating: ${data.listing?.overall_rating || 'N/A'}`)
      console.log(`- Reviews: ${data.listing?.reviews_count || 'N/A'}`)

      if (data.scoring) {
        console.log(`- Score: ${data.scoring.totalScore}/1000`)
        console.log(`- Performance: ${data.scoring.performanceLevel}`)
      }

      return { success: true, data: data }
    } else {
      console.log('❌ Quick analysis failed')
      console.log('Error:', response.data.error || 'Unknown error')
      return { success: false, error: response.data.error }
    }
  } catch (error) {
    console.error('❌ Quick analysis crashed:', error.message)
    return { success: false, error: error.message }
  }
}

async function testComprehensiveAnalysis() {
  console.log('')
  console.log('🔍 TEST 4: Comprehensive Analysis Endpoint')
  console.log('-------------------------------------------')
  console.log('⚠️ This may take 5-10 minutes and uses API credits!')
  console.log('⏳ Testing comprehensive analysis...')

  try {
    const startTime = Date.now()

    // Progress tracker
    let progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      console.log(`⏳ Still processing... ${Math.floor(elapsed)}s elapsed`)
    }, 30000) // Log every 30 seconds

    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/analyze`, {
      method: 'POST',
      timeout: TEST_CONFIG.timeout,
      body: {
        airbnb_url: TEST_CONFIG.testUrl,
        analysis_type: 'comprehensive',
        force_update: true,
        enable_ai: true,
        ai_analysis_type: 'full',
      },
    })

    clearInterval(progressInterval)
    const duration = Date.now() - startTime

    console.log('')
    console.log(`Status: ${response.status}`)
    console.log(
      `Duration: ${Math.round(duration / 1000)}s (${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s)`
    )

    if (response.ok && response.data.success) {
      console.log('✅ Comprehensive analysis successful')

      const data = response.data.data
      console.log('')
      console.log('📊 Comprehensive Analysis Results:')
      console.log(`- Listing ID: ${data.listing?.airbnb_id || 'N/A'}`)
      console.log(`- Title: ${data.listing?.title || 'N/A'}`)
      console.log(`- Location: ${data.listing?.location || 'N/A'}`)
      console.log(`- Price: ${data.listing?.price_per_night || 'N/A'}€`)
      console.log(`- Rating: ${data.listing?.overall_rating || 'N/A'}`)
      console.log(`- Reviews: ${data.listing?.reviews_count || 'N/A'}`)
      console.log(`- Host: ${data.listing?.host_name || 'N/A'}`)
      console.log(
        `- Superhost: ${data.listing?.host_is_superhost ? '✅' : '❌'}`
      )

      if (data.scoring) {
        console.log('')
        console.log('🎯 Scoring Results:')
        console.log(`- Total Score: ${data.scoring.totalScore}/1000`)
        console.log(`- Percentage: ${data.scoring.percentage}%`)
        console.log(`- Performance Level: ${data.scoring.performanceLevel}`)
        console.log(`- Data Completeness: ${data.scoring.dataCompleteness}%`)
      }

      if (data.scrapingMetadata) {
        console.log('')
        console.log('📈 Scraping Metadata:')
        console.log(`- Data Source: ${data.scrapingMetadata.dataSource}`)
        console.log(
          `- Processing Time: ${data.scrapingMetadata.processingTime?.total || 'N/A'}ms`
        )
        console.log(`- Data Completeness:`)
        const completeness = data.scrapingMetadata.dataCompleteness || {}
        console.log(`  - Listing: ${completeness.listing ? '✅' : '❌'}`)
        console.log(`  - Reviews: ${completeness.reviews ? '✅' : '❌'}`)
        console.log(
          `  - Availability: ${completeness.availability ? '✅' : '❌'}`
        )
        console.log(
          `  - Competitors: ${completeness.competitors ? '✅' : '❌'}`
        )
      }

      return { success: true, data: data }
    } else {
      console.log('❌ Comprehensive analysis failed')
      console.log('Error:', response.data.error || 'Unknown error')
      return { success: false, error: response.data.error }
    }
  } catch (error) {
    console.error('❌ Comprehensive analysis crashed:', error.message)
    return { success: false, error: error.message }
  }
}

async function testMarketAnalysis() {
  console.log('')
  console.log('🔍 TEST 5: Market Analysis Endpoint')
  console.log('------------------------------------')
  console.log('⏳ Testing market analysis for Berlin...')

  try {
    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/market/analyze`,
      {
        method: 'POST',
        body: {
          location: 'Berlin, Deutschland',
          max_listings: 20,
          price_range: { min: 50, max: 200 },
        },
      }
    )

    console.log(`Status: ${response.status}`)

    if (response.ok && response.data.success) {
      console.log('✅ Market analysis successful')

      const data = response.data.data
      console.log('')
      console.log('📊 Market Analysis Results:')
      console.log(`- Location: ${data.location || 'N/A'}`)
      console.log(`- Competitors Found: ${data.competitors?.length || 0}`)

      if (data.marketStats) {
        console.log('Market Statistics:')
        console.log(
          `- Average Price: ${data.marketStats.averagePrice || 'N/A'}€`
        )
        console.log(
          `- Average Rating: ${data.marketStats.averageRating || 'N/A'}`
        )
        console.log(
          `- Total Listings: ${data.marketStats.totalListings || 'N/A'}`
        )
      }

      return { success: true, data: data }
    } else {
      console.log('❌ Market analysis failed')
      console.log('Error:', response.data.error || 'Unknown error')
      return { success: false, error: response.data.error }
    }
  } catch (error) {
    console.error('❌ Market analysis crashed:', error.message)
    return { success: false, error: error.message }
  }
}

async function queryDatabaseResults() {
  console.log('')
  console.log('🔍 TEST 6: Database Query - Saved Data')
  console.log('---------------------------------------')
  console.log('⏳ Querying database for saved listing data...')

  try {
    // Extract Airbnb ID from URL
    const airbnbIdMatch = TEST_CONFIG.testUrl.match(/\/rooms\/(\d+)/)
    const airbnbId = airbnbIdMatch ? airbnbIdMatch[1] : null

    if (!airbnbId) {
      console.log('❌ Could not extract Airbnb ID from URL')
      return { success: false, error: 'Invalid URL' }
    }

    console.log(`Searching for Airbnb ID: ${airbnbId}`)

    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/listings/${airbnbId}`
    )

    console.log(`Status: ${response.status}`)

    if (response.ok && response.data.success) {
      console.log('✅ Database query successful')

      const listing = response.data.data
      console.log('')
      console.log('💾 SAVED DATABASE DATA:')
      console.log('========================')
      console.log(`Database ID: ${listing.id || 'N/A'}`)
      console.log(`Airbnb ID: ${listing.airbnb_id || 'N/A'}`)
      console.log(`User ID: ${listing.user_id || 'N/A'}`)
      console.log(`Title: ${listing.title || 'N/A'}`)
      console.log(
        `Description: ${listing.description?.substring(0, 100) || 'N/A'}...`
      )
      console.log(`Location: ${listing.location || 'N/A'}`)
      console.log(`Price per Night: ${listing.price_per_night || 'N/A'}€`)
      console.log(`Currency: ${listing.currency || 'N/A'}`)
      console.log(`Overall Rating: ${listing.overall_rating || 'N/A'}`)
      console.log(`Reviews Count: ${listing.reviews_count || 'N/A'}`)
      console.log(`Host Name: ${listing.host_name || 'N/A'}`)
      console.log(
        `Host is Superhost: ${listing.host_is_superhost ? '✅' : '❌'}`
      )
      console.log(`Host Response Rate: ${listing.host_response_rate || 'N/A'}`)
      console.log(`Host Response Time: ${listing.host_response_time || 'N/A'}`)
      console.log(`Property Type: ${listing.property_type || 'N/A'}`)
      console.log(`Room Type: ${listing.room_type || 'N/A'}`)
      console.log(`Person Capacity: ${listing.person_capacity || 'N/A'}`)
      console.log(`Images Count: ${listing.images_count || 'N/A'}`)
      console.log(`Analysis Status: ${listing.analysis_status || 'N/A'}`)
      console.log(`Data Source: ${listing.data_source || 'N/A'}`)
      console.log(`Created At: ${listing.created_at || 'N/A'}`)
      console.log(`Updated At: ${listing.updated_at || 'N/A'}`)

      console.log('')
      console.log('🏠 AMENITIES & FEATURES:')
      console.log('========================')
      console.log(`WiFi: ${listing.wifi_available ? '✅' : '❌'}`)
      console.log(`Kitchen: ${listing.kitchen_available ? '✅' : '❌'}`)
      console.log(`Heating: ${listing.heating_available ? '✅' : '❌'}`)
      console.log(
        `Air Conditioning: ${listing.air_conditioning_available ? '✅' : '❌'}`
      )
      console.log(`Washer: ${listing.washer_available ? '✅' : '❌'}`)
      console.log(`Dishwasher: ${listing.dishwasher_available ? '✅' : '❌'}`)
      console.log(`TV: ${listing.tv_available ? '✅' : '❌'}`)
      console.log(`Iron: ${listing.iron_available ? '✅' : '❌'}`)
      console.log(
        `Workspace: ${listing.dedicated_workspace_available ? '✅' : '❌'}`
      )
      console.log(`Smoke Alarm: ${listing.smoke_alarm_available ? '✅' : '❌'}`)
      console.log(
        `CO Alarm: ${listing.carbon_monoxide_alarm_available ? '✅' : '❌'}`
      )
      console.log(
        `First Aid Kit: ${listing.first_aid_kit_available ? '✅' : '❌'}`
      )
      console.log(`Minimum Stay: ${listing.minimum_stay || 'N/A'} nights`)

      console.log('')
      console.log('⭐ RATINGS BREAKDOWN:')
      console.log('====================')
      console.log(`Accuracy: ${listing.rating_accuracy || 'N/A'}`)
      console.log(`Check-in: ${listing.rating_checkin || 'N/A'}`)
      console.log(`Cleanliness: ${listing.rating_cleanliness || 'N/A'}`)
      console.log(`Communication: ${listing.rating_communication || 'N/A'}`)
      console.log(`Location: ${listing.rating_location || 'N/A'}`)
      console.log(`Value: ${listing.rating_value || 'N/A'}`)

      if (listing.highlights) {
        console.log('')
        console.log('🎯 HIGHLIGHTS:')
        console.log('==============')
        if (Array.isArray(listing.highlights)) {
          listing.highlights.forEach((highlight, index) => {
            console.log(`${index + 1}. ${highlight}`)
          })
        } else {
          console.log(listing.highlights)
        }
      }

      return { success: true, data: listing }
    } else {
      console.log('❌ Database query failed')
      console.log('Error:', response.data.error || 'Data not found')
      return { success: false, error: response.data.error }
    }
  } catch (error) {
    console.error('❌ Database query crashed:', error.message)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Starting comprehensive Apify endpoints test...')
  console.log('')

  const results = {
    health: false,
    status: false,
    quickAnalysis: null,
    comprehensiveAnalysis: null,
    marketAnalysis: null,
    databaseQuery: null,
    savedData: null,
  }

  // Test 1: Health Check
  results.health = await testHealthEndpoint()

  // Test 2: Status Check
  results.status = await testStatusEndpoint()

  // Test 3: Quick Analysis
  results.quickAnalysis = await testQuickAnalysis()

  // Test 4: Comprehensive Analysis
  results.comprehensiveAnalysis = await testComprehensiveAnalysis()

  // Test 5: Market Analysis
  results.marketAnalysis = await testMarketAnalysis()

  // Test 6: Database Query
  results.databaseQuery = await queryDatabaseResults()
  if (results.databaseQuery.success) {
    results.savedData = results.databaseQuery.data
  }

  // Final Report
  console.log('')
  console.log('📋 COMPREHENSIVE TEST REPORT')
  console.log('=============================')

  const tests = [
    { name: 'Health Check', result: results.health },
    { name: 'Status Check', result: results.status },
    { name: 'Quick Analysis', result: results.quickAnalysis?.success },
    {
      name: 'Comprehensive Analysis',
      result: results.comprehensiveAnalysis?.success,
    },
    { name: 'Market Analysis', result: results.marketAnalysis?.success },
    { name: 'Database Query', result: results.databaseQuery?.success },
  ]

  const passed = tests.filter((t) => t.result).length
  const total = tests.length

  console.log(`Overall: ${passed}/${total} tests passed`)
  console.log('')

  tests.forEach((test) => {
    console.log(`${test.result ? '✅' : '❌'} ${test.name}`)
  })

  console.log('')
  console.log('🎯 DATA STORAGE SUMMARY:')
  console.log('========================')

  if (results.savedData) {
    console.log(`✅ Data successfully saved to database`)
    console.log(`Database ID: ${results.savedData.id}`)
    console.log(`Airbnb ID: ${results.savedData.airbnb_id}`)
    console.log(`Title: ${results.savedData.title}`)
    console.log(`Last Updated: ${results.savedData.updated_at}`)
  } else {
    console.log(`❌ No data found in database`)
  }

  // Save detailed results
  const detailedResults = {
    testConfig: TEST_CONFIG,
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      totalTests: total,
      passedTests: passed,
      failedTests: total - passed,
      dataStored: !!results.savedData,
    },
  }

  require('fs').writeFileSync(
    '/Users/leonardprobst/Documents/ListingBoost/comprehensive_apify_test_results.json',
    JSON.stringify(detailedResults, null, 2)
  )

  console.log('')
  console.log(
    '📄 Detailed results saved to: comprehensive_apify_test_results.json'
  )

  process.exit(passed === total ? 0 : 1)
}

main().catch((error) => {
  console.error('💥 Test execution failed:', error)
  process.exit(1)
})
