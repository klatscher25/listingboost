/**
 * @file test_apify_api.js
 * @description Test Apify API integration through API endpoints
 * @created 2025-07-21
 * @todo Test complete Apify pipeline via HTTP API calls
 */

const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUrl: 'https://www.airbnb.de/rooms/52007734', // Real Berlin apartment
  timeout: 300000, // 5 minutes
  userId: 'test_user_' + Date.now(),
}

console.log('🧪 APIFY API INTEGRATION TEST')
console.log('=============================')
console.log(`Base URL: ${TEST_CONFIG.baseUrl}`)
console.log(`Test Listing: ${TEST_CONFIG.testUrl}`)
console.log(`User ID: ${TEST_CONFIG.userId}`)
console.log('')

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function testApifyAPI() {
  let testResults = {
    healthCheck: false,
    analyse: false,
    dataValidation: false,
    performance: {
      healthCheckTime: 0,
      analysisTime: 0,
    },
    data: {},
    errors: [],
  }

  try {
    // Test 1: Health Check
    console.log('🔍 TEST 1: API Health Check')
    console.log('----------------------------')

    const healthStartTime = Date.now()
    try {
      const healthResponse = await fetch(
        `${TEST_CONFIG.baseUrl}/api/analyze/health`
      )
      const healthData = await healthResponse.json()
      testResults.performance.healthCheckTime = Date.now() - healthStartTime

      console.log('Health Response:', JSON.stringify(healthData, null, 2))

      if (healthResponse.ok && healthData.success) {
        console.log('✅ Health check passed')
        testResults.healthCheck = true

        // Check service capabilities
        if (healthData.data && healthData.data.apify) {
          console.log(
            `Apify Status: ${healthData.data.apify.healthy ? '🟢 Healthy' : '🔴 Unhealthy'}`
          )
          console.log(`Rate Limits: Available`)
        }

        if (healthData.data && healthData.data.gemini) {
          console.log(
            `Gemini AI Status: ${healthData.data.gemini.healthy ? '🟢 Healthy' : '🔴 Unhealthy'}`
          )
        }
      } else {
        console.error(
          '❌ Health check failed:',
          healthData.error || 'Unknown error'
        )
        testResults.errors.push('Health check failed')
      }
    } catch (error) {
      console.error('❌ Health check request failed:', error.message)
      testResults.errors.push(`Health check request: ${error.message}`)
    }

    console.log('')

    // Test 2: Analysis API
    console.log('🔍 TEST 2: Listing Analysis API')
    console.log('--------------------------------')

    if (!testResults.healthCheck) {
      console.log('⚠️ Skipping analysis test due to failed health check')
      return testResults
    }

    const analysisStartTime = Date.now()
    try {
      console.log(`Analyzing: ${TEST_CONFIG.testUrl}`)
      console.log('⏳ This may take 2-5 minutes...')

      const analysisResponse = await fetch(
        `${TEST_CONFIG.baseUrl}/api/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            airbnb_url: TEST_CONFIG.testUrl,
            analysis_type: 'comprehensive',
            force_update: true,
            enable_ai: false, // Disable AI to focus on Apify
            ai_analysis_type: 'quick',
          }),
        }
      )

      const analysisData = await analysisResponse.json()
      testResults.performance.analysisTime = Date.now() - analysisStartTime

      if (analysisResponse.ok && analysisData.success) {
        console.log(
          `✅ Analysis completed in ${testResults.performance.analysisTime}ms`
        )
        testResults.analyse = true
        testResults.data = analysisData.data

        console.log('')
        console.log('📊 Analysis Results Summary:')

        // Apify Results
        if (analysisData.data.apifyResult) {
          const apifyResult = analysisData.data.apifyResult
          console.log('📦 Apify Scraping Results:')
          console.log(`- Title: ${apifyResult.listing?.title || 'N/A'}`)
          console.log(`- Price: ${apifyResult.listing?.price?.amount || 'N/A'}`)
          console.log(
            `- Rating: ${apifyResult.listing?.rating?.guestSatisfaction || 'N/A'}`
          )
          console.log(
            `- Reviews: ${apifyResult.listing?.rating?.reviewsCount || 'N/A'}`
          )
          console.log(`- Host: ${apifyResult.listing?.host?.name || 'N/A'}`)
          console.log(
            `- Superhost: ${apifyResult.listing?.host?.isSuperHost || 'N/A'}`
          )
          console.log(
            `- Images: ${apifyResult.listing?.images?.length || 'N/A'}`
          )
          console.log(
            `- Amenities: ${apifyResult.listing?.amenities?.length || 'N/A'} categories`
          )
        }

        // Scoring Results
        if (analysisData.data.enhancedScoring) {
          const scoring = analysisData.data.enhancedScoring
          console.log('')
          console.log('🎯 Scoring Results:')
          console.log(`- Original Score: ${scoring.originalScore}/1000`)
          console.log(`- Enhanced Score: ${scoring.aiEnhancedScore}/1000`)
          console.log(`- Confidence: ${scoring.confidenceLevel}%`)
        }

        // Recommendations
        if (analysisData.data.combinedRecommendations) {
          console.log('')
          console.log('💡 Top Recommendations:')
          analysisData.data.combinedRecommendations
            .slice(0, 5)
            .forEach((rec, index) => {
              console.log(
                `${index + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`
              )
            })
        }

        // Processing Info
        if (analysisData.data.processingInfo) {
          const processing = analysisData.data.processingInfo
          console.log('')
          console.log('⏱️ Processing Performance:')
          console.log(`- Scraping Time: ${processing.scrapingTime}ms`)
          console.log(`- Total Time: ${processing.totalTime}ms`)
          console.log(
            `- AI Analysis: ${processing.aiAnalysisEnabled ? 'Enabled' : 'Disabled'}`
          )
          if (processing.failureReason) {
            console.log(`- Failure Reason: ${processing.failureReason}`)
          }
        }
      } else {
        console.error(
          '❌ Analysis failed:',
          analysisData.error || 'Unknown error'
        )
        testResults.errors.push(
          `Analysis failed: ${analysisData.error?.message || 'Unknown error'}`
        )
      }
    } catch (error) {
      console.error('❌ Analysis request failed:', error.message)
      testResults.errors.push(`Analysis request: ${error.message}`)
    }

    console.log('')

    // Test 3: Data Validation
    console.log('🔍 TEST 3: Data Validation')
    console.log('--------------------------')

    if (testResults.analyse && testResults.data.apifyResult) {
      const listing = testResults.data.apifyResult.listing
      let validationErrors = []

      // Check required fields
      const requiredFields = {
        id: listing?.id,
        title: listing?.title,
        url: listing?.url,
        price: listing?.price,
        rating: listing?.rating,
        host: listing?.host,
      }

      console.log('🔍 Validating required fields...')
      Object.entries(requiredFields).forEach(([field, value]) => {
        if (!value) {
          validationErrors.push(`Missing ${field}`)
          console.log(`❌ Missing: ${field}`)
        } else {
          console.log(`✅ Present: ${field}`)
        }
      })

      // Check data types
      console.log('')
      console.log('🔍 Validating data types...')

      const typeChecks = [
        {
          field: 'price.amount',
          value: listing?.price?.amount,
          expectedType: 'string',
        },
        {
          field: 'rating.guestSatisfaction',
          value: listing?.rating?.guestSatisfaction,
          expectedType: 'number',
        },
        {
          field: 'rating.reviewsCount',
          value: listing?.rating?.reviewsCount,
          expectedType: 'number',
        },
        {
          field: 'host.isSuperHost',
          value: listing?.host?.isSuperHost,
          expectedType: 'boolean',
        },
        { field: 'images', value: listing?.images, expectedType: 'object' },
        {
          field: 'amenities',
          value: listing?.amenities,
          expectedType: 'object',
        },
      ]

      typeChecks.forEach(({ field, value, expectedType }) => {
        if (value !== null && value !== undefined) {
          const actualType = Array.isArray(value) ? 'object' : typeof value
          if (actualType === expectedType) {
            console.log(`✅ ${field}: ${expectedType}`)
          } else {
            console.log(
              `❌ ${field}: expected ${expectedType}, got ${actualType}`
            )
            validationErrors.push(`${field} type mismatch`)
          }
        } else {
          console.log(`⚠️ ${field}: null/undefined`)
        }
      })

      if (validationErrors.length === 0) {
        console.log('✅ All data validation checks passed')
        testResults.dataValidation = true
      } else {
        console.error(
          `❌ Data validation failed: ${validationErrors.join(', ')}`
        )
        testResults.errors.push(
          `Data validation: ${validationErrors.join(', ')}`
        )
      }
    } else {
      console.log('⚠️ Skipping data validation - no analysis data available')
    }

    return testResults
  } catch (error) {
    console.error('💥 Test suite crashed:', error)
    testResults.errors.push(`Test suite crash: ${error.message}`)
    return testResults
  }
}

async function generateTestReport(results) {
  console.log('')
  console.log('📋 TEST REPORT')
  console.log('==============')

  // Overall Results
  const totalTests = 3
  const passedTests = [
    results.healthCheck,
    results.analyse,
    results.dataValidation,
  ].filter(Boolean).length

  console.log(`Overall: ${passedTests}/${totalTests} tests passed`)
  console.log('')

  // Individual Test Results
  console.log('📊 Individual Results:')
  console.log(`✅ Health Check: ${results.healthCheck ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Analysis API: ${results.analyse ? 'PASSED' : 'FAILED'}`)
  console.log(
    `✅ Data Validation: ${results.dataValidation ? 'PASSED' : 'FAILED'}`
  )
  console.log('')

  // Performance Metrics
  console.log('⏱️ Performance Metrics:')
  console.log(`- Health Check: ${results.performance.healthCheckTime}ms`)
  console.log(`- Analysis Time: ${results.performance.analysisTime}ms`)
  console.log(
    `- Total Test Time: ${results.performance.healthCheckTime + results.performance.analysisTime}ms`
  )
  console.log('')

  // Errors
  if (results.errors.length > 0) {
    console.log('❌ Errors Encountered:')
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`)
    })
    console.log('')
  }

  // Final Assessment
  const success = passedTests === totalTests && results.errors.length === 0
  console.log(
    success
      ? '🎉 ALL TESTS PASSED! Apify integration is working correctly.'
      : '⚠️ Some tests failed. Review errors above.'
  )

  // Save results to file
  const reportPath = path.join(__dirname, 'apify_test_report.json')
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        testConfig: TEST_CONFIG,
        results,
        summary: {
          totalTests,
          passedTests,
          success,
        },
      },
      null,
      2
    )
  )

  console.log(`📄 Detailed report saved to: ${reportPath}`)

  return success
}

// Check if server is running
async function checkServerRunning() {
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/analyze/health`)
    return response.ok
  } catch (error) {
    return false
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if development server is running...')

  const serverRunning = await checkServerRunning()
  if (!serverRunning) {
    console.error('❌ Development server is not running!')
    console.log('Please start the server with: npm run dev')
    console.log('Then run this test again.')
    process.exit(1)
  }

  console.log('✅ Server is running')
  console.log('')

  const results = await testApifyAPI()
  const success = await generateTestReport(results)

  process.exit(success ? 0 : 1)
}

main().catch((error) => {
  console.error('💥 Test execution failed:', error)
  process.exit(1)
})
