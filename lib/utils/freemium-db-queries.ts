/**
 * @file lib/utils/freemium-db-queries.ts
 * @description Database query utilities for freemium dashboard
 * @created 2025-07-22
 * @todo Extracted from route.ts for CLAUDE.md compliance
 */

import { supabaseAdmin } from '@/lib/supabase'

/**
 * Query freemium data from database using multiple approaches
 */
export async function queryFreemiumData(token: string) {
  console.log('[DB] Searching for freemium token in listings table:', token)

  // First, let's check how many freemium records we have total
  const { count } = await supabaseAdmin
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', '00000000-0000-0000-0000-000000000000')

  console.log('[DB] Total freemium records in database:', count)

  // Try multiple query approaches for robustness
  let listings: any = null
  let error: any = null

  try {
    // Approach 1: Try JSONB query with proper casting
    const { data: data1, error: error1 } = await supabaseAdmin
      .from('listings')
      .select(
        `
        id,
        airbnb_url,
        title,
        description,
        property_type,
        room_type,
        person_capacity,
        bedroom_count,
        bed_count,
        bathroom_count,
        price_per_night,
        price_qualifier,
        currency,
        images,
        amenities,
        overall_rating,
        rating_accuracy,
        rating_cleanliness,
        rating_location,
        rating_value,
        reviews_count,
        host_name,
        host_is_superhost,
        host_profile_image,
        host_response_rate,
        host_response_time,
        raw_scraped_data,
        last_scraped_at
      `
      )
      .eq('user_id', '00000000-0000-0000-0000-000000000000')
      .eq('raw_scraped_data->>freemium_token', token) // Use ->> for text extraction
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!error1 && data1) {
      console.log('[DB] ✅ Found data using ->> operator:', data1.id)
      listings = data1
      error = null
    } else {
      console.log('[DB] Approach 1 failed:', error1?.message)

      // Approach 2: Try with airbnb_id fallback (if token used as airbnb_id)
      const { data: data2, error: error2 } = await supabaseAdmin
        .from('listings')
        .select(
          `
          id,
          airbnb_url,
          title,
          description,
          property_type,
          room_type,
          person_capacity,
          bedroom_count,
          bed_count,
          bathroom_count,
          price_per_night,
          price_qualifier,
          currency,
          images,
          amenities,
          overall_rating,
          rating_accuracy,
          rating_cleanliness,
          rating_location,
          rating_value,
          reviews_count,
          host_name,
          host_is_superhost,
          host_profile_image,
          host_response_rate,
          host_response_time,
          raw_scraped_data,
          last_scraped_at
        `
        )
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .like('airbnb_id', `%${token}%`) // Search in airbnb_id field too
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!error2 && data2) {
        console.log('[DB] ✅ Found data using airbnb_id fallback:', data2.id)
        listings = data2
        error = null
      } else {
        console.log('[DB] Approach 2 failed:', error2?.message)

        // Approach 3: Try to get all freemium records and filter in memory
        const { data: data3, error: error3 } = await supabaseAdmin
          .from('listings')
          .select(
            `
            id,
            airbnb_url,
            title,
            description,
            property_type,
            room_type,
            person_capacity,
            bedroom_count,
            bed_count,
            bathroom_count,
            price_per_night,
            price_qualifier,
            currency,
            images,
            amenities,
            overall_rating,
            rating_accuracy,
            rating_cleanliness,
            rating_location,
            rating_value,
            reviews_count,
            host_name,
            host_is_superhost,
            host_profile_image,
            host_response_rate,
            host_response_time,
            raw_scraped_data,
            last_scraped_at
          `
          )
          .eq('user_id', '00000000-0000-0000-0000-000000000000')
          .order('created_at', { ascending: false })
          .limit(10) // Get last 10 freemium records

        if (!error3 && data3 && data3.length > 0) {
          console.log(
            '[DB] Found',
            data3.length,
            'freemium records, filtering by token...'
          )

          // Filter in memory by checking raw_scraped_data
          const matchingListing = data3.find((listing: any) => {
            try {
              const rawData = listing.raw_scraped_data
              console.log(
                '[DB] Checking listing:',
                listing.id,
                'rawData type:',
                typeof rawData,
                'token:',
                token
              )

              if (
                typeof rawData === 'object' &&
                rawData &&
                rawData.freemium_token === token
              ) {
                console.log('[DB] ✅ Match found in object format!')
                return true
              }
              if (typeof rawData === 'string') {
                const parsed = JSON.parse(rawData)
                console.log('[DB] Parsed string data:', parsed?.freemium_token)
                if (parsed && parsed.freemium_token === token) {
                  console.log('[DB] ✅ Match found in string format!')
                  return true
                }
              }

              // Also check if token is in airbnb_id as fallback
              if (listing.airbnb_id && listing.airbnb_id.includes(token)) {
                console.log('[DB] ✅ Match found in airbnb_id!')
                return true
              }
            } catch (e) {
              console.log(
                '[DB] Error parsing raw_scraped_data for listing:',
                listing.id,
                (e as Error).message
              )
            }
            return false
          })

          if (matchingListing) {
            console.log(
              '[DB] ✅ Found data using memory filtering:',
              matchingListing.id
            )
            listings = matchingListing
            error = null
          } else {
            console.log(
              '[DB] No matching token found in',
              data3.length,
              'records'
            )
            error = error1 || error2 || error3
          }
        } else {
          console.log('[DB] Approach 3 failed:', error3?.message)
          error = error1 || error2 || error3
        }
      }
    }
  } catch (dbError) {
    console.log('[DB] Unexpected database error:', dbError)
    error = dbError
  }

  return { listings, error }
}
