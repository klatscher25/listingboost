/**
 * @file app/api/freemium/analyze/route.ts
 * @description Freemium analysis API endpoint with real URL scraper integration
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo Freemium API with real data integration and graceful fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { AirbnbUrlScraper } from '@/lib/services/apify/scrapers/url-scraper'
import { AirbnbListingData } from '@/lib/services/apify/types'
import { logInfo, logApiError } from '@/lib/utils/logger'
import { supabaseAdmin } from '@/lib/supabase'
import type { ListingsTable } from '@/types/database'

// Simple in-memory cache for demonstration (in production, use Redis)
const cache: { [key: string]: { data: FreemiumAnalysisData; expiresAt: number } } = {}

interface FreemiumAnalysisResult {
  overallScore: number
  categoryScores: {
    title: number
    description: number
    photos: number
    pricing: number
    amenities: number
    location: number
  }
}

interface FreemiumAnalysisData {
  listing: AirbnbListingData | EnhancedFakeData
  analysis: FreemiumAnalysisResult
  recommendations: string[]
  isRealData: boolean
}

interface EnhancedFakeData {
  id: string
  url: string
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
    id: string
    name: string
    isSuperHost: boolean
    profileImage?: string
    responseRate?: string
    responseTime?: string
  }
  price: {
    amount: string
    qualifier: string
    label: string
  }
  images?: Array<{
    url: string
    caption?: string
    orientation?: string
    width?: number
    height?: number
  }>
  amenities: Array<{
    title: string
    values: Array<{
      title: string
      icon: string
      available: boolean
    }>
  }>
}

function getCacheKey(token: string, url: string): string {
  return `${token}:${encodeURIComponent(url)}`
}

/**
 * Speichert Freemium Analysis Daten in der listings Tabelle
 * Für spätere Wiederverwendung in Premium Features
 */
async function saveFreemiumDataToDB(
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
        source: 'freemium'
      } as any,
      last_scraped_at: new Date().toISOString()
    }

    console.log('[DB] Saving freemium data to listings table with UPSERT...')
    console.log('[DB] Token being saved:', token)
    console.log('[DB] Raw scraped data structure:', JSON.stringify(listingInsert.raw_scraped_data, null, 2))
    
    // Use UPSERT to handle duplicate airbnb_id conflicts
    const { data, error } = await supabaseAdmin
      .from('listings')
      .upsert(listingInsert, { 
        onConflict: 'airbnb_id',
        ignoreDuplicates: false 
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
    console.log('[DB] Saved freemium_token:', data.raw_scraped_data?.freemium_token)
    logInfo(`[FreemiumAPI] Freemium data saved to DB: ${data.id}`)
    return data.id

  } catch (error) {
    console.error('[DB] Unexpected error saving freemium data:', error)
    logApiError('[FreemiumAPI] DB save unexpected error', error)
    return null
  }
}

function generateEnhancedFakeData(url: string): EnhancedFakeData {
  const roomId = url.match(/rooms\/(\d+)/) ? url.match(/rooms\/(\d+)/)![1] : '12345678'
  
  return {
    id: roomId,
    url,
    title: 'Charmante Wohnung im Stadtzentrm',
    description: 'Eine wunderschöne, vollständig eingerichtete Wohnung im Herzen der Stadt. Perfect für Reisende, die Komfort und Stil schätzen.',
    propertyType: 'Wohnung',
    roomType: 'Gesamte Wohnung',
    personCapacity: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    rating: {
      guestSatisfaction: 4.2 + Math.random() * 0.8,
      accuracy: 4.3 + Math.random() * 0.7,
      cleanliness: 4.4 + Math.random() * 0.6,
      location: 4.5 + Math.random() * 0.5,
      value: 4.1 + Math.random() * 0.9,
      reviewsCount: Math.floor(Math.random() * 150) + 50
    },
    host: {
      id: 'host_' + Math.random().toString(36).substring(2),
      name: ['Maria Schmidt', 'Thomas Weber', 'Anna Müller', 'Stefan Fischer'][Math.floor(Math.random() * 4)],
      isSuperHost: Math.random() > 0.6,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      responseRate: (85 + Math.random() * 15).toFixed(0) + '%',
      responseTime: ['innerhalb einer Stunde', 'innerhalb weniger Stunden', 'innerhalb eines Tages'][Math.floor(Math.random() * 3)]
    },
    price: {
      amount: (60 + Math.random() * 80).toFixed(0),
      qualifier: 'Nacht',
      label: 'pro Nacht'
    },
    images: [
      {
        url: `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center`,
        caption: 'Wohnzimmer',
        orientation: 'LANDSCAPE', 
        width: 800,
        height: 600
      },
      {
        url: `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center`,
        caption: 'Schlafzimmer',
        orientation: 'LANDSCAPE', 
        width: 800,
        height: 600
      },
      {
        url: `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop&crop=center`,
        caption: 'Küche',
        orientation: 'PORTRAIT',
        width: 600,
        height: 800
      }
    ],
    amenities: [
      {
        title: 'Grundausstattung',
        values: [
          { title: 'WLAN', icon: '📶', available: true },
          { title: 'Küche', icon: '🍳', available: true },
          { title: 'Waschmaschine', icon: '🧺', available: Math.random() > 0.3 },
          { title: 'Klimaanlage', icon: '❄️', available: Math.random() > 0.5 }
        ]
      },
      {
        title: 'Komfort',
        values: [
          { title: 'TV', icon: '📺', available: true },
          { title: 'Heizung', icon: '🔥', available: true },
          { title: 'Balkon', icon: '🏠', available: Math.random() > 0.6 },
          { title: 'Parkplatz', icon: '🚗', available: Math.random() > 0.4 }
        ]
      }
    ]
  }
}

