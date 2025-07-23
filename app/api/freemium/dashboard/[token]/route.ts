/**
 * @file app/api/freemium/dashboard/[token]/route.ts
 * @description Freemium Dashboard API - lädt Daten aus DB mit echtem Scoring-System
 * @created 2025-07-21
 * @modified 2025-07-23
 * @todo FIXED: Removed random fallback scores, now uses real scoring system
 */

import { NextRequest, NextResponse } from 'next/server'
import { logInfo, logApiError } from '@/lib/utils/logger'
import { cleanupAmenities } from '@/lib/utils/freemium-amenity-cleanup'
import { queryFreemiumData } from '@/lib/utils/freemium-db-queries'
import { analyzeListingData } from '@/lib/services/freemium/analysis'

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
          error: 'Invalid freemium token format',
        },
        { status: 400 }
      )
    }

    // Query freemium data using extracted utility
    const { listings, error } = await queryFreemiumData(token)

    if (error || !listings) {
      console.log('[DB] No freemium data found for token:', token, error)

      // Fallback: Daten sind nicht in DB - redirect zu API call
      return NextResponse.json(
        {
          success: false,
          error: 'Freemium data not found in database',
          shouldFallbackToApi: true,
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
        label: 'pro Nacht',
      },
      images:
        listings.images?.map((img: any) => ({
          ...img,
          url: img.imageUrl || img.url, // Map imageUrl to url for frontend compatibility
        })) || null,
      amenities: cleanupAmenities(listings.amenities),
      rating: {
        guestSatisfaction: listings.overall_rating ?? 4.0,
        accuracy: listings.rating_accuracy ?? 4.0,
        cleanliness: listings.rating_cleanliness ?? 4.0,
        location: listings.rating_location ?? 4.0,
        value: listings.rating_value ?? 4.0,
        reviewsCount: listings.reviews_count ?? 0,
      },
      host: {
        name: listings.host_name,
        isSuperHost: listings.host_is_superhost,
        profileImage: listings.host_profile_image,
        responseRate: listings.host_response_rate,
        responseTime: listings.host_response_time,
      },
    }

    // Generiere Empfehlungen falls nicht vorhanden
    let recommendations = analysisData?.recommendations || [
      'Optimieren Sie Ihren Listing-Titel mit lokalen Highlights',
      'Erweitern Sie Ihre Beschreibung um emotionale Trigger',
      'Fügen Sie professionelle Fotos hinzu - besonders vom Außenbereich',
    ]

    // ✅ FIXED: Use real scoring system instead of random fallback
    let finalAnalysis = analysisData

    if (!analysisData) {
      console.log(
        '[Dashboard] Analysis data missing - calculating with real scoring system'
      )
      try {
        // Reconstruct original listing data from database for scoring
        const originalListingData = rawData || listing

        // Use REAL scoring system instead of random fallback
        finalAnalysis = await analyzeListingData(originalListingData)

        console.log(
          '[Dashboard] ✅ Real scoring calculation successful:',
          finalAnalysis.overallScore
        )
      } catch (error) {
        console.error(
          '[Dashboard] Real scoring failed, using minimal fallback:',
          error
        )

        // Only use minimal fallback if real scoring completely fails
        finalAnalysis = {
          overallScore: 0,
          categoryScores: {
            title: 0,
            description: 0,
            photos: 0,
            pricing: 0,
            amenities: 0,
            location: 0,
          },
        }
      }
    }

    const responseData: FreemiumDashboardData = {
      listing,
      analysis: finalAnalysis,
      recommendations,
      isRealData,
      dbId: listings.id,
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
        scrapedAt: listings.last_scraped_at,
      },
    })
  } catch (error) {
    logApiError('[FreemiumDashboard] Unerwarteter Fehler', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Ein unerwarteter Fehler ist aufgetreten',
        details:
          process.env.NODE_ENV !== 'production'
            ? (error as Error)?.message
            : undefined,
      },
      { status: 500 }
    )
  }
}
