/**
 * @file test_apify_single_actor.js
 * @description Test single Apify actor directly to debug the specific issue
 * @created 2025-07-21
 */

require('dotenv').config({ path: '.env.local' })

const TEST_CONFIG = {
  airbnbUrl: 'https://www.airbnb.de/rooms/29732182',
  apifyToken: process.env.APIFY_API_TOKEN,
  actorId: 'tri_angle~airbnb-rooms-urls-scraper',
}

/**
 * Test single Apify actor directly with proper error handling
 */
async function testSingleActor() {
  console.log('🧪 DIRECT APIFY ACTOR TEST')
  console.log('=========================')
  console.log(`🔑 Token: ${TEST_CONFIG.apifyToken ? 'Present' : 'Missing'}`)
  console.log(`🌐 URL: ${TEST_CONFIG.airbnbUrl}`)
  console.log(`🤖 Actor: ${TEST_CONFIG.actorId}`)
  console.log('')

  if (!TEST_CONFIG.apifyToken) {
    console.error('❌ APIFY_API_TOKEN missing')
    return false
  }

  try {
    // Step 1: Start actor run
    console.log('🚀 Step 1: Starting actor run...')

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

    console.log(`✅ Run started successfully`)
    console.log(`📋 Run ID: ${runId}`)
    console.log(
      `🔗 Run URL: https://console.apify.com/actors/${TEST_CONFIG.actorId}/runs/${runId}`
    )

    if (!runId) {
      console.error('❌ No run ID received')
      return false
    }

    // Step 2: Monitor run status
    console.log('⏳ Step 2: Monitoring run status...')

    const startTime = Date.now()
    const timeout = 70000 // 70 seconds
    const pollInterval = 3000 // 3 seconds

    while (Date.now() - startTime < timeout) {
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

        console.log(
          `📊 Status: ${status} ${statusMessage ? `(${statusMessage})` : ''}`
        )

        if (status === 'SUCCEEDED') {
          console.log('🎉 Actor run completed successfully!')

          // Step 3: Get results
          console.log('📦 Step 3: Fetching results...')

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
          const items = Array.isArray(data) ? data : [data]

          console.log(`✅ Retrieved ${items.length} item(s)`)

          if (items.length > 0) {
            const listing = items[0]
            console.log('📋 Listing data preview:')
            console.log(`   • ID: ${listing.id || 'N/A'}`)
            console.log(`   • Title: ${listing.title || 'N/A'}`)
            console.log(
              `   • Rating: ${listing.rating?.guestSatisfaction || 'N/A'}`
            )
            console.log(
              `   • Price: ${listing.price?.amount || 'N/A'} ${listing.price?.currency || ''}`
            )
            console.log(`   • Host: ${listing.host?.name || 'N/A'}`)
            console.log(
              `   • Amenities: ${listing.amenities?.length || 0} categories`
            )

            // Check new fields
            console.log('🆕 New fields status:')
            console.log(
              `   • SEO Title: ${listing.seoTitle ? 'Present' : 'Missing'}`
            )
            console.log(
              `   • Android Link: ${listing.androidLink ? 'Present' : 'Missing'}`
            )
            console.log(
              `   • Home Tier: ${listing.homeTier ? listing.homeTier : 'Missing'}`
            )
            console.log(
              `   • Host Rating Avg: ${listing.host?.ratingAverage ? listing.host.ratingAverage : 'Missing'}`
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
 * Main execution
 */
async function main() {
  console.log('🔬 SINGLE APIFY ACTOR DEBUG TEST')
  console.log('================================')
  console.log(`📅 ${new Date().toLocaleString('de-DE')}`)
  console.log('')

  const startTime = Date.now()
  const success = await testSingleActor()
  const duration = Math.round((Date.now() - startTime) / 1000)

  console.log('')
  console.log('🏁 TEST COMPLETED')
  console.log('================')
  console.log(`⏱️ Duration: ${duration}s`)
  console.log(`✅ Success: ${success}`)

  if (success) {
    console.log('🎉 Apify integration is working correctly!')
  } else {
    console.log('❌ Apify integration has issues - check logs above')
  }

  process.exit(success ? 0 : 1)
}

main().catch(console.error)
