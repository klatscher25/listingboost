/**
 * @file app/api/analyze/route.ts
 * @description Enhanced listing analysis API endpoint with AI integration (CORE-001-03)
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo CORE-001-03: Complete Gemini AI integration with enhanced analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { apifyService } from '@/lib/services/apify'
import { enhancedAnalysisService } from '@/lib/services/enhanced-analysis'
import { getCurrentUser } from '@/lib/supabase'
import { logInfo, logApiError } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  // Set up overall API timeout
  const API_TIMEOUT = 90000 // 90 seconds max for entire API call
  const startTime = Date.now()

  logInfo('[AnalyzeAPI] API-Anfrage mit 90s Timeout gestartet')

  try {
    const {
      airbnb_url,
      analysis_type = 'comprehensive',
      force_update = false,
      enable_ai = true,
      ai_analysis_type = 'full',
    } = await request.json()

    if (!airbnb_url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_URL',
            message: 'Airbnb-URL ist erforderlich',
            details: 'Bitte geben Sie eine gültige Airbnb-Listing-URL ein',
          },
        },
        { status: 400 }
      )
    }

    // Validate Airbnb URL format
    const airbnbUrlPattern =
      /^https:\/\/(www\.)?airbnb\.(com|de|fr|it|es|co\.uk)\/rooms\/\d+/
    if (!airbnbUrlPattern.test(airbnb_url)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Ungültige Airbnb-URL',
            details:
              'Die URL muss das Format https://airbnb.com/rooms/[ID] haben',
          },
        },
        { status: 400 }
      )
    }

    // Get current user (in production, this would come from authentication)
    // For now, use a default user ID
    const userId = '00000000-0000-0000-0000-000000000000' // Mock user for testing

    try {
      let analysisResult

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `API timeout nach ${API_TIMEOUT / 1000} Sekunden erreicht`
            )
          )
        }, API_TIMEOUT)
      })

      // Create analysis promise
      let analysisPromise

      if (analysis_type === 'quick') {
        // Quick analysis with optional AI
        logInfo('[AnalyzeAPI] Schnell-Analyse mit AI-Option gestartet')
        analysisPromise = enhancedAnalysisService.analyzeQuick(
          airbnb_url,
          userId,
          enable_ai
        )
      } else {
        // Comprehensive analysis with AI integration
        logInfo('[AnalyzeAPI] Umfassende Analyse mit AI-Integration gestartet')
        analysisPromise = enhancedAnalysisService.analyzeComprehensive(
          airbnb_url,
          userId,
          {
            includeReviews: true,
            includeAvailability: false, // Disabled for performance/rate limits
            includeCompetitors: true,
            forceUpdate: force_update,
            enableAI: enable_ai,
            aiAnalysisType: ai_analysis_type,
          }
        )
      }

      // Race between analysis and timeout
      analysisResult = await Promise.race([analysisPromise, timeoutPromise])

      return NextResponse.json({
        success: true,
        data: analysisResult,
        meta: {
          timestamp: new Date().toISOString(),
          version: '3.0.0', // Updated for AI integration
          analysis_type,
          ai_enabled: enable_ai,
          ai_analysis_type: enable_ai ? ai_analysis_type : undefined,
          data_source: 'enhanced_analysis', // Apify + AI
          processing_time: analysisResult.processingInfo.totalTime,
        },
      })
    } catch (scrapeError) {
      logApiError('[AnalyzeAPI] Scraping-Fehler', scrapeError)

      // Check if it's a rate limit error
      if (
        scrapeError instanceof Error &&
        scrapeError.message.includes('Rate-Limit')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: scrapeError.message,
              details:
                'Versuchen Sie die Schnell-Analyse oder warten Sie einige Minuten',
            },
          },
          { status: 429 }
        )
      }

      // Return error for all scraping failures
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SCRAPING_ERROR',
            message: 'Fehler beim Analysieren des Listings',
            details: (scrapeError as Error).message,
          },
        },
        { status: 500 }
      )
    }
  } catch (error) {
    logApiError('[AnalyzeAPI] Unerwarteter Fehler', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Ein unerwarteter Fehler ist aufgetreten',
          details:
            process.env.NODE_ENV !== 'production'
              ? (error as Error)?.message
              : undefined,
        },
      },
      { status: 500 }
    )
  }
}
