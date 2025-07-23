/**
 * @file lib/services/freemium/FreemiumDataService.ts
 * @description Service for handling freemium data operations
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-09: Extracted from app/api/freemium/ai-insights/[token]/route.ts for CLAUDE.md compliance
 */

import { supabaseAdmin } from '@/lib/supabase'

export interface FreemiumListingData {
  id: string
  user_id: string
  airbnb_id?: string
  raw_scraped_data: any
  created_at: string
  [key: string]: any
}

export class FreemiumDataService {
  /**
   * Load listing data from database using freemium token with multiple fallback mechanisms
   */
  static async getListingByToken(
    token: string
  ): Promise<FreemiumListingData | null> {
    console.log('[FreemiumAI] Loading listing data from database...')

    // Use robust query approach with fallback mechanisms
    let listingData: FreemiumListingData | null = null
    let dbError: any = null

    try {
      // Try with ->> operator for text extraction from JSONB
      const { data: data1, error: error1 } = await supabaseAdmin
        .from('listings')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .eq('raw_scraped_data->>freemium_token', token)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error1 && data1 && data1.length > 0) {
        listingData = data1[0]
        console.log(
          '[FreemiumAI] ✅ Found data using ->> operator:',
          listingData?.id
        )
        return listingData
      }

      console.log('[FreemiumAI] Approach 1 failed:', error1?.message)

      // Fallback: search in airbnb_id field
      const { data: data2, error: error2 } = await supabaseAdmin
        .from('listings')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .like('airbnb_id', `%${token}%`)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error2 && data2 && data2.length > 0) {
        listingData = data2[0]
        console.log(
          '[FreemiumAI] ✅ Found data using airbnb_id fallback:',
          listingData?.id
        )
        return listingData
      }

      console.log('[FreemiumAI] Approach 2 failed:', error2?.message)

      // Final fallback: Get all freemium records and filter in memory
      const { data: data3, error: error3 } = await supabaseAdmin
        .from('listings')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error3 && data3 && data3.length > 0) {
        console.log(
          '[FreemiumAI] Found',
          data3.length,
          'freemium records, filtering by token...'
        )

        const matchingListing = data3.find((listing) => {
          try {
            const rawData = listing.raw_scraped_data
            if (
              typeof rawData === 'object' &&
              rawData &&
              rawData.freemium_token === token
            ) {
              return true
            }
            if (typeof rawData === 'string') {
              const parsed = JSON.parse(rawData)
              return parsed && parsed.freemium_token === token
            }
            // Check airbnb_id as well
            if (listing.airbnb_id && listing.airbnb_id.includes(token)) {
              return true
            }
          } catch (e) {
            console.log(
              '[FreemiumAI] Error parsing raw_scraped_data for listing:',
              listing.id
            )
          }
          return false
        })

        if (matchingListing) {
          console.log(
            '[FreemiumAI] ✅ Found data using memory filtering:',
            matchingListing.id
          )
          return matchingListing
        }

        console.log(
          '[FreemiumAI] No matching token found in',
          data3.length,
          'records'
        )
      }

      dbError = error1 || error2 || error3
    } catch (err) {
      console.log('[FreemiumAI] Database query error:', err)
      dbError = err
    }

    if (dbError) {
      throw dbError
    }

    return null
  }

  /**
   * Cache AI insights to database for performance
   */
  static async cacheAIInsights(
    token: string,
    insights: any,
    model: string = 'gemini-1.5-flash'
  ): Promise<void> {
    try {
      const { error: saveError } = await supabaseAdmin
        .from('freemium_ai_insights')
        .upsert({
          token,
          insights,
          created_at: new Date().toISOString(),
          metadata: {
            freemium_token: token,
            model,
            language: 'de',
            cost_eur: 0.0015,
          },
        })

      if (saveError) {
        console.warn('[FreemiumAI] Failed to cache AI insights:', saveError)
      } else {
        console.log('[FreemiumAI] ✅ AI insights successfully cached to DB')
      }
    } catch (cacheError) {
      console.warn('[FreemiumAI] Cache save error (non-critical):', cacheError)
    }
  }
}
