/**
 * @file test_service_layer_direct.js
 * @description Test the service layer components step by step to find bottleneck
 * @created 2025-07-21
 */

require('dotenv').config({ path: '.env.local' })

/**
 * Test database connection speed
 */
async function testDatabaseConnection() {
  console.log('🗄️ Testing database connection...')
  const startTime = Date.now()

  try {
    // Test simple database query without importing TS modules
    const response = await fetch(
      'https://xebckhqbqjmqtgdqfpfv.supabase.co/rest/v1/',
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    )

    const duration = Date.now() - startTime
    console.log(`✅ Database connection: ${duration}ms (${response.status})`)
    return duration
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `❌ Database connection failed: ${duration}ms - ${error.message}`
    )
    return duration
  }
}

/**
 * Test Apify client creation and basic operation
 */
async function testApifyClientCreation() {
  console.log('🤖 Testing Apify client creation...')
  const startTime = Date.now()

  try {
    // Test basic Apify API call without our client wrapper
    const response = await fetch('https://api.apify.com/v2/acts', {
      headers: {
        Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
      },
    })

    const duration = Date.now() - startTime
    console.log(`✅ Apify API connection: ${duration}ms (${response.status})`)
    return duration
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `❌ Apify API connection failed: ${duration}ms - ${error.message}`
    )
    return duration
  }
}

/**
 * Test data transformation performance
 */
async function testDataTransformation() {
  console.log('🔄 Testing data transformation...')
  const startTime = Date.now()

  try {
    // Simulate the data transformation that happens in our service
    const mockApifyData = {
      id: 29732182,
      title: 'Guest room in the heart of Berlin',
      rating: { guestSatisfaction: 4.9 },
      price: { amount: '50', currency: 'EUR' },
      host: { name: 'Jens', isSuperhost: false },
      amenities: [
        { category: 'Kitchen', items: ['Refrigerator', 'Microwave'] },
        { category: 'Bathroom', items: ['Hair dryer', 'Shampoo'] },
      ],
      coordinates: { latitude: 52.52, longitude: 13.405 },
      images: ['url1', 'url2', 'url3'],
    }

    // Simulate transformation to database format
    const transformed = {
      airbnb_id: mockApifyData.id.toString(),
      title: mockApifyData.title,
      overall_rating: mockApifyData.rating?.guestSatisfaction,
      price_per_night: parseFloat(mockApifyData.price?.amount || '0'),
      currency: mockApifyData.price?.currency,
      host_name: mockApifyData.host?.name,
      host_is_superhost: mockApifyData.host?.isSuperhost || false,
      images_count: mockApifyData.images?.length || 0,
      amenities_count: mockApifyData.amenities?.length || 0,
      latitude: mockApifyData.coordinates?.latitude,
      longitude: mockApifyData.coordinates?.longitude,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Simulate scoring calculation
    let score = 0
    score += (transformed.overall_rating || 0) * 100 // Rating: 0-500 points
    score += Math.min(transformed.images_count || 0, 20) * 10 // Images: 0-200 points
    score += (transformed.amenities_count || 0) * 5 // Amenities: 0-100+ points
    score += transformed.host_is_superhost ? 100 : 0 // Superhost: 100 points

    const finalScore = Math.min(score, 1000) // Cap at 1000

    const duration = Date.now() - startTime
    console.log(`✅ Data transformation: ${duration}ms`)
    console.log(`   • Transformed fields: ${Object.keys(transformed).length}`)
    console.log(`   • Calculated score: ${finalScore}/1000`)
    return duration
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `❌ Data transformation failed: ${duration}ms - ${error.message}`
    )
    return duration
  }
}

/**
 * Test the actual service method call (if possible)
 */
async function testServiceMethodCall() {
  console.log('🔧 Testing service method call simulation...')
  const startTime = Date.now()

  try {
    // Simulate the entire service flow without actually calling it
    const steps = [
      { name: 'Extract URL ID', duration: 1 },
      { name: 'Check existing listing', duration: 50 },
      { name: 'Call Apify scraper', duration: 12000 }, // We know this takes ~12s
      { name: 'Transform data', duration: 10 },
      { name: 'Save to database', duration: 100 },
      { name: 'Calculate scoring', duration: 50 },
      { name: 'Format response', duration: 5 },
    ]

    let totalDuration = 0
    for (const step of steps) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(step.duration, 100))
      ) // Simulate but cap wait
      totalDuration += step.duration
      console.log(`   ✓ ${step.name}: ${step.duration}ms`)
    }

    const actualDuration = Date.now() - startTime
    console.log(
      `✅ Service method simulation: ${actualDuration}ms (estimated: ${totalDuration}ms)`
    )
    return actualDuration
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `❌ Service method simulation failed: ${duration}ms - ${error.message}`
    )
    return duration
  }
}

/**
 * Main execution with performance breakdown
 */
async function main() {
  console.log('🔬 SERVICE LAYER PERFORMANCE ANALYSIS')
  console.log('=====================================')
  console.log(`📅 ${new Date().toLocaleString('de-DE')}`)
  console.log('')

  const results = {}
  const startTime = Date.now()

  results.database = await testDatabaseConnection()
  console.log('')

  results.apifyClient = await testApifyClientCreation()
  console.log('')

  results.transformation = await testDataTransformation()
  console.log('')

  results.serviceMethod = await testServiceMethodCall()

  const totalTime = Date.now() - startTime

  console.log('')
  console.log('🏁 PERFORMANCE ANALYSIS RESULTS')
  console.log('===============================')
  console.log(`⏱️ Total Test Duration: ${totalTime}ms`)
  console.log('')
  console.log('📊 Component Performance:')
  console.log(`   🗄️ Database Connection: ${results.database}ms`)
  console.log(`   🤖 Apify API Connection: ${results.apifyClient}ms`)
  console.log(`   🔄 Data Transformation: ${results.transformation}ms`)
  console.log(`   🔧 Service Method (sim): ${results.serviceMethod}ms`)
  console.log('')

  // Analysis
  const infraTime = results.database + results.apifyClient
  const processingTime = results.transformation + results.serviceMethod

  console.log('💡 PERFORMANCE BREAKDOWN:')
  console.log(`   📡 Infrastructure (DB+API): ${infraTime}ms`)
  console.log(`   ⚙️ Processing (Transform+Service): ${processingTime}ms`)
  console.log('')

  console.log('🎯 CONCLUSION:')
  if (infraTime > 1000) {
    console.log('   ❌ Infrastructure is slow - check network/database')
  } else if (processingTime > 5000) {
    console.log('   ❌ Processing is slow - check service logic')
  } else {
    console.log('   ✅ Individual components are fast')
    console.log(
      '   🔍 Issue likely in service coordination or TypeScript compilation'
    )
  }

  console.log('')
  console.log('🔧 NEXT DEBUGGING STEPS:')
  console.log('   1. Test actual quickAnalyze method with console.time()')
  console.log('   2. Check if database operations are blocking')
  console.log('   3. Verify TypeScript/ES module import performance')

  process.exit(0)
}

main().catch(console.error)
