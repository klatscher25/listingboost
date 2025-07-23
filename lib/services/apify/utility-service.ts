/**
 * @file lib/services/apify/utility-service.ts
 * @description Utility and health check service for Apify
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-04: Extracted from index.ts for CLAUDE.md compliance
 */

/**
 * Utility service for Apify health checks and system monitoring
 */
export class ApifyUtilityService {
  /**
   * Check service health and rate limit status
   */
  async getServiceStatus() {
    try {
      const { apifyClient } = await import('./client')

      const actors = [
        'tri_angle~airbnb-rooms-urls-scraper',
        'tri_angle~airbnb-reviews-scraper',
        'rigelbytes~airbnb-availability-calendar',
        'tri_angle~airbnb-scraper',
      ]

      // Check each actor status
      const actorStatus = await Promise.allSettled(
        actors.map(async (actorId) => {
          try {
            // Test if actor exists by checking its details
            const actorInfo = await fetch(
              `https://api.apify.com/v2/acts/${actorId}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
                },
              }
            )

            return {
              actorId,
              available: actorInfo.ok,
              status: actorInfo.ok ? 'available' : 'not_found',
            }
          } catch (error) {
            return {
              actorId,
              available: false,
              status: 'error',
              error: (error as Error).message,
            }
          }
        })
      )

      const results = actorStatus.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        }
        return {
          actorId: actors[index],
          available: false,
          status: 'error',
          error: 'Promise rejected',
        }
      })

      const healthyActors = results.filter((r) => r.available).length

      return {
        healthy: healthyActors > 0,
        actors: results,
        summary: {
          total: actors.length,
          available: healthyActors,
          unavailable: actors.length - healthyActors,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        healthy: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Get rate limiting status across all actors
   */
  async getRateLimitStatus() {
    try {
      const { apifyClient } = await import('./client')

      // Check rate limits for key actors
      const rateLimitChecks = [
        'tri_angle~airbnb-scraper',
        'tri_angle~airbnb-reviews-scraper',
      ]

      const rateLimitResults = await Promise.allSettled(
        rateLimitChecks.map(async (actorId) => {
          try {
            // Mock implementation - in production, check actual rate limits
            return {
              actorId,
              requestsRemaining: 100,
              resetTime: Date.now() + 3600000, // 1 hour from now
              healthy: true,
            }
          } catch (error) {
            return {
              actorId,
              requestsRemaining: 0,
              resetTime: Date.now() + 3600000,
              healthy: false,
              error: (error as Error).message,
            }
          }
        })
      )

      const results = rateLimitResults.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value
        }
        return {
          actorId: 'unknown',
          requestsRemaining: 0,
          resetTime: Date.now() + 3600000,
          healthy: false,
          error: 'Rate limit check failed',
        }
      })

      const healthyActors = results.filter((r) => r.healthy).length

      return {
        overall: healthyActors > 0,
        actors: results,
        summary: {
          total: rateLimitChecks.length,
          healthy: healthyActors,
          blocked: rateLimitChecks.length - healthyActors,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        overall: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Test connection to Apify platform
   */
  async testConnection(): Promise<{
    connected: boolean
    latency?: number
    error?: string
    timestamp: string
  }> {
    const startTime = Date.now()

    try {
      // Test basic API connectivity
      const response = await fetch('https://api.apify.com/v2/acts', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      const latency = Date.now() - startTime

      if (response.ok) {
        return {
          connected: true,
          latency,
          timestamp: new Date().toISOString(),
        }
      } else {
        return {
          connected: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        }
      }
    } catch (error) {
      return {
        connected: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Get comprehensive system diagnostics
   */
  async getDiagnostics() {
    console.log('[ApifyUtilityService] Running comprehensive diagnostics...')

    try {
      const [serviceStatus, rateLimitStatus, connectionTest] =
        await Promise.allSettled([
          this.getServiceStatus(),
          this.getRateLimitStatus(),
          this.testConnection(),
        ])

      const diagnostics = {
        overall: {
          healthy: false,
          timestamp: new Date().toISOString(),
        },
        service:
          serviceStatus.status === 'fulfilled'
            ? serviceStatus.value
            : {
                healthy: false,
                error: 'Service status check failed',
              },
        rateLimit:
          rateLimitStatus.status === 'fulfilled'
            ? rateLimitStatus.value
            : {
                overall: false,
                error: 'Rate limit check failed',
              },
        connection:
          connectionTest.status === 'fulfilled'
            ? connectionTest.value
            : {
                connected: false,
                error: 'Connection test failed',
              },
      }

      // Determine overall health
      diagnostics.overall.healthy =
        diagnostics.service.healthy &&
        diagnostics.rateLimit.overall &&
        diagnostics.connection.connected

      console.log('[ApifyUtilityService] Diagnostics completed:', {
        overall: diagnostics.overall.healthy,
        service: diagnostics.service.healthy,
        rateLimit: diagnostics.rateLimit.overall,
        connection: diagnostics.connection.connected,
      })

      return diagnostics
    } catch (error) {
      console.error('[ApifyUtilityService] Diagnostics failed:', error)
      return {
        overall: {
          healthy: false,
          timestamp: new Date().toISOString(),
        },
        error: (error as Error).message,
      }
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  async getPerformanceMetrics() {
    try {
      // In production, this would gather actual performance data
      return {
        averageResponseTime: 2500, // ms
        successRate: 95.2, // percentage
        errorRate: 4.8, // percentage
        dailyRequests: 1250,
        monthlyRequests: 37500,
        rateLimitHits: 12,
        lastSuccessfulRequest: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        lastError: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Format diagnostic data for external consumption
   */
  formatDiagnosticsForAPI(diagnostics: any) {
    return {
      status: diagnostics.overall.healthy ? 'healthy' : 'unhealthy',
      components: {
        apify_service: {
          status: diagnostics.service.healthy ? 'operational' : 'degraded',
          details: diagnostics.service,
        },
        rate_limiting: {
          status: diagnostics.rateLimit.overall ? 'operational' : 'limited',
          details: diagnostics.rateLimit,
        },
        connectivity: {
          status: diagnostics.connection.connected ? 'operational' : 'failed',
          details: diagnostics.connection,
        },
      },
      timestamp: diagnostics.overall.timestamp,
    }
  }
}
