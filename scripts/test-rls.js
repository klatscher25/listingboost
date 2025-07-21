/**
 * @file test-rls.js
 * @description Test Row Level Security policies
 * @created 2025-07-20
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testRLS() {
  try {
    console.log('🔒 Testing Row Level Security...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY // Use anon key to test RLS
    )

    // Test 1: Unauthenticated access should be blocked
    console.log('\n1️⃣ Testing unauthenticated access...')
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profileError) {
      console.log('   ✅ Profiles blocked for unauthenticated users')
    } else {
      console.log(
        '   ❌ Profiles accessible without auth - RLS may not be working'
      )
    }

    const { data: listings, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .limit(1)

    if (listingError) {
      console.log('   ✅ Listings blocked for unauthenticated users')
    } else {
      console.log(
        '   ❌ Listings accessible without auth - RLS may not be working'
      )
    }

    // Test 2: Public tables should be accessible
    console.log('\n2️⃣ Testing public table access...')
    const { data: planLimits, error: planError } = await supabase
      .from('plan_limits')
      .select('*')

    if (planError) {
      console.log('   ❌ Plan limits not accessible - should be public')
    } else {
      console.log(`   ✅ Plan limits accessible: ${planLimits.length} plans`)
    }

    const { data: competitors, error: compError } = await supabase
      .from('location_competitors')
      .select('*')
      .limit(1)

    if (compError) {
      console.log(
        '   ❌ Location competitors not accessible - should be public'
      )
    } else {
      console.log('   ✅ Location competitors accessible')
    }

    // Test 3: Check if RLS is enabled on key tables
    console.log('\n3️⃣ Checking RLS status...')

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Query pg_class to check RLS status
    const { data: rlsStatus, error: rlsError } =
      await adminSupabase.rpc('check_rls_status')

    if (rlsError) {
      console.log('   ⚠️ Could not check RLS status directly')
      console.log(
        '   ℹ️ Manual check: Go to Supabase Dashboard → Authentication → Policies'
      )
    } else {
      console.log('   ✅ RLS status checked')
    }

    console.log('\n📊 RLS TEST SUMMARY:')
    console.log('   - Protected tables should block unauthenticated access')
    console.log('   - Public tables should allow read access')
    console.log('   - Authenticated users need proper policies for data access')

    console.log('\n⚠️  MANUAL VERIFICATION NEEDED:')
    console.log('   1. Execute the RLS migration in Supabase Dashboard')
    console.log('   2. Test authenticated user scenarios')
    console.log('   3. Verify organization-level access controls')

    return true
  } catch (error) {
    console.error('💥 RLS test failed:', error)
    return false
  }
}

testRLS().then((success) => {
  process.exit(success ? 0 : 1)
})
