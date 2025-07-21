/**
 * @file test_apify_simple.js
 * @description Simple Apify test using Node.js built-in modules
 * @created 2025-07-21
 */

const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUrl: 'https://www.airbnb.de/rooms/52007734',
  timeout: 300000,
}

console.log('🧪 APIFY INTEGRATION TEST (SIMPLE)')
console.log('==================================')
console.log(`Base URL: ${TEST_CONFIG.baseUrl}`)
console.log(`Test Listing: ${TEST_CONFIG.testUrl}`)
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
      timeout: options.timeout || 30000,
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

async function testHealthCheck() {
  console.log('🔍 TEST 1: Health Check')
  console.log('------------------------')

  try {
    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/analyze/health`
    )

    console.log(`Status: ${response.status}`)
    console.log('Response:', JSON.stringify(response.data, null, 2))

    if (response.ok && response.data.success) {
      console.log('✅ Health check PASSED')
      return { success: true, data: response.data }
    } else {
      console.log('❌ Health check FAILED')
      return {
        success: false,
        error: response.data.error || 'Health check failed',
      }
    }
  } catch (error) {
    console.error('❌ Health check ERROR:', error.message)
    return { success: false, error: error.message }
  }
}

async function testStatus() {
  console.log('')
  console.log('🔍 TEST 2: Status Check')
  console.log('------------------------')

  try {
    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/analyze/status`
    )

    console.log(`Status: ${response.status}`)
    console.log('Response:', JSON.stringify(response.data, null, 2))

    if (response.ok && response.data.success) {
      console.log('✅ Status check PASSED')
      return { success: true, data: response.data }
    } else {
      console.log('❌ Status check FAILED')
      return {
        success: false,
        error: response.data.error || 'Status check failed',
      }
    }
  } catch (error) {
    console.error('❌ Status check ERROR:', error.message)
    return { success: false, error: error.message }
  }
}

async function testAnalysisEndpoint() {
  console.log('')
  console.log('🔍 TEST 3: Analysis API (Lightweight)')
  console.log('-------------------------------------')

  try {
    console.log(`Analyzing: ${TEST_CONFIG.testUrl}`)
    console.log('⏳ This will test the endpoint (without full scraping)...')

    // First try with a quick test mode
    const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/analyze`, {
      method: 'POST',
      timeout: 60000, // 1 minute timeout for initial test
      body: {
        airbnb_url: TEST_CONFIG.testUrl,
        analysis_type: 'quick',
        force_update: false,
        enable_ai: false,
      },
    })

    console.log(`Status: ${response.status}`)

    if (response.ok && response.data.success) {
      console.log('✅ Analysis endpoint RESPONDED successfully')
      console.log('Analysis Data Keys:', Object.keys(response.data.data || {}))

      if (response.data.data) {
        // Check what data we got
        const data = response.data.data
        console.log('')
        console.log('📊 Response Analysis:')

        if (data.apifyResult) {
          console.log('✅ Apify result present')
          console.log(
            `- Listing data: ${data.apifyResult.listing ? 'Yes' : 'No'}`
          )
          console.log(
            `- Scoring data: ${data.apifyResult.scoring ? 'Yes' : 'No'}`
          )
        }

        if (data.enhancedScoring) {
          console.log('✅ Enhanced scoring present')
          console.log(`- Score: ${data.enhancedScoring.originalScore}`)
        }

        if (data.processingInfo) {
          console.log('✅ Processing info present')
          console.log(`- Total time: ${data.processingInfo.totalTime}ms`)
          console.log(`- Scraping time: ${data.processingInfo.scrapingTime}ms`)
        }
      }

      return { success: true, data: response.data }
    } else {
      console.log('❌ Analysis endpoint FAILED')
      console.log('Error:', response.data.error || 'Unknown error')
      return { success: false, error: response.data.error || 'Analysis failed' }
    }
  } catch (error) {
    console.error('❌ Analysis endpoint ERROR:', error.message)
    return { success: false, error: error.message }
  }
}

async function checkServerRunning() {
  try {
    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/analyze/health`,
      {
        timeout: 5000,
      }
    )
    return response.ok
  } catch (error) {
    return false
  }
}

async function main() {
  console.log('🔍 Checking if development server is running...')

  const serverRunning = await checkServerRunning()
  if (!serverRunning) {
    console.error('❌ Development server is not running!')
    console.log('')
    console.log('To run this test:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Wait for it to be ready (http://localhost:3000)')
    console.log('3. Run this test again: node test_apify_simple.js')
    console.log('')
    console.log('Note: This test requires a running Next.js development server')
    process.exit(1)
  }

  console.log('✅ Server is running')
  console.log('')

  // Run all tests
  const results = {
    health: await testHealthCheck(),
    status: await testStatus(),
    analysis: await testAnalysisEndpoint(),
  }

  // Generate report
  console.log('')
  console.log('📋 TEST SUMMARY')
  console.log('================')

  const tests = Object.entries(results)
  const passed = tests.filter(([_, result]) => result.success).length
  const total = tests.length

  console.log(`Results: ${passed}/${total} tests passed`)
  console.log('')

  tests.forEach(([name, result]) => {
    console.log(
      `${result.success ? '✅' : '❌'} ${name.toUpperCase()}: ${result.success ? 'PASSED' : 'FAILED'}`
    )
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`)
    }
  })

  console.log('')

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED!')
    console.log('✅ Apify API endpoints are working correctly')
    console.log('✅ Server is properly configured')
    console.log('✅ Basic integration is functional')
  } else {
    console.log('⚠️ Some tests failed.')
    console.log('Check the errors above and server logs for details.')
  }

  // Save detailed results
  const reportPath = path.join(__dirname, 'apify_test_results.json')
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        config: TEST_CONFIG,
        results: results,
        summary: { passed, total, success: passed === total },
      },
      null,
      2
    )
  )

  console.log('')
  console.log(`📄 Detailed results saved to: ${reportPath}`)

  process.exit(passed === total ? 0 : 1)
}

main().catch((error) => {
  console.error('💥 Test execution failed:', error)
  process.exit(1)
})
