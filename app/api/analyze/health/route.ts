/**
 * @file app/api/analyze/health/route.ts
 * @description Health check endpoint for enhanced analysis services
 * @created 2025-07-21
 * @todo CORE-001-03: Service health monitoring for AI integration
 */

import { NextResponse } from 'next/server'
import { AnalyzerHealth } from '@/lib/services/enhanced-analysis'
import { logInfo, logApiError } from '@/lib/utils/logger'

export async function GET() {
  try {
    logInfo('[HealthAPI] Service-Status wird überprüft')

    const serviceStatus = await AnalyzerHealth.checkServiceHealth()

    return NextResponse.json({
      success: true,
      data: {
        ...serviceStatus,
        services: {
          apify: {
            healthy: serviceStatus.apifyHealthy,
            status: serviceStatus.apifyHealthy ? 'operational' : 'degraded',
            details: serviceStatus.details.apify,
          },
          gemini: {
            healthy: serviceStatus.geminiHealthy,
            status: serviceStatus.geminiHealthy ? 'operational' : 'degraded',
            details: serviceStatus.details.gemini,
          },
        },
        overallStatus: serviceStatus.overallHealthy ? 'healthy' : 'degraded',
        capabilities: {
          basicAnalysis: serviceStatus.apifyHealthy,
          aiEnhancedAnalysis:
            serviceStatus.apifyHealthy && serviceStatus.geminiHealthy,
          recommendationEngine: serviceStatus.geminiHealthy,
          sentimentAnalysis: serviceStatus.geminiHealthy,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        healthCheck: true,
      },
    })
  } catch (error) {
    logApiError('[HealthAPI] Fehler beim Health Check', error)

    return NextResponse.json(
      {
        success: false,
        data: {
          overallHealthy: false,
          apifyHealthy: false,
          geminiHealthy: false,
          capabilities: {
            basicAnalysis: false,
            aiEnhancedAnalysis: false,
            recommendationEngine: false,
            sentimentAnalysis: false,
          },
        },
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Fehler beim Überprüfen des Service-Status',
          details:
            process.env.NODE_ENV !== 'production'
              ? (error as Error).message
              : undefined,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '3.0.0',
          healthCheck: true,
        },
      },
      { status: 503 }
    )
  }
}
