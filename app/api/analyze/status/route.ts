/**
 * @file app/api/analyze/status/route.ts
 * @description API endpoint for checking Apify service status and rate limits
 * @created 2025-07-21
 * @todo CORE-001-02: Service health monitoring
 */

import { NextResponse } from 'next/server'
import { apifyService } from '@/lib/services/apify'
import { logApiError } from '@/lib/utils/logger'

export async function GET() {
  try {
    const serviceStatus = await apifyService.getServiceStatus()

    return NextResponse.json({
      success: true,
      data: serviceStatus,
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
      },
    })
  } catch (error) {
    logApiError('[StatusAPI] Fehler beim Status-Check', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATUS_CHECK_FAILED',
          message: 'Fehler beim Überprüfen des Service-Status',
          details:
            process.env.NODE_ENV !== 'production'
              ? (error as Error).message
              : undefined,
        },
      },
      { status: 500 }
    )
  }
}
