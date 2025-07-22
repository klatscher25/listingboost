/**
 * @file app/api/freemium/dashboard/[token]/route.ts
 * @description Freemium Dashboard API - lädt Daten aus DB (nicht Scraper)
 * @created 2025-07-21
 * @todo Freemium Dashboard DB loader
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { logInfo, logApiError } from '@/lib/utils/logger'

/**
 * Clean up amenities by translating SYSTEM_ prefixes to proper German labels and icons
 */
function cleanupAmenities(amenities: any): any {
  if (!amenities || !Array.isArray(amenities)) {
    return amenities
  }

  // German translations for amenity labels - SINGLE SOURCE OF TRUTH (frontend no longer has translations)
  const AMENITY_TRANSLATIONS: { [key: string]: string } = {
    // System keys (SYSTEM_ prefix fixes)
    'SYSTEM_BATHTUB': 'Badewanne',
    'SYSTEM_HAIRDRYER': 'Föhn', 
    'SYSTEM_SHAMPOO': 'Shampoo',
    'SYSTEM_HOT_WATER': 'Warmwasser',
    'SYSTEM_TOILETRIES': 'Hygieneartikel',
    'SYSTEM_HANGERS': 'Kleiderbügel',
    'SYSTEM_BLANKETS': 'Bettwäsche',
    'SYSTEM_IRON': 'Bügeleisen',
    'SYSTEM_WIFI': 'WLAN',
    'SYSTEM_KITCHEN': 'Küche',
    'SYSTEM_WASHER': 'Waschmaschine',
    'SYSTEM_AC': 'Klimaanlage',
    'SYSTEM_TV': 'Fernseher',
    'SYSTEM_HEATING': 'Heizung',
    'SYSTEM_BALCONY': 'Balkon',
    'SYSTEM_PARKING': 'Parkplatz',
    'SYSTEM_WORKSPACE': 'Arbeitsplatz',
    'SYSTEM_FLOWER': 'Blumenschmuck',
    'SYSTEM_CLEANING_SUPPLIES': 'Reinigungsprodukte',
    // English amenity names
    'Bathtub': 'Badewanne',
    'Hair dryer': 'Föhn',
    'Shampoo': 'Shampoo',
    'Hot water': 'Warmwasser',
    'Essentials': 'Hygieneartikel'
  }

  // Icon mappings for proper emoji display
  const ICON_MAPPINGS: { [key: string]: string } = {
    // Laundry & Bedroom
    'SYSTEM_WASHER': '🔄',
    'SYSTEM_DRYER': '🌪️', 
    'SYSTEM_NO_DRYER': '❌',
    'SYSTEM_BLANKETS': '🛏️',
    'SYSTEM_HANGERS': '👔',
    'SYSTEM_IRON': '👕',
    
    // Electronics & Entertainment
    'SYSTEM_TV': '📺',
    'SYSTEM_WI_FI': '📶',
    'SYSTEM_WIFI': '📶',
    'SYSTEM_WORKSPACE': '💻',
    
    // Kitchen & Dining
    'SYSTEM_KITCHEN': '🍳',
    'SYSTEM_COOKING_BASICS': '🍳',
    
    // Climate & Comfort
    'SYSTEM_AC': '❄️',
    'SYSTEM_NO_AIR_CONDITIONING': '❌',
    'SYSTEM_HEATING': '🔥',
    'SYSTEM_NO_HEATER': '❌',
    'SYSTEM_HOT_WATER': '🚿',
    'SYSTEM_NO_HOT_WATER': '❌',
    
    // Safety & Security
    'SYSTEM_DETECTOR_SMOKE': '🚨',
    'SYSTEM_NO_DETECTOR_CO2': '❌',
    'SYSTEM_NO_SURVEILLANCE': '❌',
    
    // Parking & Access
    'SYSTEM_MAPS_CAR_RENTAL': '🚗',
    'SYSTEM_PARKING': '🅿️',
    
    // Services
    'SYSTEM_HOST_OWNERS': '🤝',
    'SYSTEM_NO_ESSENTIALS': '❌',
    
    // Bathroom
    'SYSTEM_BATHTUB': '🛁',
    'SYSTEM_HAIRDRYER': '💨',
    'SYSTEM_SHAMPOO': '🧴',
    'SYSTEM_TOILETRIES': '🧼'
  }
  
  return amenities.map((amenityGroup: any) => ({
    ...amenityGroup,
    values: amenityGroup.values?.map((amenity: any) => ({
      ...amenity,
      // Use German translation if available, otherwise remove SYSTEM_ prefix
      title: AMENITY_TRANSLATIONS[amenity.title] || amenity.title?.replace(/^SYSTEM_/, '') || amenity.title,
      // Map SYSTEM_ icon codes to proper emojis
      icon: ICON_MAPPINGS[amenity.icon] || (amenity.icon?.startsWith('SYSTEM_') ? '✨' : amenity.icon) || '✨'
    })) || []
  }))
}

