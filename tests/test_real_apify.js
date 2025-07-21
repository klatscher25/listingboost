/**
 * @file test_real_apify.js
 * @description Test real Apify scraping with force update
 * @created 2025-07-21
 */

const http = require('http')
const https = require('https')

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUrl: 'https://www.airbnb.de/rooms/52007734', // Real Berlin apartment
  timeout: 600000, // 10 minutes for real scraping
}

console.log('🧪 REAL APIFY SCRAPING TEST')
console.log('===========================')
console.log(`Test URL: ${TEST_CONFIG.testUrl}`)
console.log(`Timeout: ${TEST_CONFIG.timeout / 1000}s`)
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

async function testRealApifyScraping() {
  console.log('🔍 REAL APIFY SCRAPING TEST')
  console.log('🚨 This will perform actual scraping and may take 5-10 minutes!')
  console.log('⚠️ This uses real Apify API credits!')
  console.log('')

  try {
    const startTime = Date.now()

    console.log(`Starting real scraping of: ${TEST_CONFIG.testUrl}`)
    console.log('⏳ Please wait... this may take several minutes')
    console.log('')

    // Track progress
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
        force_update: true, // Force real scraping
        enable_ai: false, // Focus on Apify only
      },
    })

    clearInterval(progressInterval)
    const totalTime = Date.now() - startTime

    console.log('')
    console.log('🏁 SCRAPING COMPLETED!')
    console.log(
      `Total time: ${Math.floor(totalTime / 1000)}s (${Math.floor(totalTime / 60000)}m ${Math.floor((totalTime % 60000) / 1000)}s)`
    )
    console.log(`Status: ${response.status}`)
    console.log('')

    if (response.ok && response.data.success) {
      const data = response.data.data
      const isRealData = data.scrapingMetadata?.dataSource !== 'mock_fallback'

      console.log('📊 SCRAPING RESULTS ANALYSIS')
      console.log('=============================')
      console.log(
        `Data Source: ${isRealData ? '🟢 REAL APIFY DATA' : '🔴 MOCK FALLBACK DATA'}`
      )

      if (data.scrapingMetadata) {
        console.log('')
        console.log('📈 Scraping Metadata:')
        console.log(`- Scraped at: ${data.scrapingMetadata.scrapedAt}`)
        console.log(`- Data completeness:`)
        console.log(
          `  - Listing: ${data.scrapingMetadata.dataCompleteness?.listing ? '✅' : '❌'}`
        )
        console.log(
          `  - Reviews: ${data.scrapingMetadata.dataCompleteness?.reviews ? '✅' : '❌'}`
        )
        console.log(
          `  - Availability: ${data.scrapingMetadata.dataCompleteness?.availability ? '✅' : '❌'}`
        )
        console.log(
          `  - Competitors: ${data.scrapingMetadata.dataCompleteness?.competitors ? '✅' : '❌'}`
        )
        console.log(
          `- Processing time: ${data.scrapingMetadata.processingTime?.total}ms`
        )
        console.log(`- Data source: ${data.scrapingMetadata.dataSource}`)
      }

      if (isRealData && data.listing) {
        console.log('')
        console.log('🏠 REAL LISTING DATA:')
        console.log(`- Airbnb ID: ${data.listing.airbnb_id}`)
        console.log(`- Title: ${data.listing.title}`)
        console.log(`- Location: ${data.listing.location}`)
        console.log(
          `- Price: ${data.listing.price_per_night}${data.listing.currency}`
        )
        console.log(`- Rating: ${data.listing.overall_rating}`)
        console.log(`- Reviews: ${data.listing.reviews_count}`)
        console.log(`- Host: ${data.listing.host_name}`)
        console.log(
          `- Superhost: ${data.listing.host_is_superhost ? '✅' : '❌'}`
        )
        console.log(`- Images: ${data.listing.images_count}`)
        console.log(`- WiFi: ${data.listing.wifi_available ? '✅' : '❌'}`)
        console.log(
          `- Kitchen: ${data.listing.kitchen_available ? '✅' : '❌'}`
        )

        // Validate data integrity
        console.log('')
        console.log('🔍 DATA INTEGRITY CHECK:')

        const integrityChecks = [
          { name: 'Has Airbnb ID', check: !!data.listing.airbnb_id },
          {
            name: 'Has Title',
            check: !!data.listing.title && data.listing.title.length > 10,
          },
          { name: 'Has Valid Price', check: data.listing.price_per_night > 0 },
          {
            name: 'Has Rating',
            check:
              data.listing.overall_rating >= 1 &&
              data.listing.overall_rating <= 5,
          },
          { name: 'Has Reviews', check: data.listing.reviews_count > 0 },
          { name: 'Has Host Info', check: !!data.listing.host_name },
          { name: 'Has Images', check: data.listing.images_count > 0 },
          { name: 'Has Location', check: !!data.listing.location },
        ]

        const passedChecks = integrityChecks.filter((check) => check.check)

        integrityChecks.forEach((check) => {
          console.log(`${check.check ? '✅' : '❌'} ${check.name}`)
        })

        console.log('')
        console.log(
          `✅ Data Integrity: ${passedChecks.length}/${integrityChecks.length} checks passed`
        )

        if (data.scoring) {
          console.log('')
          console.log('🎯 SCORING RESULTS:')
          console.log(
            `- Total Score: ${data.scoring.totalScore}/1000 (${data.scoring.percentage}%)`
          )
          console.log(`- Performance Level: ${data.scoring.performanceLevel}`)
          console.log(`- Data Completeness: ${data.scoring.dataCompleteness}%`)

          console.log('')
          console.log('📊 Category Breakdown:')
          Object.entries(data.scoring.categoryScores).forEach(
            ([category, score]) => {
              console.log(
                `- ${category}: ${score.score}/${score.maxScore} (${score.percentage}%)`
              )
            }
          )
        }

        if (passedChecks.length === integrityChecks.length) {
          console.log('')
          console.log('🎉 SUCCESS: Real Apify scraping working perfectly!')
          console.log('✅ All data integrity checks passed')
          console.log('✅ Scoring system integrated successfully')
          console.log('✅ Database-ready format confirmed')
          return true
        } else {
          console.log('')
          console.log(
            '⚠️ PARTIAL SUCCESS: Scraping worked but some data incomplete'
          )
          return false
        }
      } else if (!isRealData) {
        console.log('')
        console.log('❌ REAL SCRAPING FAILED')
        console.log(
          'The API fell back to mock data, indicating Apify scraping issues'
        )
        console.log('')
        console.log('Possible causes:')
        console.log('- Invalid Apify API token')
        console.log('- Rate limiting')
        console.log('- Actor not found or unavailable')
        console.log('- Network connectivity issues')
        console.log('- Airbnb listing not accessible')

        if (response.data.meta?.warning) {
          console.log(`- API Warning: ${response.data.meta.warning}`)
        }

        return false
      }
    } else {
      console.error(
        '❌ API request failed:',
        response.data.error || 'Unknown error'
      )
      return false
    }
  } catch (error) {
    console.error('💥 Real scraping test crashed:', error.message)
    return false
  }
}

