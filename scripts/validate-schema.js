/**
 * @file validate-schema.js
 * @description Validate database schema creation
 * @created 2025-07-20
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function validateSchema() {
  try {
    console.log('🔍 Validating database schema...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Test direct table access instead of information_schema
    const expectedTables = [
      'api_keys',
      'audit_logs',
      'listings',
      'listing_availability',
      'listing_images',
      'listing_reviews',
      'listing_scores',
      'location_competitors',
      'notifications',
      'organization_members',
      'organizations',
      'payments',
      'plan_limits',
      'price_checks',
      'profiles',
      'subscriptions',
      'support_tickets',
      'usage_tracking',
      'waitlist',
    ]

    console.log(
      `\n🎯 Testing table access (${expectedTables.length} expected):`
    )
    let foundTables = []
    let missingTables = []

    // Test each table individually
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          console.log(`   ❌ ${tableName} - ERROR: ${error.message}`)
          missingTables.push(tableName)
        } else {
          console.log(`   ✅ ${tableName}`)
          foundTables.push(tableName)
        }
      } catch (err) {
        console.log(`   ❌ ${tableName} - EXCEPTION: ${err.message}`)
        missingTables.push(tableName)
      }
    }

    // Check table structure for key tables
    console.log('\n🔧 Validating key table structures...')

    // Test profiles table
    const { data: profileCols, error: profileError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .order('column_name')

    if (profileError) {
      console.log('   ❌ profiles table structure check failed')
    } else {
      console.log(`   ✅ profiles table: ${profileCols.length} columns`)
    }

    // Test listings table
    const { data: listingCols, error: listingError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'listings')
      .order('column_name')

    if (listingError) {
      console.log('   ❌ listings table structure check failed')
    } else {
      console.log(`   ✅ listings table: ${listingCols.length} columns`)
    }

    // Test plan_limits data
    const { data: planData, error: planError } = await supabase
      .from('plan_limits')
      .select('plan_type, max_listings')
      .order('plan_type')

    if (planError) {
      console.log('   ❌ plan_limits data check failed')
    } else {
      console.log(`   ✅ plan_limits: ${planData.length} plans configured`)
      planData.forEach((plan) =>
        console.log(`     - ${plan.plan_type}: ${plan.max_listings} listings`)
      )
    }

    // Summary
    console.log('\n📈 VALIDATION SUMMARY:')
    console.log(
      `   Tables Created: ${foundTables.length}/${expectedTables.length}`
    )
    console.log(`   Missing Tables: ${missingTables.length}`)

    if (missingTables.length > 0) {
      console.log('   Missing:', missingTables.join(', '))
    }

    const success = missingTables.length === 0
    console.log(
      `\n🎯 Overall Status: ${success ? '✅ SUCCESS' : '❌ INCOMPLETE'}`
    )

    return success
  } catch (error) {
    console.error('💥 Validation failed:', error)
    return false
  }
}

validateSchema().then((success) => {
  process.exit(success ? 0 : 1)
})
