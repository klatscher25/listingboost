/**
 * @file test_apify_direct_debug.js
 * @description Direct Apify API test to debug scraper issues
 * @created 2025-07-21
 */

require('dotenv').config({ path: '.env.local' })

// Test configuration
const TEST_CONFIG = {
  airbnbUrl: 'https://www.airbnb.de/rooms/29732182',
  apifyToken: process.env.APIFY_API_TOKEN,
  actors: {
    urlScraper: 'tri_angle~airbnb-rooms-urls-scraper',
    comprehensive: 'tri_angle~airbnb-scraper',
    reviews: 'tri_angle~airbnb-reviews-scraper',
    availability: 'rigelbytes~airbnb-availability-calendar',
  },
}

/**
 * Test Apify actors directly
 */
async function testApifyActors() {
  console.log('🔧 DIRECT APIFY ACTOR TEST')
  console.log('==========================')
  console.log(`🔑 API Token: ${TEST_CONFIG.apifyToken ? 'Present' : 'Missing'}`)
  console.log(`🌐 Target URL: ${TEST_CONFIG.airbnbUrl}`)
  console.log('')

  if (!TEST_CONFIG.apifyToken) {
    console.error('❌ APIFY_API_TOKEN not found in environment')
    return false
  }

  // Test each actor
  const results = {}

  for (const [name, actorId] of Object.entries(TEST_CONFIG.actors)) {
    console.log(`🧪 Testing ${name} (${actorId})...`)

    try {
      // Check if actor exists
      const actorInfoResponse = await fetch(
        `https://api.apify.com/v2/acts/${actorId}`,
        {
          headers: {
            Authorization: `Bearer ${TEST_CONFIG.apifyToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!actorInfoResponse.ok) {
        console.log(`   ❌ Actor not found (${actorInfoResponse.status})`)
        results[name] = {
          available: false,
          error: `Actor not found: ${actorInfoResponse.status}`,
        }
        continue
      }

      const actorInfo = await actorInfoResponse.json()
      console.log(`   ✅ Actor found: ${actorInfo.data.title}`)

      // Test actor run (for URL scraper only to avoid timeouts)
      if (name === 'urlScraper') {
        console.log(`   🚀 Testing actor run...`)

        const runResponse = await fetch(
          `https://api.apify.com/v2/acts/${actorId}/runs`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${TEST_CONFIG.apifyToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              startUrls: [{ url: TEST_CONFIG.airbnbUrl }],
              maxItems: 1,
              maxRequestRetries: 2,
              requestHandlerTimeoutSecs: 60,
            }),
          }
        )

        if (!runResponse.ok) {
          console.log(`   ❌ Failed to start run (${runResponse.status})`)
          const errorText = await runResponse.text()
          results[name] = { available: true, runnable: false, error: errorText }
          continue
        }

        const runInfo = await runResponse.json()
        console.log(`   ✅ Run started: ${runInfo.data.id}`)

        // Wait a bit and check status
        console.log(`   ⏳ Waiting 10 seconds for initial results...`)
        await new Promise((resolve) => setTimeout(resolve, 10000))

        const statusResponse = await fetch(
          `https://api.apify.com/v2/acts/${actorId}/runs/${runInfo.data.id}`,
          {
            headers: {
              Authorization: `Bearer ${TEST_CONFIG.apifyToken}`,
            },
          }
        )

        if (statusResponse.ok) {
          const statusInfo = await statusResponse.json()
          console.log(`   📊 Status: ${statusInfo.data.status}`)
          results[name] = {
            available: true,
            runnable: true,
            status: statusInfo.data.status,
            runId: runInfo.data.id,
          }
        }
      } else {
        results[name] = { available: true, runnable: 'not_tested' }
        console.log(`   ✅ Available (run not tested)`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
      results[name] = { available: false, error: error.message }
    }

    console.log('')
  }

  // Summary
  console.log('📊 SUMMARY:')
  console.log('===========')

  const available = Object.values(results).filter((r) => r.available).length
  const total = Object.keys(results).length

  console.log(`✅ Available Actors: ${available}/${total}`)

  for (const [name, result] of Object.entries(results)) {
    if (result.available) {
      console.log(`   ✅ ${name}: Available`)
      if (result.runnable === true) {
        console.log(`      🚀 Test run successful (${result.status})`)
      } else if (result.runnable === false) {
        console.log(`      ❌ Test run failed: ${result.error}`)
      }
    } else {
      console.log(`   ❌ ${name}: ${result.error}`)
    }
  }

  return available > 0
}

/**
 * Test the current environment and configuration
 */
async function testEnvironment() {
  console.log('🌍 ENVIRONMENT TEST')
  console.log('===================')

  const checks = {
    APIFY_API_TOKEN: !!process.env.APIFY_API_TOKEN,
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Network connectivity': true, // We'll test this with a simple fetch
  }

  // Test network connectivity
  try {
    const response = await fetch('https://api.apify.com/v2', { method: 'HEAD' })
    checks['Network connectivity'] = response.ok
  } catch (error) {
    checks['Network connectivity'] = false
  }

  for (const [check, passed] of Object.entries(checks)) {
    console.log(`${passed ? '✅' : '❌'} ${check}`)
  }

  const allPassed = Object.values(checks).every(Boolean)
  console.log(
    `\n🏆 Environment Score: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length}`
  )

  return allPassed
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 APIFY DEBUG & DIAGNOSTICS')
  console.log('============================')
  console.log(`📅 ${new Date().toLocaleString('de-DE')}`)
  console.log('')

  // Test environment first
  const envOk = await testEnvironment()
  console.log('')

  if (!envOk) {
    console.log('❌ Environment issues detected. Fix before proceeding.')
    return
  }

  // Test Apify actors
  const apifyOk = await testApifyActors()

  console.log('')
  console.log('🏁 DIAGNOSIS COMPLETE')
  console.log('====================')
  console.log(`🌍 Environment: ${envOk ? 'OK' : 'Issues'}`)
  console.log(`🤖 Apify Actors: ${apifyOk ? 'OK' : 'Issues'}`)

  if (envOk && apifyOk) {
    console.log('✅ Ready for comprehensive Apify testing')
  } else {
    console.log('⚠️ Issues detected - check configuration')
  }
}

main().catch(console.error)
