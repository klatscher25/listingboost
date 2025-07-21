/**
 * @file test_basic_apify_api.js
 * @description Test basic Apify service directly through API endpoint without AI
 * @created 2025-07-21
 */

require('dotenv').config({ path: '.env.local' })

/**
 * Test the API endpoint with AI disabled to isolate the issue
 */
async function testBasicApifyAPI() {
  console.log('🧪 BASIC APIFY API TEST (NO AI)')
  console.log('=================================')

  try {
    const testUrl = 'https://www.airbnb.de/rooms/29732182'

    console.log('🚀 Testing API endpoint with AI disabled...')
    console.log(`📋 URL: ${testUrl}`)
    console.log(`🤖 AI: disabled`)
    console.log(`⚡ Type: quick analysis`)
    console.log('')

    const startTime = Date.now()

    // Call the API endpoint directly
    const response = await fetch('http://localhost:3002/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        airbnb_url: testUrl,
        analysis_type: 'quick', // Quick analysis
        enable_ai: false, // No AI
        force_update: true,
      }),
    })

    const duration = Date.now() - startTime

    console.log(`⏱️ Response time: ${duration}ms`)
    console.log(`📊 Status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      return false
    }

    const result = await response.json()

    if (result.success) {
      console.log('✅ API Response successful!')
      console.log('')
      console.log('📊 RESULTS:')
      console.log('===========')
      console.log(
        `📋 Listing ID: ${result.data.apifyResult.listing.id || 'N/A'}`
      )
      console.log(`📝 Title: ${result.data.apifyResult.listing.title || 'N/A'}`)
      console.log(
        `⭐ Rating: ${result.data.apifyResult.listing.overall_rating || 'N/A'}`
      )
      console.log(
        `💰 Price: ${result.data.apifyResult.listing.price_per_night || 'N/A'}${result.data.apifyResult.listing.currency || ''}`
      )
      console.log(
        `📊 Score: ${result.data.apifyResult.scoring?.totalScore || 'N/A'}/1000`
      )
      console.log('')
      console.log('⚡ PERFORMANCE:')
      console.log('===============')
      console.log(
        `🕒 Scraping Time: ${result.data.processingInfo.scrapingTime}ms`
      )
      console.log(
        `🤖 AI Time: ${result.data.processingInfo.aiAnalysisTime || 'N/A'} (disabled)`
      )
      console.log(`⏱️ Total Time: ${result.data.processingInfo.totalTime}ms`)
      console.log('')
      console.log('✅ SUCCESS: Basic Apify API is working!')
      return true
    } else {
      console.error('❌ API returned error:', result.error)
      return false
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔬 BASIC APIFY API TEST')
  console.log('=======================')
  console.log(`📅 ${new Date().toLocaleString('de-DE')}`)
  console.log('')

  const success = await testBasicApifyAPI()

  console.log('')
  console.log('🏁 TEST COMPLETED')
  console.log('================')
  console.log(`✅ Success: ${success}`)

  if (success) {
    console.log('🎉 Basic Apify integration working correctly!')
    console.log('🔧 Issue is likely in AI integration layer')
  } else {
    console.log('❌ Basic Apify API has issues')
  }

  process.exit(success ? 0 : 1)
}

main().catch(console.error)
