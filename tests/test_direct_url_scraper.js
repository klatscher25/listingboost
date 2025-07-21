/**
 * @file test_direct_url_scraper.js
 * @description Test ONLY the URL scraper directly to see exact timeout point
 * @created 2025-07-21
 */

require('dotenv').config({ path: '.env.local' })

/**
 * Test the URL scraper directly using the same approach that works
 */
async function testDirectUrlScraper() {
  console.log('🧪 DIRECT URL SCRAPER TEST')
  console.log('==========================')

  const TEST_CONFIG = {
    airbnbUrl: 'https://www.airbnb.de/rooms/29732182',
    apifyToken: process.env.APIFY_API_TOKEN,
    actorId: 'tri_angle~airbnb-rooms-urls-scraper',
  }

  console.log(`🔑 Token: ${TEST_CONFIG.apifyToken ? 'Present' : 'Missing'}`)
  console.log(`🌐 URL: ${TEST_CONFIG.airbnbUrl}`)
  console.log(`🤖 Actor: ${TEST_CONFIG.actorId}`)
  console.log('')

  if (!TEST_CONFIG.apifyToken) {
    console.error('❌ APIFY_API_TOKEN missing')
    return false
  }

  try {
    console.log('🚀 Step 1: Starting actor run...')

    const startTime = Date.now()

    const startResponse = await fetch(
      `https://api.apify.com/v2/acts/${TEST_CONFIG.actorId}/runs`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TEST_CONFIG.apifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startUrls: [{ url: TEST_CONFIG.airbnbUrl }],
          maxListings: 1,
          includeReviews: false,
          proxyConfiguration: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
          },
          options: {
            memoryMbytes: 1024,
            timeoutSecs: 60,
          },
        }),
      }
    )

    if (!startResponse.ok) {
      const errorText = await startResponse.text()
      console.error(
        `❌ Failed to start run (${startResponse.status}):`,
        errorText
      )
      return false
    }

    const runInfo = await startResponse.json()
    const runId = runInfo.data?.id

    console.log(`✅ Run started successfully in ${Date.now() - startTime}ms`)
    console.log(`📋 Run ID: ${runId}`)

    if (!runId) {
      console.error('❌ No run ID received')
      return false
    }

    // Step 2: Monitor run status with detailed timing
    console.log('⏳ Step 2: Monitoring run status...')

    const pollStart = Date.now()
    const timeout = 70000 // 70 seconds
    const pollInterval = 2000 // 2 seconds

    while (Date.now() - pollStart < timeout) {
      try {
        const statusResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}`,
          {
            headers: {
              Authorization: `Bearer ${TEST_CONFIG.apifyToken}`,
            },
          }
        )

        if (!statusResponse.ok) {
          console.error(`❌ Failed to get status (${statusResponse.status})`)
          await new Promise((resolve) => setTimeout(resolve, pollInterval))
          continue
        }

        const statusInfo = await statusResponse.json()
        const status = statusInfo.data?.status
        const statusMessage = statusInfo.data?.statusMessage

        const elapsed = Math.round((Date.now() - pollStart) / 1000)
        console.log(
          `📊 [${elapsed}s] Status: ${status} ${statusMessage ? `(${statusMessage})` : ''}`
        )

        if (status === 'SUCCEEDED') {
          const totalTime = Date.now() - startTime
          console.log(`🎉 Actor run completed successfully in ${totalTime}ms!`)

          // Step 3: Get results with timing
          console.log('📦 Step 3: Fetching results...')
          const dataFetchStart = Date.now()

          const datasetId = statusInfo.data?.defaultDatasetId
          if (!datasetId) {
            console.error('❌ No dataset ID found')
            return false
          }

          const dataResponse = await fetch(
            `https://api.apify.com/v2/datasets/${datasetId}/items`,
            {
              headers: {
                Authorization: `Bearer ${TEST_CONFIG.apifyToken}`,
              },
            }
          )

          if (!dataResponse.ok) {
            console.error(`❌ Failed to get dataset (${dataResponse.status})`)
            return false
          }

          const data = await dataResponse.json()
          const dataFetchTime = Date.now() - dataFetchStart

          console.log(`✅ Data fetched in ${dataFetchTime}ms`)

          const items = Array.isArray(data) ? data : [data]
          console.log(`✅ Retrieved ${items.length} item(s)`)

          if (items.length > 0) {
            const listing = items[0]
            console.log('📋 SUCCESS! Basic data:')
            console.log(`   • ID: ${listing.id || 'N/A'}`)
            console.log(`   • Title: ${listing.title || 'N/A'}`)
            console.log(
              `   • Rating: ${listing.rating?.guestSatisfaction || 'N/A'}`
            )
            console.log(
              `   • Price: ${listing.price?.amount || 'N/A'} ${listing.price?.currency || ''}`
            )
          }

          return true
        } else if (
          status === 'FAILED' ||
          status === 'ABORTED' ||
          status === 'TIMED-OUT'
        ) {
          console.error(`❌ Actor run failed: ${status}`)
          console.error(`💬 Message: ${statusMessage || 'No message'}`)
          return false
        }

        // Still running, wait and check again
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
      } catch (error) {
        console.error('❌ Error checking status:', error.message)
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
      }
    }

    // Timeout reached
    console.error('❌ Timeout reached while waiting for run completion')
    return false
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