function analyzeListingData(listing: AirbnbListingData | EnhancedFakeData): FreemiumAnalysisResult {
  const isRealData = 'coordinates' in listing
  
  if (isRealData) {
    const realListing = listing as AirbnbListingData
    return {
      overallScore: Math.floor((realListing.rating?.guestSatisfaction || 4.0) * 100 + Math.random() * 100),
      categoryScores: {
        title: Math.floor((realListing.title?.length || 0) > 30 ? 75 + Math.random() * 25 : 50 + Math.random() * 30),
        description: Math.floor((realListing.description?.length || 0) > 100 ? 70 + Math.random() * 30 : 40 + Math.random() * 35),
        photos: Math.floor((realListing.images?.length || 0) > 5 ? 80 + Math.random() * 20 : 45 + Math.random() * 35),
        pricing: Math.floor(60 + Math.random() * 35),
        amenities: Math.floor((realListing.amenities?.length || 0) > 3 ? 75 + Math.random() * 25 : 50 + Math.random() * 30),
        location: Math.floor((realListing.rating?.location || 4.0) * 20)
      }
    }
  } else {
    const fakeListing = listing as EnhancedFakeData
    return {
      overallScore: Math.floor(fakeListing.rating.guestSatisfaction * 100 + Math.random() * 100),
      categoryScores: {
        title: Math.floor(60 + Math.random() * 35),
        description: Math.floor(55 + Math.random() * 30),
        photos: Math.floor(70 + Math.random() * 25),
        pricing: Math.floor(50 + Math.random() * 40),
        amenities: Math.floor(65 + Math.random() * 30),
        location: Math.floor(fakeListing.rating.location * 20)
      }
    }
  }
}

function generateRecommendations(listing: AirbnbListingData | EnhancedFakeData, analysis: FreemiumAnalysisResult): string[] {
  const recommendations: string[] = []
  
  if (analysis.categoryScores.title < 70) {
    recommendations.push('Optimieren Sie Ihren Listing-Titel mit lokalen Highlights und Unique Selling Points')
  }
  
  if (analysis.categoryScores.description < 60) {
    recommendations.push('Erweitern Sie Ihre Beschreibung um emotionale Trigger und Neighborhood-Infos')
  }
  
  if (analysis.categoryScores.photos < 75) {
    recommendations.push('Fügen Sie professionelle Fotos hinzu - besonders vom Außenbereich und besonderen Features')
  }
  
  if (analysis.categoryScores.pricing < 65) {
    recommendations.push('Ihre Preispositionierung hat Optimierungspotential basierend auf der Konkurrenzanalyse')
  }
  
  if (analysis.categoryScores.amenities < 70) {
    recommendations.push('Erweitern Sie Ihre Ausstattung um gefragte Amenities wie schnelles WLAN oder Arbeitsplatz')
  }
  
  // Always add at least 3 recommendations
  if (recommendations.length < 3) {
    recommendations.push('Verbessern Sie Ihre Check-in Erfahrung mit einem digitalen Guidebook')
    recommendations.push('Optimieren Sie Ihre Preissstrategie für Wochenenden und Feiertage')
    recommendations.push('Bieten Sie personalisierte Gäste-Empfehlungen für die lokale Umgebung')
  }
  
  return recommendations.slice(0, 3)
}

function timeoutPromise<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Scraping timeout after ' + (ms / 1000) + 's'))
    }, ms)
    
    promise
      .then((value) => { 
        clearTimeout(timer)
        resolve(value)
      })
      .catch((err) => { 
        clearTimeout(timer)
        reject(err)
      })
  })
}

