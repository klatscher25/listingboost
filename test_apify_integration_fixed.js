#!/usr/bin/env node

/**
 * @file test_apify_integration_fixed.js
 * @description Test Apify integration with corrected configuration
 * @created 2025-01-21
 * @todo Verify Apify configuration fix resolves critical blocker
 */

const https = require('https')

// Test configuration with proper API token
const APIFY_API_TOKEN = 'YOUR_TOKEN_HERE'

const APIFY_ENDPOINTS = {
  URL_SCRAPER: {
    name: 'tri_angle~airbnb-rooms-urls-scraper',
    url: `https://api.apify.com/v2/acts/tri_angle~airbnb-rooms-urls-scraper/runs?token=${APIFY_API_TOKEN}`,
  },
  REVIEW_SCRAPER: {
    name: 'tri_angle~airbnb-reviews-scraper',
    url: `https://api.apify.com/v2/acts/tri_angle~airbnb-reviews-scraper/runs?token=${APIFY_API_TOKEN}`,
  },
  AVAILABILITY_SCRAPER: {
    name: 'rigelbytes~airbnb-availability-calendar',
    url: `https://api.apify.com/v2/acts/rigelbytes~airbnb-availability-calendar/runs?token=${APIFY_API_TOKEN}`,
  },
  LOCATION_SCRAPER: {
    name: 'tri_angle~airbnb-scraper',
    url: `https://api.apify.com/v2/acts/tri_angle~airbnb-scraper/runs?token=${APIFY_API_TOKEN}`,
  },
}

console.log('🧪 TESTING APIFY INTEGRATION AFTER CONFIGURATION FIX')
console.log('====================================================')

/**
 * Test single endpoint with proper error handling
 */
async function testEndpoint(name, endpoint) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${name}...`)

    const testData = {
      input: {
        startUrl: 'https://www.airbnb.com/rooms/123456', // Test URL
        maxItems: 1,
        timeout: 60,
      },
      options: {
        memoryMbytes: 1024,
        timeoutSecs: 60,
      },
    }

    const data = JSON.stringify(testData)
    const url = new URL(endpoint.url)

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        Authorization: `Bearer ${APIFY_API_TOKEN}`,
      },
    }

    const req = https.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const result = {
            name,
            endpoint: endpoint.name,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            response: responseData.substring(0, 200) + '...',
          }

          if (result.success) {
            console.log(
              `✅ ${name}: API endpoint erreichbar (Status: ${res.statusCode})`
            )
            const parsedResponse = JSON.parse(responseData)
            if (parsedResponse.id || parsedResponse.data?.id) {
              console.log(
                `   📋 Run ID erhalten: ${parsedResponse.id || parsedResponse.data?.id}`
              )
            }
          } else {
            console.log(`❌ ${name}: Fehler (Status: ${res.statusCode})`)
            console.log(`   📄 Response: ${responseData.substring(0, 150)}...`)
          }

          resolve(result)
        } catch (parseError) {
          console.log(`⚠️  ${name}: Response parsing error`)
          resolve({
            name,
            endpoint: endpoint.name,
            status: res.statusCode,
            success: false,
            error: 'JSON_PARSE_ERROR',
            response: responseData.substring(0, 200) + '...',
          })
        }
      })
    })

    req.on('error', (error) => {
      console.log(`❌ ${name}: Network error - ${error.message}`)
      resolve({
        name,
        endpoint: endpoint.name,
        status: 0,
        success: false,
        error: error.message,
      })
    })

    req.on('timeout', () => {
      console.log(`⏰ ${name}: Request timeout`)
      req.destroy()
      resolve({
        name,
        endpoint: endpoint.name,
        status: 0,
        success: false,
        error: 'TIMEOUT',
      })
    })

    req.setTimeout(10000) // 10 second timeout
    req.write(data)
    req.end()
  })
}

/**
 * Run comprehensive Apify integration test
 */
async function runApifyIntegrationTest() {
  const results = []

  // Test each scraper endpoint
  for (const [key, endpoint] of Object.entries(APIFY_ENDPOINTS)) {
    const result = await testEndpoint(key, endpoint)
    results.push(result)

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY')
  console.log('=======================')

  const successful = results.filter((r) => r.success).length
  const total = results.length

  results.forEach((result) => {
    const status = result.success ? '✅ WORKING' : '❌ FAILED'
    console.log(`${status} ${result.name} (${result.endpoint})`)
    if (!result.success) {
      console.log(`   Error: ${result.error || 'HTTP ' + result.status}`)
    }
  })

  console.log(`\n🎯 SUCCESS RATE: ${successful}/${total} scrapers accessible`)

  if (successful === total) {
    console.log('✅ APIFY INTEGRATION TEST PASSED - All scrapers accessible!')
    console.log('🚀 Critical blocker resolved - Ready for production testing')
  } else if (successful > 0) {
    console.log(
      '⚠️  PARTIAL SUCCESS - Some scrapers working, investigate failed ones'
    )
  } else {
    console.log(
      '❌ ALL TESTS FAILED - Check API token and network connectivity'
    )
  }

  return {
    total,
    successful,
    results,
    allPassed: successful === total,
  }
}

// Execute test
if (require.main === module) {
  runApifyIntegrationTest()
    .then((summary) => {
      console.log(
        `\n🏁 Test completed: ${summary.successful}/${summary.total} scrapers working`
      )
      process.exit(summary.allPassed ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error)
      process.exit(1)
    })
}

module.exports = { runApifyIntegrationTest }
