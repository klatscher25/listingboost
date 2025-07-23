/**
 * @file lib/services/apify/index.ts
 * @description Main Apify service orchestrator - refactored for CLAUDE.md compliance
 * @created 2025-07-21
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-04: Refactored using modular architecture
 */

import { ApifyAnalysisService, AnalysisResult } from './analysis-service'
import { ApifyMarketService } from './market-service'
import { ApifyUtilityService } from './utility-service'

/**
 * Main Apify service class that orchestrates analysis, market, and utility services
 */
export class ApifyService {
  private analysisService: ApifyAnalysisService
  private marketService: ApifyMarketService
  private utilityService: ApifyUtilityService

  constructor() {
    this.analysisService = new ApifyAnalysisService()
    this.marketService = new ApifyMarketService()
    this.utilityService = new ApifyUtilityService()
  }

  /**
   * Analyze a single Airbnb listing with full scraping + scoring pipeline
   */
  async analyzeListing(
    airbnbUrl: string,
    userId: string,
    options?: {
      includeReviews?: boolean
      includeAvailability?: boolean
      includeCompetitors?: boolean
      forceUpdate?: boolean
    }
  ): Promise<AnalysisResult> {
    return this.analysisService.analyzeListing(airbnbUrl, userId, options)
  }

  /**
   * Quick listing analysis using only basic scraper (faster, less comprehensive)
   */
  async quickAnalyze(
    airbnbUrl: string,
    userId: string
  ): Promise<AnalysisResult> {
    return this.marketService.quickAnalyze(airbnbUrl, userId)
  }

  /**
   * Analyze competitors for market positioning
   */
  async analyzeMarket(
    location: string,
    options?: {
      maxListings?: number
      priceRange?: { min: number; max: number }
    }
  ): Promise<any> {
    return this.marketService.analyzeMarket(location, options)
  }

  /**
   * Get market trends for a specific location
   */
  async getMarketTrends(
    location: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ) {
    return this.marketService.getMarketTrends(location, timeframe)
  }

  /**
   * Compare listing performance against market averages
   */
  async compareToMarket(listingData: any, location: string) {
    return this.marketService.compareToMarket(listingData, location)
  }

  /**
   * Check service health and rate limit status
   */
  async getServiceStatus() {
    return this.utilityService.getServiceStatus()
  }

  /**
   * Get rate limiting status across all actors
   */
  async getRateLimitStatus() {
    return this.utilityService.getRateLimitStatus()
  }

  /**
   * Test connection to Apify platform
   */
  async testConnection() {
    return this.utilityService.testConnection()
  }

  /**
   * Get comprehensive system diagnostics
   */
  async getDiagnostics() {
    return this.utilityService.getDiagnostics()
  }

  /**
   * Get performance metrics for monitoring
   */
  async getPerformanceMetrics() {
    return this.utilityService.getPerformanceMetrics()
  }

  /**
   * Format diagnostic data for external consumption
   */
  formatDiagnosticsForAPI(diagnostics: any) {
    return this.utilityService.formatDiagnosticsForAPI(diagnostics)
  }
}

/**
 * Export singleton service instance
 */
export const apifyService = new ApifyService()

/**
 * Default export for main service
 */
export default ApifyService

/**
 * Re-export types and components for external use
 */
export * from './types'
export * from './scrapers'
export * from './transformer'
export * from './analysis-service'
export * from './market-service'
export * from './utility-service'
export { ApifyError } from './client'