export async function POST(request: NextRequest) {
  logInfo('[FreemiumAPI] Freemium-Analyse-Anfrage gestartet')
  
  try {
    const { url, token } = await request.json()
    
    if (!url || !token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: url and token'
        },
        { status: 400 }
      )
    }
    
    // Validate Airbnb URL format
    const airbnbUrlPattern = /^https?:\/\/(www\.)?(airbnb\.(com|de|fr|it|es|at|ch))\/rooms\/\d+/
    if (!airbnbUrlPattern.test(url)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Airbnb URL format'
        },
        { status: 400 }
      )
    }
    
    // Check cache first
    const cacheKey = getCacheKey(token, url)
    const cached = cache[cacheKey]
    if (cached && cached.expiresAt > Date.now()) {
      logInfo('[FreemiumAPI] Returning cached result')
      return NextResponse.json({ success: true, data: cached.data })
    }
    
    let listing: AirbnbListingData | EnhancedFakeData | null = null
    let isRealData = false
    
    // ENHANCED DIAGNOSTICS: Attempt real scraping with detailed logging
    console.log('[DIAGNOSTIC] ========== APIFY SCRAPING DIAGNOSTICS ==========')
    console.log('[DIAGNOSTIC] APIFY_API_TOKEN present:', !!process.env.APIFY_API_TOKEN)
    console.log('[DIAGNOSTIC] APIFY_API_TOKEN value (first 15 chars):', process.env.APIFY_API_TOKEN?.substring(0, 15))
    console.log('[DIAGNOSTIC] APIFY_API_TOKEN is not placeholder:', process.env.APIFY_API_TOKEN !== 'placeholder_apify_token')
    console.log('[DIAGNOSTIC] Target URL:', url)
    console.log('[DIAGNOSTIC] URL Regex Test:', /^https?:\/\/(www\.)?(airbnb\.(com|de|fr|it|es|at|ch))\/rooms\/\d+/.test(url))
    
    if (process.env.APIFY_API_TOKEN && 
        process.env.APIFY_API_TOKEN !== 'placeholder_apify_token') {
      
      try {
        console.log('[DIAGNOSTIC] Starting real scraping process...')
        console.log('[DIAGNOSTIC] Actor ID:', process.env.APIFY_ACTOR_URL_SCRAPER)
        logInfo('[FreemiumAPI] Attempting real scraping with URL scraper')
        
        const startTime = Date.now()
        const scraper = new AirbnbUrlScraper()
        
        console.log('[DIAGNOSTIC] Scraper created, calling scrape method with 60s timeout...')
        
        // INCREASED TIMEOUT to 60 seconds for better success rate
        listing = await timeoutPromise(60000, scraper.scrape(url, {
          timeout: 60,  // Increased from 45s
          memory: 2048  // Increased memory from 1024
        }))
        
        const scrapingTime = Date.now() - startTime
        console.log('[DIAGNOSTIC] ✅ SCRAPING SUCCESS! Time taken:', scrapingTime + 'ms')
        console.log('[DIAGNOSTIC] Scraped listing data:', {
          id: listing?.id,
          title: listing?.title?.substring(0, 50),
          hasImages: !!listing?.images?.length,
          imageCount: listing?.images?.length || 0,
          hasRating: !!listing?.rating,
          hasPrice: !!listing?.price,
          hasAmenities: !!listing?.amenities?.length
        })
        
        isRealData = true
        logInfo('[FreemiumAPI] Real scraping successful')
      } catch (error) {
        const errorTime = Date.now()
        const err = error as Error
        console.log('[DIAGNOSTIC] ❌ SCRAPING FAILED after', (errorTime - (Date.now() - 60000)) + 'ms')
        console.log('[DIAGNOSTIC] Error type:', err?.name || 'Unknown')
        console.log('[DIAGNOSTIC] Error message:', err?.message || 'No message')
        console.log('[DIAGNOSTIC] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
        
        // Check if it's a timeout error specifically
        if (err?.message?.includes('timeout') || err?.message?.includes('Timeout')) {
          console.log('[DIAGNOSTIC] 🕐 TIMEOUT DETECTED - Actor took longer than 60 seconds')
        }
        
        // Check if it's an actor error
        if (err?.message?.includes('Actor') || err?.message?.includes('actor')) {
          console.log('[DIAGNOSTIC] 🎭 ACTOR ERROR - Possible actor availability issue')
        }
        
        logApiError('[FreemiumAPI] Real scraping failed, falling back to enhanced fake data', error)
        listing = null
      }
    } else {
      console.log('[DIAGNOSTIC] ❌ Skipping real scraping - no valid token or placeholder token')
    }
    console.log('[DIAGNOSTIC] ========== END DIAGNOSTICS ==========')
    console.log('')
    
    // Fallback to enhanced fake data
    if (!listing) {
      logInfo('[FreemiumAPI] Using enhanced fake data')
      listing = generateEnhancedFakeData(url)
      isRealData = false
    }
    
    // Analyze the listing data
    const analysis = analyzeListingData(listing)
    const recommendations = generateRecommendations(listing, analysis)
    
    const responseData: FreemiumAnalysisData = {
      listing,
      analysis,
      recommendations,
      isRealData
    }
    
    // ✅ NEUE FUNKTION: Speichere in DB für spätere Wiederverwendung
    const dbListingId = await saveFreemiumDataToDB(listing, analysis, token, url, isRealData)
    if (dbListingId) {
      console.log('[PERFORMANCE] ✅ Data saved to DB for future use:', dbListingId)
    }
    
    // Cache the result for 1 hour
    cache[cacheKey] = {
      data: responseData,
      expiresAt: Date.now() + 3600 * 1000 // 1 hour
    }
    
    logInfo('[FreemiumAPI] Freemium-Analyse erfolgreich abgeschlossen')
    
    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        timestamp: new Date().toISOString(),
        isRealData,
        cached: false
      }
    })
    
  } catch (error) {
    logApiError('[FreemiumAPI] Unerwarteter Fehler', error)
    
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