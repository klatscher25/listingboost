/**
 * @file app/api/freemium/analyze/route.ts
 * @description Freemium analysis API endpoint with real URL scraper integration (Refactored)
 * @created 2025-07-21
 * @modified 2025-07-22
 * @todo Refactored from 504-line file for CLAUDE.md compliance
 */

import { NextRequest, NextResponse } from 'next/server'
import { AirbnbUrlScraper } from '@/lib/services/apify/scrapers/url-scraper'
import { logInfo, logApiError } from '@/lib/utils/logger'
import { timeoutPromise } from '@/lib/utils/timeout'
import { getCachedData, setCachedData } from '@/lib/utils/freemium-cache'
import { saveFreemiumDataToDB } from '@/lib/services/freemium/database'
import { generateEnhancedFakeData } from '@/lib/services/freemium/fake-data'
import {
  analyzeListingData,
  generateRecommendations,
} from '@/lib/services/freemium/analysis'
import type {
  FreemiumAnalysisData,
  FreemiumAnalysisResult,
  EnhancedFakeData,
} from '@/lib/types/freemium-api-types'
import type { AirbnbListingData } from '@/lib/services/apify/types'

export async function POST(request: NextRequest) {
  logInfo('[FreemiumAPI] Freemium-Analyse-Anfrage gestartet')

  try {
    const { url, token } = await request.json()

    if (!url || !token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: url and token',
        },
        { status: 400 }
      )
    }

    // Validate Airbnb URL format
    const airbnbUrlPattern =
      /^https?:\/\/(www\.)?(airbnb\.(com|de|fr|it|es|at|ch))\/rooms\/\d+/
    if (!airbnbUrlPattern.test(url)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Airbnb URL format',
        },
        { status: 400 }
      )
    }

    // Check cache first
    const cached = getCachedData(token, url)
    if (cached) {
      logInfo('[FreemiumAPI] Returning cached result')
      return NextResponse.json({ success: true, data: cached })
    }

    let listing: AirbnbListingData | EnhancedFakeData | null = null
    let isRealData = false

    // ENHANCED DIAGNOSTICS: Attempt real scraping with detailed logging
    console.log('[DIAGNOSTIC] ========== APIFY SCRAPING DIAGNOSTICS ==========')
    console.log(
      '[DIAGNOSTIC] APIFY_API_TOKEN present:',
      !!process.env.APIFY_API_TOKEN
    )
    console.log(
      '[DIAGNOSTIC] APIFY_API_TOKEN value (first 15 chars):',
      process.env.APIFY_API_TOKEN?.substring(0, 15)
    )
    console.log(
      '[DIAGNOSTIC] APIFY_API_TOKEN is not placeholder:',
      process.env.APIFY_API_TOKEN !== 'placeholder_apify_token'
    )
    console.log('[DIAGNOSTIC] Target URL:', url)
    console.log(
      '[DIAGNOSTIC] URL Regex Test:',
      /^https?:\/\/(www\.)?(airbnb\.(com|de|fr|it|es|at|ch))\/rooms\/\d+/.test(
        url
      )
    )

    if (
      process.env.APIFY_API_TOKEN &&
      process.env.APIFY_API_TOKEN !== 'placeholder_apify_token'
    ) {
      try {
        console.log('[DIAGNOSTIC] Starting real scraping process...')
        console.log(
          '[DIAGNOSTIC] Actor ID:',
          process.env.APIFY_ACTOR_URL_SCRAPER
        )
        logInfo('[FreemiumAPI] Attempting real scraping with URL scraper')

        const startTime = Date.now()
        const scraper = new AirbnbUrlScraper()

        console.log(
          '[DIAGNOSTIC] Scraper created, calling scrape method with 60s timeout...'
        )

        // INCREASED TIMEOUT to 60 seconds for better success rate
        listing = await timeoutPromise(
          60000,
          scraper.scrape(url, {
            timeout: 60, // Increased from 45s
            memory: 2048, // Increased memory from 1024
          })
        )

        const scrapingTime = Date.now() - startTime
        console.log(
          '[DIAGNOSTIC] ✅ SCRAPING SUCCESS! Time taken:',
          scrapingTime + 'ms'
        )
        console.log('[DIAGNOSTIC] Scraped listing data:', {
          id: listing?.id,
          title: listing?.title?.substring(0, 50),
          hasImages: !!listing?.images?.length,
          imageCount: listing?.images?.length || 0,
          hasRating: !!listing?.rating,
          hasPrice: !!listing?.price,
          hasAmenities: !!listing?.amenities?.length,
        })

        isRealData = true
        logInfo('[FreemiumAPI] Real scraping successful')
      } catch (error) {
        const errorTime = Date.now()
        const err = error as Error
        console.log(
          '[DIAGNOSTIC] ❌ SCRAPING FAILED after',
          errorTime - (Date.now() - 60000) + 'ms'
        )
        console.log('[DIAGNOSTIC] Error type:', err?.name || 'Unknown')
        console.log('[DIAGNOSTIC] Error message:', err?.message || 'No message')
        console.log(
          '[DIAGNOSTIC] Full error object:',
          JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        )

        // Check if it's a timeout error specifically
        if (
          err?.message?.includes('timeout') ||
          err?.message?.includes('Timeout')
        ) {
          console.log(
            '[DIAGNOSTIC] 🕐 TIMEOUT DETECTED - Actor took longer than 60 seconds'
          )
        }

        // Check if it's an actor error
        if (
          err?.message?.includes('Actor') ||
          err?.message?.includes('actor')
        ) {
          console.log(
            '[DIAGNOSTIC] 🎭 ACTOR ERROR - Possible actor availability issue'
          )
        }

        logApiError(
          '[FreemiumAPI] Real scraping failed, falling back to enhanced fake data',
          error
        )
        listing = null
      }
    } else {
      console.log(
        '[DIAGNOSTIC] ❌ Skipping real scraping - no valid token or placeholder token'
      )
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
      isRealData,
    }

    // ✅ NEUE FUNKTION: Speichere in DB für spätere Wiederverwendung
    const dbListingId = await saveFreemiumDataToDB(
      listing,
      analysis,
      token,
      url,
      isRealData
    )
    if (dbListingId) {
      console.log(
        '[PERFORMANCE] ✅ Data saved to DB for future use:',
        dbListingId
      )
    }

    // Cache the result for 1 hour
    setCachedData(token, url, responseData)

    logInfo('[FreemiumAPI] Freemium-Analyse erfolgreich abgeschlossen')

    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        timestamp: new Date().toISOString(),
        isRealData,
        cached: false,
      },
    })
  } catch (error) {
    logApiError('[FreemiumAPI] Unerwarteter Fehler', error)

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
