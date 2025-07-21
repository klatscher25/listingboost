/**
 * @file lib/services/apify/mock-scraper.ts
 * @description Mock scraper for development and testing when Apify API is not available
 * @created 2025-07-21
 */

import { AirbnbListingData, ComprehensiveListingData } from './types'
import { logInfo } from '@/lib/utils/logger'

/**
 * Mock scraper that generates realistic test data for development
 */
export class MockScraper {
  /**
   * Generate mock listing data based on URL
   */
  static generateMockListingData(airbnbUrl: string): AirbnbListingData {
    const airbnbIdMatch = airbnbUrl.match(/\/rooms\/(\d+)/)
    const airbnbId = airbnbIdMatch?.[1] || '12345'

    return {
      id: airbnbId,
      url: airbnbUrl, // Add the URL field that's required
      title: `Schöne Wohnung in Berlin - Listing ${airbnbId}`,
      description:
        'Eine wunderschöne, moderne Wohnung im Herzen von Berlin. Perfekt für Geschäftsreisende und Touristen. Die Wohnung verfügt über alle modernen Annehmlichkeiten und bietet einen atemberaubenden Blick auf die Stadt.',
      price: {
        amount: '89',
        currency: 'EUR',
        period: 'night',
      },
      rating: {
        guestSatisfaction: 4.7,
        numberOfReviews: 127,
        accuracy: 4.8,
        checkin: 4.6,
        cleanliness: 4.9,
        communication: 4.7,
        location: 4.8,
        value: 4.5,
      },
      location: {
        city: 'Berlin',
        neighborhood: 'Mitte',
        address: 'Unter den Linden, 10117 Berlin, Deutschland',
        coordinates: {
          lat: 52.5170365,
          lng: 13.3888599,
        },
      },
      host: {
        name: 'Maria',
        isSuperhost: true,
        profilePicture: 'https://example.com/profile.jpg',
        responseRate: 100,
        responseTime: 'within an hour',
      },
      propertyType: 'Entire apartment',
      roomType: 'Entire place',
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      beds: 2,
      amenities: [
        'WiFi',
        'Kitchen',
        'Heating',
        'Washer',
        'TV',
        'Iron',
        'Hair dryer',
        'Dedicated workspace',
        'Smoke alarm',
        'Carbon monoxide alarm',
        'First aid kit',
      ],
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ],
      minimumStay: 2,
      checkIn: '15:00',
      checkOut: '11:00',
      instantBook: true,
      coordinates: {
        latitude: 52.5170365,
        longitude: 13.3888599,
      },
    } as AirbnbListingData
  }

  /**
   * Generate mock comprehensive data
   */
  static async generateMockComprehensiveData(
    airbnbUrl: string
  ): Promise<ComprehensiveListingData> {
    logInfo('[MockScraper] Mock-Daten generieren für URL', { airbnbUrl })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const listing = this.generateMockListingData(airbnbUrl)

    return {
      listing,
      reviews: [
        {
          id: '1',
          author: 'John',
          rating: 5,
          comment: 'Fantastic apartment! Very clean and in a great location.',
          date: '2024-01-15',
          language: 'en',
        },
        {
          id: '2',
          author: 'Sarah',
          rating: 4,
          comment: 'Great place, would stay again!',
          date: '2024-01-10',
          language: 'en',
        },
      ],
      availability: [
        {
          date: '2024-01-20',
          available: true,
          price: 89,
          currency: 'EUR',
        },
        {
          date: '2024-01-21',
          available: false,
          price: 89,
          currency: 'EUR',
        },
      ],
      competitors: [
        {
          id: '54321',
          title: 'Modernes Apartment in Berlin',
          price: { amount: '95', currency: 'EUR', period: 'night' },
          rating: { guestSatisfaction: 4.5, numberOfReviews: 89 },
          distance: 0.8,
        },
      ],
      scrapedAt: new Date().toISOString(),
      dataCompleteness: {
        listing: true,
        reviews: true,
        availability: true,
        competitors: true,
      },
      processingTime: {
        listing: 800,
        reviews: 600,
        availability: 400,
        competitors: 900,
        total: 2700,
      },
    }
  }

  /**
   * Quick mock data generation (even faster)
   */
  static async generateMockQuickData(
    airbnbUrl: string
  ): Promise<{ listing: AirbnbListingData }> {
    logInfo('[MockScraper] Schnelle Mock-Daten generieren für URL', {
      airbnbUrl,
    })

    // Simulate quick processing
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      listing: this.generateMockListingData(airbnbUrl),
    }
  }
}
