/**
 * @file test_api_direct_simple.js
 * @description Simple direct API test with basic Apify service
 * @created 2025-07-21
 */

require('dotenv').config({ path: '.env.local' })

/**
 * Test the basic Apify service directly without enhanced analysis
 */
async function testBasicApifyService() {
  console.log('🧪 DIRECT APIFY SERVICE TEST')
  console.log('============================')

  try {
    // Import the Apify service directly
    const { apifyService } = await import('./lib/services/apify/index.ts')

    console.log('✅ Apify service imported successfully')

    // Test URL
    const testUrl = 'https://www.airbnb.de/rooms/29732182'
    const testUserId = '00000000-0000-0000-0000-000000000003'

    console.log('🚀 Starting basic listing analysis...')
    console.log(`📋 URL: ${testUrl}`)
    console.log(`👤 User: ${testUserId}`)

    const startTime = Date.now()

    // Call the analyzeListing method directly
    const result = await apifyService.analyzeListing(testUrl, testUserId, {
      includeReviews: false, // Keep it simple
      includeAvailability: false, // Keep it simple
      includeCompetitors: false, // Keep it simple
      forceUpdate: true,
    })

    const duration = Date.now() - startTime

    console.log('🎉 Analysis completed successfully!')
    console.log(`⏱️ Duration: ${duration}ms`)
    console.log('')
    console.log('📊 RESULTS:')
    console.log('===========')
    console.log(`📋 Listing ID: ${result.listing.id}`)
    console.log(`📝 Title: ${result.listing.title || 'N/A'}`)
    console.log(`⭐ Rating: ${result.listing.overall_rating || 'N/A'}`)
    console.log(
      `💰 Price: ${result.listing.price_per_night || 'N/A'}${result.listing.currency || ''}`
    )
    console.log(`📊 Score: ${result.scoring?.totalScore || 'N/A'}/1000`)
    console.log(`🎯 Level: ${result.scoring?.performanceLevel || 'N/A'}`)
    console.log('')
    console.log('✅ SUCCESS: Direct Apify service is working correctly!')

    return true
  } catch (error) {
    console.error('❌ FAILED:', error.message)
    console.error('Error details:', error)
    return false
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔬 DIRECT APIFY SERVICE TEST')
  console.log('===========================')
  console.log(`📅 ${new Date().toLocaleString('de-DE')}`)
  console.log('')

  const success = await testBasicApifyService()

  console.log('')
  console.log('🏁 TEST COMPLETED')
  console.log('================')
  console.log(`✅ Success: ${success}`)

  if (success) {
    console.log('🎉 Basic Apify integration is working!')
    console.log('🔧 Issue is likely in Enhanced Analysis Service layer')
  } else {
    console.log('❌ Basic Apify service has issues')
  }

  process.exit(success ? 0 : 1)
}

main().catch(console.error)
