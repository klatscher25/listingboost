/**
 * @file app/api/freemium/ai-insights/[token]/route.ts
 * @description Gemini 2.5 Flash AI insights endpoint for freemium dashboard enhancement - refactored for CLAUDE.md compliance
 * @created 2025-07-22
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-09: Refactored using modular architecture
 */

import { NextRequest, NextResponse } from 'next/server'
import { logInfo, logApiError } from '@/lib/utils/logger'
import { FreemiumDataService } from '@/lib/services/freemium/FreemiumDataService'
import { FreemiumAIAnalysis } from '@/lib/services/freemium/FreemiumAIAnalysis'

/**
 * GET endpoint to fetch AI insights for freemium dashboard
 */
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

    // Load listing data from database using extracted service
    const listingData = await FreemiumDataService.getListingByToken(token)

    if (!listingData) {
      logApiError(
        '[FreemiumAI] Listing data nicht gefunden',
        new Error('No data')
      )
      return NextResponse.json(
        { success: false, error: 'Listing-Daten nicht gefunden' },
        { status: 404 }
      )
    }

    // Generate AI insights using extracted service
    const result = await FreemiumAIAnalysis.generateInsights(listingData, token)

    // Cache the results for performance (non-blocking)
    FreemiumDataService.cacheAIInsights(token, result).catch((err) =>
      console.warn('[FreemiumAI] Cache save error (non-critical):', err)
    )

    logInfo(
      `[FreemiumAI] AI-Insights erfolgreich generiert für Token: ${token}`
    )

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logApiError('[FreemiumAI] AI-Insights Fehler', error)
    console.error('[FreemiumAI] Detailed error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Generieren der AI-Insights',
        details:
          process.env.NODE_ENV !== 'production'
            ? (error as Error)?.message
            : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for creating/updating AI insights
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // For now, POST uses the same logic as GET
  // This could be extended for different behavior in the future
  return GET(request, { params })
}
