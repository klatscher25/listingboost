/**
 * @file lib/services/freemium/database.ts
 * @description Database operations for freemium analysis data
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from api/freemium/analyze/route.ts for CLAUDE.md compliance
 */

import { supabaseAdmin } from '@/lib/supabase'
import { logInfo, logApiError } from '@/lib/utils/logger'
import type { ListingsTable } from '@/types/database'
import type { AirbnbListingData } from '@/lib/services/apify/types'
import type {
  EnhancedFakeData,
  FreemiumAnalysisResult,
} from '@/lib/types/freemium-api-types'

/**
 * Speichert Freemium Analysis Daten in der listings Tabelle
 * Für spätere Wiederverwendung in Premium Features
 */
export async function saveFreemiumDataToDB(
  listing: AirbnbListingData | EnhancedFakeData,
  analysis: FreemiumAnalysisResult,
  token: string,
  url: string,
  isRealData: boolean
): Promise<string | null> {
  try {
    // Bereite Daten für DB vor
    const listingInsert: ListingsTable['Insert'] = {
      user_id: '00000000-0000-0000-0000-000000000000', // Special UUID for freemium users
      airbnb_id: listing.id || 'freemium_' + token,
      airbnb_url: url,
      title: listing.title,
      description: listing.description,
      property_type: listing.propertyType,
      room_type: listing.roomType,
      person_capacity: listing.personCapacity,
      bedroom_count: listing.bedrooms || null,
      bed_count: listing.beds || null,
      bathroom_count: listing.baths || null,
      price_per_night: listing.price ? parseFloat(listing.price.amount) : null,
      price_qualifier: listing.price?.qualifier || null,
      currency: 'EUR',
      images: listing.images || null,
      images_count: listing.images?.length || null,
      amenities: listing.amenities || null,
      overall_rating: listing.rating?.guestSatisfaction || null,
      rating_accuracy: listing.rating?.accuracy || null,
      rating_cleanliness: listing.rating?.cleanliness || null,
      rating_location: listing.rating?.location || null,
      rating_value: listing.rating?.value || null,
      reviews_count: listing.rating?.reviewsCount || null,
      host_id: listing.host?.id || null,
      host_name: listing.host?.name || null,
      host_is_superhost: listing.host?.isSuperHost || null,
      host_profile_image: listing.host?.profileImage || null,
      host_response_rate: listing.host?.responseRate || null,
      host_response_time: listing.host?.responseTime || null,
      analysis_status: 'completed',
      // Speichere freemium metadata in raw_scraped_data
      raw_scraped_data: {
        freemium_token: token,
        analysis_data: analysis,
        is_real_data: isRealData,
        scraped_at: new Date().toISOString(),
        source: 'freemium',
      } as any,
      last_scraped_at: new Date().toISOString(),
    }

    console.log('[DB] Saving freemium data to listings table with UPSERT...')
    console.log('[DB] Token being saved:', token)
    console.log(
      '[DB] Raw scraped data structure:',
      JSON.stringify(listingInsert.raw_scraped_data, null, 2)
    )

    // Use UPSERT to handle duplicate airbnb_id conflicts
    const { data, error } = await supabaseAdmin
      .from('listings')
      .upsert(listingInsert, {
        onConflict: 'airbnb_id',
        ignoreDuplicates: false,
      })
      .select('id, airbnb_id, raw_scraped_data')
      .single()

    if (error) {
      console.error('[DB] Error saving freemium data:', error)
      console.error('[DB] Error details:', JSON.stringify(error, null, 2))
      logApiError('[FreemiumAPI] DB save failed', error)
      return null
    }

    console.log('[DB] ✅ Freemium data saved with ID:', data.id)
    console.log('[DB] Saved airbnb_id:', data.airbnb_id)
    console.log(
      '[DB] Saved freemium_token:',
      data.raw_scraped_data?.freemium_token
    )
    logInfo(`[FreemiumAPI] Freemium data saved to DB: ${data.id}`)
    return data.id
  } catch (error) {
    console.error('[DB] Unexpected error saving freemium data:', error)
    logApiError('[FreemiumAPI] DB save unexpected error', error)
    return null
  }
}