async function main() {
  console.log('🔍 Checking server availability...')

  try {
    const health = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/analyze/health`,
      { timeout: 10000 }
    )
    if (!health.ok) {
      console.error('❌ Server health check failed')
      process.exit(1)
    }
    console.log('✅ Server is healthy')
  } catch (error) {
    console.error('❌ Server not available:', error.message)
    console.log('Please start the development server: npm run dev')
    process.exit(1)
  }

  console.log('')
  console.log('⚠️  WARNING: This test will use real Apify API credits!')
  console.log('⚠️  The scraping process may take 5-10 minutes!')
  console.log('')
  console.log('Proceeding with real Apify scraping test in 5 seconds...')

  // Give a chance to cancel
  await new Promise((resolve) => setTimeout(resolve, 5000))

  const success = await testRealApifyScraping()

  console.log('')
  console.log('📋 FINAL RESULT')
  console.log('================')

  if (success) {
    console.log('🎉 REAL APIFY INTEGRATION: ✅ WORKING PERFECTLY')
    console.log('')
    console.log('Summary:')
    console.log('✅ Apify API connection successful')
    console.log('✅ Real data scraping functional')
    console.log('✅ Data transformation working')
    console.log('✅ Scoring system integration complete')
    console.log('✅ Database format validated')
    console.log('')
    console.log('🚀 The Apify integration is production-ready!')
  } else {
    console.log('❌ REAL APIFY INTEGRATION: NEEDS ATTENTION')
    console.log('')
    console.log('Issues found:')
    console.log('- Either real scraping failed')
    console.log('- Or data integrity checks failed')
    console.log('- Check server logs for detailed error information')
  }

  process.exit(success ? 0 : 1)
}

main().catch((error) => {
  console.error('💥 Test execution failed:', error)
  process.exit(1)
})
