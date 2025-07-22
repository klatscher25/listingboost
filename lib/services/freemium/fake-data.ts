/**
 * @file lib/services/freemium/fake-data.ts
 * @description Enhanced fake data generation for freemium fallback
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from api/freemium/analyze/route.ts for CLAUDE.md compliance
 */

import type { EnhancedFakeData } from '@/lib/types/freemium-api-types'

/**
 * Generate enhanced fake data for freemium analysis when real scraping fails
 */
export function generateEnhancedFakeData(url: string): EnhancedFakeData {
  const roomId = url.match(/rooms\/(\d+)/)
    ? url.match(/rooms\/(\d+)/)![1]
    : '12345678'

  return {
    id: roomId,
    url,
    title: 'Charmante Wohnung im Stadtzentrm',
    description:
      'Eine wunderschöne, vollständig eingerichtete Wohnung im Herzen der Stadt. Perfect für Reisende, die Komfort und Stil schätzen.',
    propertyType: 'Wohnung',
    roomType: 'Gesamte Wohnung',
    personCapacity: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    rating: {
      guestSatisfaction: 4.2 + Math.random() * 0.8,
      accuracy: 4.3 + Math.random() * 0.7,
      cleanliness: 4.4 + Math.random() * 0.6,
      location: 4.5 + Math.random() * 0.5,
      value: 4.1 + Math.random() * 0.9,
      reviewsCount: Math.floor(Math.random() * 150) + 50,
    },
    host: {
      id: 'host_' + Math.random().toString(36).substring(2),
      name: ['Maria Schmidt', 'Thomas Weber', 'Anna Müller', 'Stefan Fischer'][
        Math.floor(Math.random() * 4)
      ],
      isSuperHost: Math.random() > 0.6,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      responseRate: (85 + Math.random() * 15).toFixed(0) + '%',
      responseTime: [
        'innerhalb einer Stunde',
        'innerhalb weniger Stunden',
        'innerhalb eines Tages',
      ][Math.floor(Math.random() * 3)],
    },
    price: {
      amount: (60 + Math.random() * 80).toFixed(0),
      qualifier: 'Nacht',
      label: 'pro Nacht',
    },
    images: [
      {
        url: `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center`,
        caption: 'Wohnzimmer',
        orientation: 'LANDSCAPE',
        width: 800,
        height: 600,
      },
      {
        url: `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center`,
        caption: 'Schlafzimmer',
        orientation: 'LANDSCAPE',
        width: 800,
        height: 600,
      },
      {
        url: `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop&crop=center`,
        caption: 'Küche',
        orientation: 'PORTRAIT',
        width: 600,
        height: 800,
      },
    ],
    amenities: [
      {
        title: 'Grundausstattung',
        values: [
          { title: 'WLAN', icon: '📶', available: true },
          { title: 'Küche', icon: '🍳', available: true },
          {
            title: 'Waschmaschine',
            icon: '🧺',
            available: Math.random() > 0.3,
          },
          { title: 'Klimaanlage', icon: '❄️', available: Math.random() > 0.5 },
        ],
      },
      {
        title: 'Komfort',
        values: [
          { title: 'TV', icon: '📺', available: true },
          { title: 'Heizung', icon: '🔥', available: true },
          { title: 'Balkon', icon: '🏠', available: Math.random() > 0.6 },
          { title: 'Parkplatz', icon: '🚗', available: Math.random() > 0.4 },
        ],
      },
    ],
  }
}
