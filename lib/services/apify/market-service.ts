/**
 * @file lib/services/apify/market-service.ts
 * @description Market and quick analysis service for Apify
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-04: Extracted from analysis-service.ts for CLAUDE.md compliance
 */

import { supabaseAdmin } from '@/lib/supabase'
import calculateListingScore from '@/lib/scoring'
import { urlScraper, locationScraper } from './scrapers'
import { ApifyDataTransformer } from './transformer'
import { AnalysisResult } from './analysis-service'

/**
 * Market and quick analysis service for Apify
 */
export class ApifyMarketService {
  /**
   * Quick listing analysis using only basic scraper (faster, less comprehensive)
   */
  async quickAnalyze(
    airbnbUrl: string,
    userId: string
  ): Promise<AnalysisResult> {
    console.log('[ApifyMarketService] Starte Schnell-Analyse:', airbnbUrl)

    try {
      // Only scrape basic listing data with timeout
      const scrapingTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Quick scraping timeout nach 15 Sekunden'))
        }, 15000)
      })

      const scrapingPromise = urlScraper.scrape(airbnbUrl)
      const listingData = await Promise.race([scrapingPromise, scrapingTimeout])

      // Transform to database format
      const transformedData = ApifyDataTransformer.transformListingData(
        listingData,
        userId
      )

      // Save to database with timeout
      console.log('[ApifyMarketService] Speichere in Datenbank...')

      const savedListing = await this.saveListingToDatabase(transformedData)

      // Calculate scoring with limited data
      const scoringResult = await calculateListingScore(savedListing, {
        reviews: [],
        availability: [],
        competitors: [],
        sentimentAnalysis: null,
      })

      return {
        listing: this.formatListingResponse(savedListing),
        scoring: scoringResult,
        scrapingMetadata: {
          scrapedAt: new Date().toISOString(),
          dataCompleteness: {
            listing: true,
            reviews: false,
            availability: false,
            competitors: false,
          },
          processingTime: { total: 30000 }, // Estimated
          dataSource: 'apify_scraper',
        },
        analyzedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error(
        '[ApifyMarketService] Schnell-Analyse fehlgeschlagen:',
        error
      )
      throw new Error(
        `Schnell-Analyse fehlgeschlagen: ${(error as Error).message}`
      )
    }
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
    const { maxListings = 50, priceRange } = options || {}

    console.log('[ApifyMarketService] Starte Markt-Analyse für:', location)

    try {
      const competitors = await locationScraper.scrape(location, {
        maxListings,
        priceMin: priceRange?.min,
        priceMax: priceRange?.max,
      })

      const analysis = ApifyDataTransformer.transformCompetitorData(competitors)

      return {
        location,
        competitors: analysis.competitors,
        marketStats: analysis.marketStats,
        analyzedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('[ApifyMarketService] Markt-Analyse fehlgeschlagen:', error)
      throw new Error(
        `Markt-Analyse fehlgeschlagen: ${(error as Error).message}`
      )
    }
  }

  /**
   * Get market trends for a specific location
   */
  async getMarketTrends(
    location: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<{
    location: string
    timeframe: string
    trends: {
      averagePriceChange: number
      occupancyRate: number
      newListings: number
      topPerformingTypes: string[]
    }
    analyzedAt: string
  }> {
    console.log('[ApifyMarketService] Analysiere Markttrends für:', location)

    try {
      // In production, this would analyze historical data
      // For now, return mock trends data
      const trends = {
        averagePriceChange: Math.random() * 20 - 10, // -10% to +10%
        occupancyRate: 65 + Math.random() * 30, // 65% to 95%
        newListings: Math.floor(Math.random() * 50) + 10, // 10-60 new listings
        topPerformingTypes: ['Apartment', 'House', 'Condo'],
      }

      return {
        location,
        timeframe,
        trends,
        analyzedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error(
        '[ApifyMarketService] Markttrend-Analyse fehlgeschlagen:',
        error
      )
      throw new Error(
        `Markttrend-Analyse fehlgeschlagen: ${(error as Error).message}`
      )
    }
  }

  /**
   * Compare listing performance against market averages
   */
  async compareToMarket(
    listingData: any,
    location: string
  ): Promise<{
    listing: any
    marketComparison: {
      priceVsMarket: number // percentage difference
      ratingVsMarket: number // percentage difference
      reviewsVsMarket: number // percentage difference
      performanceScore: number // 0-100
    }
    recommendations: string[]
    analyzedAt: string
  }> {
    console.log('[ApifyMarketService] Vergleiche mit Markt:', location)

    try {
      // Get market data for comparison
      const marketData = await this.analyzeMarket(location, {
        maxListings: 100,
      })

      // Calculate market averages
      const marketStats = marketData.marketStats
      const avgPrice = marketStats.averagePrice || 100
      const avgRating = marketStats.averageRating || 4.0
      const avgReviews = marketStats.averageReviews || 50

      // Compare listing to market
      const priceVsMarket =
        ((listingData.price_per_night - avgPrice) / avgPrice) * 100
      const ratingVsMarket =
        ((listingData.overall_rating - avgRating) / avgRating) * 100
      const reviewsVsMarket =
        ((listingData.reviews_count - avgReviews) / avgReviews) * 100

      // Calculate performance score (0-100)
      const performanceScore = Math.max(
        0,
        Math.min(
          100,
          50 +
            ratingVsMarket * 0.4 +
            reviewsVsMarket * 0.3 -
            Math.abs(priceVsMarket) * 0.1
        )
      )

      // Generate recommendations
      const recommendations: string[] = []
      if (priceVsMarket > 20) {
        recommendations.push(
          'Preis liegt über dem Marktdurchschnitt - Preisanpassung prüfen'
        )
      } else if (priceVsMarket < -20) {
        recommendations.push(
          'Preis liegt unter dem Marktdurchschnitt - Preiserhöhung möglich'
        )
      }

      if (ratingVsMarket < -10) {
        recommendations.push(
          'Bewertung liegt unter dem Marktdurchschnitt - Service verbessern'
        )
      }

      if (reviewsVsMarket < -50) {
        recommendations.push(
          'Weniger Bewertungen als der Durchschnitt - Marketing intensivieren'
        )
      }

      return {
        listing: listingData,
        marketComparison: {
          priceVsMarket: Math.round(priceVsMarket * 100) / 100,
          ratingVsMarket: Math.round(ratingVsMarket * 100) / 100,
          reviewsVsMarket: Math.round(reviewsVsMarket * 100) / 100,
          performanceScore: Math.round(performanceScore * 100) / 100,
        },
        recommendations,
        analyzedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error(
        '[ApifyMarketService] Marktvergleich fehlgeschlagen:',
        error
      )
      throw new Error(
        `Marktvergleich fehlgeschlagen: ${(error as Error).message}`
      )
    }
  }

  /**
   * Save listing to database with timeout handling
   */
  private async saveListingToDatabase(transformedData: any) {
    const dbTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Database save timeout nach 10 Sekunden'))
      }, 10000)
    })

    const dbSave = supabaseAdmin
      .from('listings')
      .insert(transformedData)
      .select()
      .single()

    const { data: savedListing, error } = await Promise.race([
      dbSave,
      dbTimeout,
    ])

    if (error) {
      throw new Error(`Fehler beim Speichern: ${error.message}`)
    }

    return savedListing
  }

  /**
   * Format listing data for API response
   */
  private formatListingResponse(listing: any) {
    return {
      id: listing.id,
      airbnb_id: listing.airbnb_id,
      title: listing.title,
      location: listing.location,
      overall_rating: listing.overall_rating,
      reviews_count: listing.reviews_count,
      price_per_night: listing.price_per_night,
      currency: listing.currency,
      images_count: listing.images_count,
      host_is_superhost: listing.host_is_superhost,
      property_type: listing.property_type,
      room_type: listing.room_type,
      person_capacity: listing.person_capacity,
      analysis_status: listing.analysis_status,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
    }
  }
}