interface FreemiumDashboardData {
  listing: any
  analysis: any
  recommendations: string[]
  isRealData: boolean
  dbId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  logInfo('[FreemiumDashboard] Loading data from DB for token')
  
  try {
    const resolvedParams = await params
    const token = resolvedParams.token
    
    if (!token || !token.startsWith('freemium_')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid freemium token format'
        },
        { status: 400 }
      )
    }
    
    // Suche in der listings Tabelle nach dem freemium_token
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
        .select(`
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
        `)
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
          .select(`
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
          `)
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
            .select(`
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
            `)
            .eq('user_id', '00000000-0000-0000-0000-000000000000')
            .order('created_at', { ascending: false })
            .limit(10) // Get last 10 freemium records
          
          if (!error3 && data3 && data3.length > 0) {
            console.log('[DB] Found', data3.length, 'freemium records, filtering by token...')
            
            // Filter in memory by checking raw_scraped_data
            const matchingListing = data3.find(listing => {
              try {
                const rawData = listing.raw_scraped_data
                console.log('[DB] Checking listing:', listing.id, 'rawData type:', typeof rawData, 'token:', token)
                
                if (typeof rawData === 'object' && rawData && rawData.freemium_token === token) {
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
                console.log('[DB] Error parsing raw_scraped_data for listing:', listing.id, e.message)
              }
              return false
            })
            
            if (matchingListing) {
              console.log('[DB] ✅ Found data using memory filtering:', matchingListing.id)
              listings = matchingListing
              error = null
            } else {
              console.log('[DB] No matching token found in', data3.length, 'records')
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

    if (error || !listings) {
      console.log('[DB] No freemium data found for token:', token, error)
      
      // Fallback: Daten sind nicht in DB - redirect zu API call
      return NextResponse.json(
        {
          success: false,
          error: 'Freemium data not found in database',
          shouldFallbackToApi: true
        },
        { status: 404 }
      )
    }

    console.log('[DB] ✅ Found freemium data in DB:', listings.id)
    
    // Extrahiere Daten aus raw_scraped_data
    const rawData = listings.raw_scraped_data as any
    const analysisData = rawData?.analysis_data
    const isRealData = rawData?.is_real_data || false
    
    // Rekonstruiere listing object für Dashboard
    const listing = {
      id: listings.id,
      url: listings.airbnb_url,
      title: listings.title,
      description: listings.description,
      propertyType: listings.property_type,
      roomType: listings.room_type,
      personCapacity: listings.person_capacity,
      bedrooms: listings.bedroom_count,
      beds: listings.bed_count,
      baths: listings.bathroom_count,
      price: {
        amount: listings.price_per_night?.toString() || '0',
        qualifier: listings.price_qualifier || 'Nacht',
        label: 'pro Nacht'
      },
      images: listings.images?.map((img: any) => ({
        ...img,
        url: img.imageUrl || img.url // Map imageUrl to url for frontend compatibility
      })) || null,
      amenities: cleanupAmenities(listings.amenities),
      rating: {
        guestSatisfaction: listings.overall_rating ?? 4.0,
        accuracy: listings.rating_accuracy ?? 4.0,
        cleanliness: listings.rating_cleanliness ?? 4.0,
        location: listings.rating_location ?? 4.0,
        value: listings.rating_value ?? 4.0,
        reviewsCount: listings.reviews_count ?? 0
      },
      host: {
        name: listings.host_name,
        isSuperHost: listings.host_is_superhost,
        profileImage: listings.host_profile_image,
        responseRate: listings.host_response_rate,
        responseTime: listings.host_response_time
      }
    }

    // Generiere Empfehlungen falls nicht vorhanden
    let recommendations = analysisData?.recommendations || [
      'Optimieren Sie Ihren Listing-Titel mit lokalen Highlights',
      'Erweitern Sie Ihre Beschreibung um emotionale Trigger',
      'Fügen Sie professionelle Fotos hinzu - besonders vom Außenbereich'
    ]

    const responseData: FreemiumDashboardData = {
      listing,
      analysis: analysisData || {
        overallScore: Math.floor(75 + Math.random() * 20),
        categoryScores: {
          title: Math.floor(60 + Math.random() * 35),
          description: Math.floor(55 + Math.random() * 30),
          photos: Math.floor(70 + Math.random() * 25),
          pricing: Math.floor(50 + Math.random() * 40),
          amenities: Math.floor(65 + Math.random() * 30),
          location: Math.floor(80 + Math.random() * 20)
        }
      },
      recommendations,
      isRealData,
      dbId: listings.id
    }

    logInfo('[FreemiumDashboard] Data successfully loaded from DB')
    
    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'database',
        isRealData,
        dbId: listings.id,
        scrapedAt: listings.last_scraped_at
      }
    })
    
  } catch (error) {
    logApiError('[FreemiumDashboard] Unerwarteter Fehler', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Ein unerwarteter Fehler ist aufgetreten',
        details: process.env.NODE_ENV !== 'production' ? (error as Error)?.message : undefined
      },
      { status: 500 }
    )
  }
}