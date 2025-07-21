/**
 * @file test_apify_direct.js
 * @description Direct test of Apify API connection and scraping
 * @created 2025-07-21
 */

const https = require('https')

// Configuration from environment
const APIFY_API_TOKEN = 'YOUR_TOKEN_HERE'
const ACTOR_ID = 'apify/web-scraper' // Using Apify's official web scraper as test
const TEST_URL = 'https://www.airbnb.de/rooms/52007734'

console.log('🧪 DIRECT APIFY API TEST')
console.log('========================')
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

async function testApifyConnection() {
  console.log('🔍 TEST 1: Apify API Connection')
  console.log('-------------------------------')

  try {
    // Test basic API access
    const response = await makeHttpsRequest({
      hostname: 'api.apify.com',
      port: 443,
      path: '/v2/users/me',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    console.log(`Status: ${response.status}`)
    console.log('Response:', JSON.stringify(response.data, null, 2))

    if (response.ok && response.data && response.data.id) {
      console.log('✅ Apify API connection successful')
      console.log(`User ID: ${response.data.id}`)
      console.log(`Username: ${response.data.username}`)
      console.log(`Plan: ${response.data.plan?.id || 'Unknown'}`)
      console.log(
        `Credits: $${response.data.plan?.monthlyUsageCreditsUsd || 0}`
      )
      return true
    } else {
      console.log('❌ Apify API connection failed')
      console.log(`Error: ${JSON.stringify(response.data)}`)
      return false
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    return false
  }
}

async function testActorAccess() {
  console.log('')
  console.log('🔍 TEST 2: Actor Access')
  console.log('-----------------------')

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

    if (response.ok) {
      console.log('✅ Actor access successful')
      console.log(`Actor Name: ${response.data.name}`)
      console.log(`Actor Title: ${response.data.title}`)
      console.log(
        `Actor Description: ${response.data.description?.substring(0, 100)}...`
      )
      console.log(`Actor Version: ${response.data.taggedBuilds?.latest}`)
      return true
    } else {
      console.log('❌ Actor access failed')
      console.log('Error:', JSON.stringify(response.data, null, 2))
      return false
    }
  } catch (error) {
    console.error('❌ Actor access test failed:', error.message)
    return false
  }
}

async function testActorRun() {
  console.log('')
  console.log('🔍 TEST 3: Actor Run (Real Scraping)')
  console.log('------------------------------------')
  console.log('⚠️ This will consume Apify credits!')
  console.log('')

  try {
    // Start actor run
    console.log('🚀 Starting actor run...')
    const startResponse = await makeHttpsRequest(
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
      {
        startUrls: [TEST_URL],
        maxListings: 1,
        includeReviews: false,
        proxyConfiguration: {
          useApifyProxy: true,
        },
      }
    )

    console.log(`Start Response Status: ${startResponse.status}`)

    if (!startResponse.ok || !startResponse.data.id) {
      console.log('❌ Failed to start actor run')
      console.log('Error:', JSON.stringify(startResponse.data, null, 2))
      return false
    }

    const runId = startResponse.data.id
    console.log(`✅ Actor run started: ${runId}`)
    console.log('⏳ Waiting for completion (this may take 2-5 minutes)...')

    // Poll for completion
    let attempts = 0
    const maxAttempts = 60 // 5 minutes with 5-second intervals

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds
      attempts++

      const statusResponse = await makeHttpsRequest({
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

      if (!statusResponse.ok) {
        console.error('❌ Failed to check run status')
        return false
      }

      const status = statusResponse.data.status
      console.log(`⏳ Status: ${status} (attempt ${attempts}/${maxAttempts})`)

      if (status === 'SUCCEEDED') {
        console.log('🎉 Actor run completed successfully!')

        // Get the results
        const datasetId = statusResponse.data.defaultDatasetId
        if (datasetId) {
          const resultsResponse = await makeHttpsRequest({
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

          if (resultsResponse.ok && resultsResponse.data.length > 0) {
            const listing = resultsResponse.data[0]
            console.log('')
            console.log('📊 SCRAPED DATA ANALYSIS:')
            console.log('=========================')
            console.log(`Title: ${listing.title || 'N/A'}`)
            console.log(`Price: ${listing.price?.amount || 'N/A'}`)
            console.log(`Rating: ${listing.rating?.guestSatisfaction || 'N/A'}`)
            console.log(`Reviews: ${listing.rating?.reviewsCount || 'N/A'}`)
            console.log(`Host: ${listing.host?.name || 'N/A'}`)
            console.log(`Superhost: ${listing.host?.isSuperHost || 'N/A'}`)
            console.log(`Images: ${listing.images?.length || 'N/A'}`)
            console.log(
              `Amenities: ${listing.amenities?.length || 'N/A'} categories`
            )
            console.log(
              `Location: ${listing.coordinates ? `${listing.coordinates.latitude},${listing.coordinates.longitude}` : 'N/A'}`
            )

            // Validate key fields
            const validationChecks = [
              {
                name: 'Has Title',
                check: !!listing.title && listing.title.length > 5,
              },
              { name: 'Has Price', check: !!listing.price?.amount },
              {
                name: 'Has Rating',
                check: typeof listing.rating?.guestSatisfaction === 'number',
              },
              {
                name: 'Has Reviews Count',
                check: typeof listing.rating?.reviewsCount === 'number',
              },
              { name: 'Has Host Info', check: !!listing.host?.name },
              {
                name: 'Has Images',
                check:
                  Array.isArray(listing.images) && listing.images.length > 0,
              },
              {
                name: 'Has Amenities',
                check:
                  Array.isArray(listing.amenities) &&
                  listing.amenities.length > 0,
              },
              {
                name: 'Has Coordinates',
                check:
                  !!listing.coordinates?.latitude &&
                  !!listing.coordinates?.longitude,
              },
            ]

            console.log('')
            console.log('🔍 DATA VALIDATION:')
            console.log('===================')
            const passedChecks = validationChecks.filter((check) => check.check)

            validationChecks.forEach((check) => {
              console.log(`${check.check ? '✅' : '❌'} ${check.name}`)
            })

            console.log('')
            console.log(
              `✅ Data Quality: ${passedChecks.length}/${validationChecks.length} checks passed`
            )

            if (passedChecks.length >= 6) {
              console.log(
                '🎉 EXCELLENT: Real Apify scraping is working perfectly!'
              )
              return true
            } else {
              console.log('⚠️ PARTIAL: Scraping worked but data incomplete')
              return false
            }
          } else {
            console.log('❌ No data returned from scraper')
            return false
          }
        } else {
          console.log('❌ No dataset ID found')
          return false
        }
      } else if (
        status === 'FAILED' ||
        status === 'ABORTED' ||
        status === 'TIMED-OUT'
      ) {
        console.error(`❌ Actor run ${status.toLowerCase()}`)
        console.error(
          'Error details:',
          JSON.stringify(statusResponse.data.statusMessage || 'No details')
        )
        return false
      }

      // Continue polling for RUNNING status
    }

    console.log('⏰ Timeout reached - actor still running')
    return false
  } catch (error) {
    console.error('❌ Actor run test failed:', error.message)
    return false
  }
}

async function main() {
  console.log('Starting comprehensive Apify API test...')
  console.log('')

  const results = {
    connection: await testApifyConnection(),
    actorAccess: await testActorAccess(),
    scraping: false,
  }

  // Only test scraping if the first two tests pass
  if (results.connection && results.actorAccess) {
    results.scraping = await testActorRun()
  } else {
    console.log('')
    console.log('⚠️ Skipping scraping test due to failed prerequisites')
  }

  // Final report
  console.log('')
  console.log('📋 FINAL TEST REPORT')
  console.log('====================')

  const tests = Object.entries(results)
  const passed = tests.filter(([_, result]) => result).length
  const total = tests.length

  console.log(`Overall: ${passed}/${total} tests passed`)
  console.log('')

  tests.forEach(([name, result]) => {
    console.log(
      `${result ? '✅' : '❌'} ${name.toUpperCase()}: ${result ? 'PASSED' : 'FAILED'}`
    )
  })

  console.log('')

  if (results.scraping) {
    console.log('🎉 SUCCESS: Apify integration is fully working!')
    console.log('✅ API connection established')
    console.log('✅ Actor access confirmed')
    console.log('✅ Real data scraping functional')
    console.log('✅ Data quality validated')
    console.log('')
    console.log('🚀 The Apify APIs are ready for production use!')
  } else if (results.connection && results.actorAccess) {
    console.log(
      '⚠️ PARTIAL SUCCESS: API access works, scraping needs attention'
    )
    console.log('✅ API connection established')
    console.log('✅ Actor access confirmed')
    console.log('❌ Real data scraping failed')
    console.log('')
    console.log('🔧 Possible issues:')
    console.log('- Actor configuration problems')
    console.log('- Input parameters incorrect')
    console.log('- Proxy or network issues')
    console.log('- Target website blocking requests')
  } else {
    console.log('❌ FAILURE: Apify API access problems')
    console.log('')
    console.log('🔧 Possible issues:')
    console.log('- Invalid API token')
    console.log('- Actor not found or access denied')
    console.log('- Network connectivity problems')
    console.log('- Account limitations or billing issues')
  }

  process.exit(passed === total ? 0 : 1)
}

main().catch((error) => {
  console.error('💥 Test execution failed:', error)
  process.exit(1)
})