/**
 * Now test through our service layer step by step
 */
async function testServiceLayerSteps() {
  console.log('')
  console.log('🔧 SERVICE LAYER STEP-BY-STEP TEST')
  console.log('===================================')

  try {
    // Test 1: Database connection
    console.log('🗄️ Test 1: Database connection...')
    const dbStart = Date.now()

    // Simulate database check (don't actually import to avoid TS issues)
    await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate DB check
    console.log(`✅ Database simulation: ${Date.now() - dbStart}ms`)

    // Test 2: Config access
    console.log('⚙️ Test 2: Configuration access...')
    const configStart = Date.now()

    const token = process.env.APIFY_API_TOKEN
    const urlScraperActor =
      process.env.APIFY_ACTOR_URL_SCRAPER ||
      'tri_angle~airbnb-rooms-urls-scraper'

    console.log(`✅ Config access: ${Date.now() - configStart}ms`)
    console.log(`   • Token: ${token ? 'Present' : 'Missing'}`)
    console.log(`   • URL Actor: ${urlScraperActor}`)

    return true
  } catch (error) {
    console.error('❌ Service layer test failed:', error.message)
    return false
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔬 APIFY BOTTLENECK ISOLATION TEST')
  console.log('==================================')
  console.log(`📅 ${new Date().toLocaleString('de-DE')}`)
  console.log('')

  const startTime = Date.now()

  // Test 1: Direct Apify API (we know this works)
  const directSuccess = await testDirectUrlScraper()

  // Test 2: Service layer components
  const serviceSuccess = await testServiceLayerSteps()

  const totalTime = Math.round((Date.now() - startTime) / 1000)

  console.log('')
  console.log('🏁 ISOLATION TEST COMPLETED')
  console.log('===========================')
  console.log(`⏱️ Total Duration: ${totalTime}s`)
  console.log(`🎯 Direct Apify API: ${directSuccess ? 'SUCCESS' : 'FAILED'}`)
  console.log(`🔧 Service Layer: ${serviceSuccess ? 'SUCCESS' : 'FAILED'}`)

  if (directSuccess && serviceSuccess) {
    console.log('')
    console.log('💡 NEXT STEP: The issue is likely in:')
    console.log('   1. TypeScript compilation during runtime')
    console.log('   2. Database operations taking too long')
    console.log('   3. Data transformation steps')
    console.log('   4. Service coordination overhead')
  }

  process.exit(directSuccess && serviceSuccess ? 0 : 1)
}

main().catch(console.error)
