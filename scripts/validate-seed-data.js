/**
 * @file validate-seed-data.js
 * @description Validate seed data was created successfully
 * @created 2025-07-20
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function validateSeedData() {
  try {
    console.log('🌱 Validating seed data...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const validations = []

    // Test 1: User profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')

    if (profileError) {
      validations.push(`❌ Profiles: ${profileError.message}`)
    } else {
      validations.push(`✅ Profiles: ${profiles.length} users created`)
    }

    // Test 2: Organizations
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')

    if (orgError) {
      validations.push(`❌ Organizations: ${orgError.message}`)
    } else {
      validations.push(`✅ Organizations: ${orgs.length} organizations created`)
    }

    // Test 3: Listings
    const { data: listings, error: listingError } = await supabase
      .from('listings')
      .select('*')

    if (listingError) {
      validations.push(`❌ Listings: ${listingError.message}`)
    } else {
      validations.push(`✅ Listings: ${listings.length} listings created`)
      listings.forEach((listing) => {
        validations.push(`   📍 ${listing.location}: ${listing.title}`)
      })
    }

    // Test 4: Reviews
    const { data: reviews, error: reviewError } = await supabase
      .from('listing_reviews')
      .select('*')

    if (reviewError) {
      validations.push(`❌ Reviews: ${reviewError.message}`)
    } else {
      validations.push(`✅ Reviews: ${reviews.length} reviews created`)
    }

    // Test 5: Scores
    const { data: scores, error: scoreError } = await supabase
      .from('listing_scores')
      .select('*')

    if (scoreError) {
      validations.push(`❌ Scores: ${scoreError.message}`)
    } else {
      validations.push(`✅ Scores: ${scores.length} AI analyses created`)
      scores.forEach((score) => {
        validations.push(
          `   🎯 Listing ${score.listing_id.substring(0, 8)}: Score ${score.overall_score}/100`
        )
      })
    }

    // Test 6: Notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')

    if (notifError) {
      validations.push(`❌ Notifications: ${notifError.message}`)
    } else {
      validations.push(
        `✅ Notifications: ${notifications.length} notifications created`
      )
    }

    // Test 7: Subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')

    if (subError) {
      validations.push(`❌ Subscriptions: ${subError.message}`)
    } else {
      validations.push(
        `✅ Subscriptions: ${subscriptions.length} subscriptions created`
      )
    }

    // Display results
    console.log('\n📊 SEED DATA VALIDATION:')
    validations.forEach((validation) => console.log(`   ${validation}`))

    // Check for successful completion
    const hasErrors = validations.some((v) => v.includes('❌'))

    console.log(
      `\n🎯 Overall Status: ${hasErrors ? '❌ ERRORS FOUND' : '✅ SEED DATA COMPLETE'}`
    )

    if (!hasErrors) {
      console.log('\n🚀 Ready for application testing!')
      console.log('   - Login with test@listingboost.com')
      console.log('   - View sample listings in dashboard')
      console.log('   - Test AI scoring functionality')
    }

    return !hasErrors
  } catch (error) {
    console.error('💥 Seed data validation failed:', error)
    return false
  }
}

validateSeedData().then((success) => {
  process.exit(success ? 0 : 1)
})
