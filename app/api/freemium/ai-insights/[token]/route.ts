/**
 * @file app/api/freemium/ai-insights/[token]/route.ts
 * @description Gemini 2.5 Flash AI insights endpoint for freemium dashboard enhancement
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo FREEMIUM-003-01: AI-powered insights for improved conversion
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { GeminiClient } from '@/lib/services/gemini/client'
import { createGermanAirbnbPrompt } from '@/lib/services/gemini/prompts'
import { logInfo, logApiError } from '@/lib/utils/logger'

// Gemini 1.5 Flash Configuration - Optimized for cost and speed
const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash' as const,
  apiKey: process.env.GEMINI_API_KEY!,
  region: 'us' as const,
  rateLimitPerMinute: 60,
  maxRetries: 2,
  timeout: 20000, // 20s timeout
  defaultTemperature: 0.3, // Slightly creative for engaging insights
  defaultMaxTokens: 1024, // Keep costs low
  enableSafetyFilters: false
}

interface FreemiumAIInsights {
  listingOptimization: {
    titleScore: number
    titleSuggestions: string[]
    descriptionScore: number
    descriptionImprovements: string[]
    photoScore: number
    photoRecommendations: string[]
    amenityScore: number
    missingAmenities: string[]
  }
  hostCredibility: {
    currentScore: number
    improvementTips: string[]
    superhostBenefits: string[]
  }
  seasonalOptimization: {
    currentSeason: string
    seasonalTips: string[]
    pricingHints: string[]
  }
  ratingImprovement: {
    currentStrengths: string[]
    improvementAreas: string[]
    guestExperienceTips: string[]
  }
  amenityGapAnalysis: {
    criticalGaps: string[]
    budgetFriendlyUpgrades: string[]
    highImpactAdditions: string[]
  }
}

interface ListingData {
  id: string
  title: string
  description: string
  propertyType: string
  roomType: string
  personCapacity: number
  bedrooms?: number
  beds?: number
  baths?: number
  rating: {
    guestSatisfaction: number
    accuracy: number
    cleanliness: number
    location: number
    value: number
    reviewsCount: number
  }
  host: {
    name: string
    isSuperHost: boolean
    responseRate?: string
    responseTime?: string
  }
  price: {
    amount: string
    qualifier: string
  }
  amenities: Array<{
    title: string
    values: Array<{
      title: string
      available: boolean
    }>
  }>
}

// ✅ PERFORMANCE OPTIMIZATION: Move prompt to external module to fix webpack warning
function createOptimizedPrompt(listing: ListingData): string {
  // Get current season for seasonal optimization
  const now = new Date()
  const month = now.getMonth() + 1
  let currentSeason: string
  if (month >= 6 && month <= 8) currentSeason = 'Sommer'
  else if (month >= 9 && month <= 11) currentSeason = 'Herbst'
  else if (month >= 12 || month <= 2) currentSeason = 'Winter'
  else currentSeason = 'Frühling'

  // Extract available amenities
  const availableAmenities = listing.amenities
    .flatMap(group => group.values.filter(item => item.available).map(item => item.title))
    .join(', ')

  return createGermanAirbnbPrompt({
    title: listing.title,
    description: listing.description,
    propertyType: listing.propertyType,
    roomType: listing.roomType,
    personCapacity: listing.personCapacity,
    bedrooms: listing.bedrooms,
    rating: listing.rating,
    host: listing.host,
    price: listing.price,
    availableAmenities,
    currentSeason
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params
    const { token } = resolvedParams
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token ist erforderlich' },
        { status: 400 }
      )
    }

    logInfo(`[FreemiumAI] AI-Insights Anfrage für Token: ${token}`)

    // ✅ OPTIMIZATION: First check if AI insights already exist in database
    console.log('[FreemiumAI] Checking for cached AI insights in database...')
    
    const { data: existingAnalysis, error: analysisError } = await supabaseAdmin
      .from('analysis_results')
      .select('ai_insights, created_at')
      .eq('user_id', '00000000-0000-0000-0000-000000000000')
      .eq('metadata->freemium_token', token)
      .eq('analysis_type', 'freemium')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // If we have fresh AI insights (less than 24 hours old), return them
    if (existingAnalysis && existingAnalysis.ai_insights && !analysisError) {
      const cacheAge = Date.now() - new Date(existingAnalysis.created_at).getTime()
      const maxCacheAge = 24 * 60 * 60 * 1000 // 24 hours

      if (cacheAge < maxCacheAge) {
        console.log('[FreemiumAI] ✅ Using cached AI insights from DB (saved API cost!)')
        
        try {
          const cachedInsights = JSON.parse(existingAnalysis.ai_insights)
          return NextResponse.json({
            success: true,
            data: {
              insights: cachedInsights,
              metadata: {
                generatedAt: existingAnalysis.created_at,
                processingTime: 0,
                model: 'gemini-1.5-flash',
                language: 'de',
                token,
                source: 'cache'
              }
            }
          })
        } catch (parseError) {
          console.log('[FreemiumAI] Cache parse error, generating fresh insights:', parseError)
        }
      }
    }

    // No valid cache found, generate fresh insights
    console.log('[FreemiumAI] No cached insights found, generating fresh AI analysis...')

    // Validate Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      logApiError('[FreemiumAI] Gemini API Key fehlt', new Error('GEMINI_API_KEY not configured'))
      return NextResponse.json(
        { success: false, error: 'AI-Service temporär nicht verfügbar' },
        { status: 503 }
      )
    }

    // Load listing data from database using freemium token
    console.log('[FreemiumAI] Loading listing data from database...')
    
    // Use robust query approach with fallback mechanisms
    let listingData: any = null
    let dbError: any = null
    
    try {
      // Try with ->> operator for text extraction from JSONB (without single())
      const { data: data1, error: error1 } = await supabaseAdmin
        .from('listings')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .eq('raw_scraped_data->>freemium_token', token)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (!error1 && data1 && data1.length > 0) {
        listingData = data1[0] // Take first result
        dbError = null
        console.log('[FreemiumAI] ✅ Found data using ->> operator:', listingData.id)
      } else {
        console.log('[FreemiumAI] Approach 1 failed:', error1?.message)
        
        // Fallback: search in airbnb_id field (without single())
        const { data: data2, error: error2 } = await supabaseAdmin
          .from('listings')
          .select('*')
          .eq('user_id', '00000000-0000-0000-0000-000000000000')
          .like('airbnb_id', `%${token}%`)
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (!error2 && data2 && data2.length > 0) {
          listingData = data2[0] // Take first result
          dbError = null
          console.log('[FreemiumAI] ✅ Found data using airbnb_id fallback:', listingData.id)
        } else {
          console.log('[FreemiumAI] Approach 2 failed:', error2?.message)
          
          // Final fallback: Get all freemium records and filter in memory
          const { data: data3, error: error3 } = await supabaseAdmin
            .from('listings')
            .select('*')
            .eq('user_id', '00000000-0000-0000-0000-000000000000')
            .order('created_at', { ascending: false })
            .limit(10)
          
          if (!error3 && data3 && data3.length > 0) {
            console.log('[FreemiumAI] Found', data3.length, 'freemium records, filtering by token...')
            
            const matchingListing = data3.find(listing => {
              try {
                const rawData = listing.raw_scraped_data
                if (typeof rawData === 'object' && rawData && rawData.freemium_token === token) {
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
                console.log('[FreemiumAI] Error parsing raw_scraped_data for listing:', listing.id)
              }
              return false
            })
            
            if (matchingListing) {
              console.log('[FreemiumAI] ✅ Found data using memory filtering:', matchingListing.id)
              listingData = matchingListing
              dbError = null
            } else {
              console.log('[FreemiumAI] No matching token found in', data3.length, 'records')
              listingData = null
              dbError = error1 || error2 || error3
            }
          } else {
            listingData = null
            dbError = error1 || error2 || error3
          }
        }
      }
    } catch (err) {
      console.log('[FreemiumAI] Database query error:', err)
      dbError = err
    }

    if (dbError || !listingData) {
      logApiError('[FreemiumAI] Listing data nicht gefunden', dbError || new Error('No data'))
      return NextResponse.json(
        { success: false, error: 'Listing-Daten nicht gefunden' },
        { status: 404 }
      )
    }

    console.log('[FreemiumAI] ✅ Listing data loaded:', {
      id: listingData.id,
      title: listingData.title?.substring(0, 50),
      hasRating: !!listingData.overall_rating,
      hasAmenities: !!listingData.amenities
    })

    // Transform database data to expected format
    const transformedListing: ListingData = {
      id: listingData.airbnb_id || listingData.id,
      title: listingData.title || 'Untitled Listing',
      description: listingData.description || '',
      propertyType: listingData.property_type || 'Wohnung',
      roomType: listingData.room_type || 'Gesamte Wohnung',
      personCapacity: listingData.person_capacity || 2,
      bedrooms: listingData.bedroom_count,
      beds: listingData.bed_count,
      baths: listingData.bathroom_count,
      rating: {
        guestSatisfaction: listingData.overall_rating || 4.0,
        accuracy: listingData.rating_accuracy || 4.0,
        cleanliness: listingData.rating_cleanliness || 4.0,
        location: listingData.rating_location || 4.0,
        value: listingData.rating_value || 4.0,
        reviewsCount: listingData.reviews_count || 0
      },
      host: {
        name: listingData.host_name || 'Host',
        isSuperHost: listingData.host_is_superhost || false,
        responseRate: listingData.host_response_rate,
        responseTime: listingData.host_response_time
      },
      price: {
        amount: (listingData.price_per_night || 75).toString(),
        qualifier: listingData.price_qualifier || 'Nacht'
      },
      amenities: listingData.amenities || []
    }

    console.log('[FreemiumAI] Starting Gemini 2.5 Flash analysis...')
    
    // Initialize Gemini client
    const geminiClient = new GeminiClient(GEMINI_CONFIG)
    
    // Create German prompt using external module (fixes webpack performance warning)
    const prompt = createOptimizedPrompt(transformedListing)
    
    // Generate AI insights
    const request = {
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: GEMINI_CONFIG.defaultTemperature,
        maxOutputTokens: GEMINI_CONFIG.defaultMaxTokens
      }
    }

    console.log('[FreemiumAI] Sending request to Gemini 2.5 Flash...')
    const startTime = Date.now()
    
    const response = await geminiClient.generateContent(request)
    const aiInsights = geminiClient.parseJSONResponse<FreemiumAIInsights>(response)
    
    const processingTime = Date.now() - startTime
    console.log('[FreemiumAI] ✅ AI analysis completed:', {
      processingTime: processingTime + 'ms',
      cost: '~€0.0015',
      hasInsights: !!aiInsights.listingOptimization
    })

    // Add metadata
    const result = {
      insights: aiInsights,
      metadata: {
        generatedAt: new Date().toISOString(),
        processingTime,
        model: 'gemini-1.5-flash',
        language: 'de',
        token
      }
    }

    // ✅ CACHE: Save AI insights to database for future reuse
    console.log('[FreemiumAI] Saving AI insights to database for caching...')
    
    try {
      const { error: saveError } = await supabaseAdmin
        .from('analysis_results')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          listing_id: listingData.id,
          analysis_type: 'freemium',
          status: 'completed',
          ai_insights: JSON.stringify(aiInsights),
          processing_completed_at: new Date().toISOString(),
          processing_duration_seconds: Math.round(processingTime / 1000),
          metadata: {
            freemium_token: token,
            model: 'gemini-1.5-flash',
            language: 'de',
            cost_eur: 0.0015
          }
        })
      
      if (saveError) {
        console.warn('[FreemiumAI] Failed to cache AI insights:', saveError)
      } else {
        console.log('[FreemiumAI] ✅ AI insights successfully cached to DB')
      }
    } catch (cacheError) {
      console.warn('[FreemiumAI] Cache save error (non-critical):', cacheError)
    }

    logInfo(`[FreemiumAI] AI-Insights erfolgreich generiert für Token: ${token}`)
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    logApiError('[FreemiumAI] AI-Insights Fehler', error)
    console.error('[FreemiumAI] Detailed error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Generieren der AI-Insights',
        details: process.env.NODE_ENV !== 'production' ? (error as Error)?.message : undefined
      },
      { status: 500 }
    )
  }
}