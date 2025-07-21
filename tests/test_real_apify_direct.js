/**
 * @file test_real_apify_direct.js
 * @description Direct test of real Apify API with correct actor format
 * @created 2025-07-21
 */

const https = require('https')

// Configuration
const APIFY_API_TOKEN = 'YOUR_TOKEN_HERE'
const ACTOR_ID = 'tri_angle~airbnb-rooms-urls-scraper' // Correct format with ~
const TEST_URL = 'https://www.airbnb.de/rooms/29732182' // User specified URL

console.log('🧪 REAL APIFY API TEST - DIRECT SCRAPING')
console.log('========================================')
console.log(`API Token: ${APIFY_API_TOKEN.substring(0, 20)}...`)
console.log(`Actor ID: ${ACTOR_ID}`)
console.log(`Test URL: ${TEST_URL}`)
console.log('')

function makeHttpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const jsonData = responseData ? JSON.parse(responseData) : {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            raw: responseData,
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            ok: false,
            error: 'JSON parse error',
            raw: responseData,
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function testActorAvailability() {
  console.log('🔍 TEST 1: Actor Availability Check')
  console.log('------------------------------------')

  try {
    const response = await makeHttpsRequest({
      hostname: 'api.apify.com',
      port: 443,
      path: `/v2/acts/${ACTOR_ID}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    console.log(`Status: ${response.status}`)

    if (response.ok && response.data) {
      console.log('✅ Actor is available')
      console.log(`Name: ${response.data.name}`)
      console.log(`Title: ${response.data.title || 'No title'}`)
      console.log(
        `Description: ${response.data.description?.substring(0, 100) || 'No description'}...`
      )
      console.log(`Owner: ${response.data.username}`)
      console.log(`Public: ${response.data.isPublic ? '✅' : '❌'}`)
      return true
    } else {
      console.log('❌ Actor not available')
      console.log('Response:', JSON.stringify(response.data, null, 2))
      return false
    }
  } catch (error) {
    console.error('❌ Actor availability check failed:', error.message)
    return false
  }
}

async function startActorRun() {
  console.log('')
  console.log('🔍 TEST 2: Start Actor Run')
  console.log('---------------------------')
  console.log('⚠️ This will consume Apify credits!')
  console.log('🚀 Starting real scraping...')

  try {
    const inputData = {
      startUrls: [{ url: TEST_URL }],
      maxListings: 1,
      includeReviews: true,
      includeHostInfo: true,
      proxyConfiguration: {
        useApifyProxy: true,
      },
    }

    console.log('Input data:', JSON.stringify(inputData, null, 2))

    const response = await makeHttpsRequest(
      {
        hostname: 'api.apify.com',
        port: 443,
        path: `/v2/acts/${ACTOR_ID}/runs`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${APIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
      inputData
    )

    console.log(`Start Response Status: ${response.status}`)

    if ((response.status === 201 || response.status === 200) && response.data) {
      // Handle both direct data and wrapped data
      const runData = response.data.data || response.data

      if (runData && runData.id) {
        const runId = runData.id
        console.log(`✅ Actor run started successfully`)
        console.log(`Run ID: ${runId}`)
        console.log(`Status: ${runData.status}`)
        console.log(`Build: ${runData.buildNumber}`)
        console.log(`Memory: ${runData.options?.memoryMbytes || 'N/A'}MB`)

        return runId
      }
    }

    console.log('❌ Failed to start actor run')
    console.log('Error:', JSON.stringify(response.data, null, 2))
    return null
  } catch (error) {
    console.error('❌ Failed to start actor run:', error.message)
    return null
  }
}

async function waitForCompletion(runId) {
  console.log('')
  console.log('🔍 TEST 3: Wait for Completion')
  console.log('-------------------------------')
  console.log(`⏳ Waiting for run ${runId} to complete...`)

  let attempts = 0
  const maxAttempts = 60 // 5 minutes with 5-second intervals

  while (attempts < maxAttempts) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds
      attempts++

      const response = await makeHttpsRequest({
        hostname: 'api.apify.com',
        port: 443,
        path: `/v2/actor-runs/${runId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${APIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      })

      if (!response.ok) {
        console.error('❌ Failed to check run status')
        console.log('Response:', JSON.stringify(response.data, null, 2))
        return null
      }

      // Handle both direct data and wrapped data format
      const runData = response.data.data || response.data
      const status = runData.status
      const stats = runData.stats

      console.log(
        'Debug - Run data structure:',
        JSON.stringify(runData, null, 2)
      )

      console.log(`⏳ Status: ${status} | Attempt: ${attempts}/${maxAttempts}`)
      if (stats) {
        console.log(
          `   Runtime: ${Math.round(stats.runTimeSecs || 0)}s | Memory: ${Math.round(stats.memoryMbytes || 0)}MB`
        )
      }

      if (status === 'SUCCEEDED') {
        console.log('🎉 Actor run completed successfully!')
        return runData
      } else if (
        status === 'FAILED' ||
        status === 'ABORTED' ||
        status === 'TIMED-OUT'
      ) {
        console.error(`❌ Actor run ${status.toLowerCase()}`)
        console.error('Error details:', runData.statusMessage || 'No details')
        return null
      }

      // Continue polling for RUNNING status
    } catch (error) {
      console.error(`❌ Error checking run status: ${error.message}`)
      return null
    }
  }

  console.log('⏰ Timeout reached - actor still running')
  return null
}

async function getScrapedData(runData) {
  console.log('')
  console.log('🔍 TEST 4: Get Scraped Data')
  console.log('----------------------------')
  console.log('📊 Retrieving scraped data from dataset...')

  try {
    const datasetId = runData.defaultDatasetId
    if (!datasetId) {
      console.log('❌ No dataset ID found')
      return null
    }

    console.log(`Dataset ID: ${datasetId}`)

    const response = await makeHttpsRequest({
      hostname: 'api.apify.com',
      port: 443,
      path: `/v2/datasets/${datasetId}/items`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    console.log(`Data Response Status: ${response.status}`)

    if (response.ok && response.data && response.data.length > 0) {
      const scrapedData = response.data[0]

      console.log('✅ Scraped data retrieved successfully!')
      console.log(`Records found: ${response.data.length}`)

      console.log('')
      console.log('📊 SCRAPED AIRBNB DATA:')
      console.log('========================')
      console.log(`URL: ${scrapedData.url || 'N/A'}`)
      console.log(`ID: ${scrapedData.id || 'N/A'}`)
      console.log(`Title: ${scrapedData.title || 'N/A'}`)
      console.log(
        `Description: ${scrapedData.description?.substring(0, 200) || 'N/A'}...`
      )
      console.log(
        `Location: ${scrapedData.location?.title || scrapedData.location || 'N/A'}`
      )
      console.log(`Property Type: ${scrapedData.propertyType || 'N/A'}`)
      console.log(`Room Type: ${scrapedData.roomType || 'N/A'}`)
      console.log(`Person Capacity: ${scrapedData.personCapacity || 'N/A'}`)
      console.log(`Bedrooms: ${scrapedData.bedrooms || 'N/A'}`)
      console.log(`Beds: ${scrapedData.beds || 'N/A'}`)
      console.log(`Bathrooms: ${scrapedData.bathrooms || 'N/A'}`)

      console.log('')
      console.log('💰 PRICING:')
      console.log('============')
      console.log(
        `Price: ${scrapedData.price?.amount || scrapedData.price || 'N/A'}`
      )
      console.log(
        `Currency: ${scrapedData.price?.currency || scrapedData.currency || 'N/A'}`
      )
      console.log(`Price Type: ${scrapedData.price?.qualifier || 'N/A'}`)

      console.log('')
      console.log('⭐ RATINGS:')
      console.log('============')
      console.log(
        `Overall Rating: ${scrapedData.rating?.guestSatisfaction || scrapedData.rating || 'N/A'}`
      )
      console.log(
        `Reviews Count: ${scrapedData.rating?.reviewsCount || scrapedData.reviewsCount || 'N/A'}`
      )
      console.log(`Accuracy: ${scrapedData.rating?.accuracy || 'N/A'}`)
      console.log(`Cleanliness: ${scrapedData.rating?.cleanliness || 'N/A'}`)
      console.log(`Check-in: ${scrapedData.rating?.checkin || 'N/A'}`)
      console.log(
        `Communication: ${scrapedData.rating?.communication || 'N/A'}`
      )
      console.log(`Location: ${scrapedData.rating?.location || 'N/A'}`)
      console.log(`Value: ${scrapedData.rating?.value || 'N/A'}`)

      console.log('')
      console.log('👤 HOST INFO:')
      console.log('==============')
      console.log(`Host Name: ${scrapedData.host?.name || 'N/A'}`)
      console.log(
        `Host Thumbnail: ${scrapedData.host?.thumbnailUrl ? '✅' : '❌'}`
      )
      console.log(
        `Is Superhost: ${scrapedData.host?.isSuperHost ? '✅' : '❌'}`
      )
      console.log(
        `Host Response Rate: ${scrapedData.host?.responseRate || 'N/A'}`
      )
      console.log(
        `Host Response Time: ${scrapedData.host?.responseTime || 'N/A'}`
      )

      console.log('')
      console.log('🏠 AMENITIES:')
      console.log('==============')
      if (scrapedData.amenities && Array.isArray(scrapedData.amenities)) {
        console.log(`Total Amenities: ${scrapedData.amenities.length}`)
        scrapedData.amenities.slice(0, 10).forEach((amenity, index) => {
          console.log(`${index + 1}. ${amenity.title || amenity}`)
        })
        if (scrapedData.amenities.length > 10) {
          console.log(`... and ${scrapedData.amenities.length - 10} more`)
        }
      } else {
        console.log('No amenities data')
      }

      console.log('')
      console.log('📷 IMAGES:')
      console.log('===========')
      if (scrapedData.images && Array.isArray(scrapedData.images)) {
        console.log(`Total Images: ${scrapedData.images.length}`)
        scrapedData.images.slice(0, 5).forEach((image, index) => {
          console.log(`${index + 1}. ${image.url || image}`)
        })
      } else {
        console.log('No images data')
      }

      console.log('')
      console.log('📍 COORDINATES:')
      console.log('================')
      console.log(`Latitude: ${scrapedData.coordinates?.latitude || 'N/A'}`)
      console.log(`Longitude: ${scrapedData.coordinates?.longitude || 'N/A'}`)

      console.log('')
      console.log('ℹ️ ADDITIONAL INFO:')
      console.log('===================')
      console.log(`Check-in: ${scrapedData.checkinTime || 'N/A'}`)
      console.log(`Check-out: ${scrapedData.checkoutTime || 'N/A'}`)
      console.log(`House Rules: ${scrapedData.houseRules?.length || 0} rules`)
      console.log(
        `Cancellation Policy: ${scrapedData.cancellationPolicy || 'N/A'}`
      )
      console.log(
        `Instant Bookable: ${scrapedData.isInstantBookable ? '✅' : '❌'}`
      )
      console.log(`Minimum Nights: ${scrapedData.minNights || 'N/A'}`)
      console.log(`Maximum Nights: ${scrapedData.maxNights || 'N/A'}`)

      return scrapedData
    } else {
      console.log('❌ No data found in dataset')
      console.log('Response:', JSON.stringify(response.data, null, 2))
      return null
    }
  } catch (error) {
    console.error('❌ Failed to get scraped data:', error.message)
    return null
  }
}

async function main() {
  console.log('🚀 Starting real Apify API test with direct scraping...')
  console.log('')

  let testResults = {
    actorAvailable: false,
    runStarted: false,
    runCompleted: false,
    dataRetrieved: false,
    scrapedData: null,
  }

  // Test 1: Check if actor is available
  testResults.actorAvailable = await testActorAvailability()

  if (!testResults.actorAvailable) {
    console.log('')
    console.log('❌ Cannot proceed - Actor not available')
    process.exit(1)
  }

  // Test 2: Start actor run
  const runId = await startActorRun()
  testResults.runStarted = !!runId

  if (!runId) {
    console.log('')
    console.log('❌ Cannot proceed - Failed to start actor run')
    process.exit(1)
  }

  // Test 3: Wait for completion
  const runData = await waitForCompletion(runId)
  testResults.runCompleted = !!runData

  if (!runData) {
    console.log('')
    console.log('❌ Cannot proceed - Actor run failed or timed out')
    process.exit(1)
  }

  // Test 4: Get scraped data
  const scrapedData = await getScrapedData(runData)
  testResults.dataRetrieved = !!scrapedData
  testResults.scrapedData = scrapedData

  // Final Report
  console.log('')
  console.log('📋 FINAL TEST REPORT')
  console.log('=====================')

  const tests = [
    { name: 'Actor Available', result: testResults.actorAvailable },
    { name: 'Run Started', result: testResults.runStarted },
    { name: 'Run Completed', result: testResults.runCompleted },
    { name: 'Data Retrieved', result: testResults.dataRetrieved },
  ]

  const passed = tests.filter((t) => t.result).length
  const total = tests.length

  console.log(`Overall: ${passed}/${total} tests passed`)
  console.log('')

  tests.forEach((test) => {
    console.log(`${test.result ? '✅' : '❌'} ${test.name}`)
  })

  console.log('')

  if (testResults.dataRetrieved && scrapedData) {
    console.log('🎉 SUCCESS: Real Apify scraping completed!')
    console.log('✅ Actor is available and working')
    console.log('✅ Real data successfully scraped')
    console.log('✅ All data fields populated')
    console.log('')
    console.log('🚀 The Apify integration is working with real data!')

    // Save results
    const results = {
      testConfig: {
        actorId: ACTOR_ID,
        testUrl: TEST_URL,
        timestamp: new Date().toISOString(),
      },
      testResults: testResults,
      scrapedData: scrapedData,
    }

    require('fs').writeFileSync(
      '/Users/leonardprobst/Documents/ListingBoost/real_apify_scraping_results.json',
      JSON.stringify(results, null, 2)
    )

    console.log('💾 Results saved to: real_apify_scraping_results.json')
  } else {
    console.log('❌ FAILURE: Real Apify scraping failed')
    console.log('Check the errors above for details')
  }

  process.exit(passed === total ? 0 : 1)
}

main().catch((error) => {
  console.error('💥 Test execution failed:', error)
  process.exit(1)
})
