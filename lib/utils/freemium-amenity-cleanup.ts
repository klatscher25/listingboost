/**
 * @file lib/utils/freemium-amenity-cleanup.ts
 * @description Amenity cleanup utilities for freemium dashboard
 * @created 2025-07-22
 * @todo Extracted from route.ts for CLAUDE.md compliance
 */

/**
 * Clean up amenities by translating SYSTEM_ prefixes to proper German labels and icons
 */
export function cleanupAmenities(amenities: any): any {
  if (!amenities || !Array.isArray(amenities)) {
    return amenities
  }

  // German translations for amenity labels - SINGLE SOURCE OF TRUTH (frontend no longer has translations)
  const AMENITY_TRANSLATIONS: { [key: string]: string } = {
    // System keys (SYSTEM_ prefix fixes)
    SYSTEM_BATHTUB: 'Badewanne',
    SYSTEM_HAIRDRYER: 'Föhn',
    SYSTEM_SHAMPOO: 'Shampoo',
    SYSTEM_HOT_WATER: 'Warmwasser',
    SYSTEM_TOILETRIES: 'Hygieneartikel',
    SYSTEM_HANGERS: 'Kleiderbügel',
    SYSTEM_BLANKETS: 'Bettwäsche',
    SYSTEM_IRON: 'Bügeleisen',
    SYSTEM_WIFI: 'WLAN',
    SYSTEM_KITCHEN: 'Küche',
    SYSTEM_WASHER: 'Waschmaschine',
    SYSTEM_AC: 'Klimaanlage',
    SYSTEM_TV: 'Fernseher',
    SYSTEM_HEATING: 'Heizung',
    SYSTEM_BALCONY: 'Balkon',
    SYSTEM_PARKING: 'Parkplatz',
    SYSTEM_WORKSPACE: 'Arbeitsplatz',
    SYSTEM_FLOWER: 'Blumenschmuck',
    SYSTEM_CLEANING_SUPPLIES: 'Reinigungsprodukte',
    // English amenity names
    Bathtub: 'Badewanne',
    'Hair dryer': 'Föhn',
    Shampoo: 'Shampoo',
    'Hot water': 'Warmwasser',
    Essentials: 'Hygieneartikel',
  }

  // Icon mappings for proper emoji display
  const ICON_MAPPINGS: { [key: string]: string } = {
    // Laundry & Bedroom
    SYSTEM_WASHER: '🔄',
    SYSTEM_DRYER: '🌪️',
    SYSTEM_NO_DRYER: '❌',
    SYSTEM_BLANKETS: '🛏️',
    SYSTEM_HANGERS: '👔',
    SYSTEM_IRON: '👕',

    // Electronics & Entertainment
    SYSTEM_TV: '📺',
    SYSTEM_WI_FI: '📶',
    SYSTEM_WIFI: '📶',
    SYSTEM_WORKSPACE: '💻',

    // Kitchen & Dining
    SYSTEM_KITCHEN: '🍳',
    SYSTEM_COOKING_BASICS: '🍳',

    // Climate & Comfort
    SYSTEM_AC: '❄️',
    SYSTEM_NO_AIR_CONDITIONING: '❌',
    SYSTEM_HEATING: '🔥',
    SYSTEM_NO_HEATER: '❌',
    SYSTEM_HOT_WATER: '🚿',
    SYSTEM_NO_HOT_WATER: '❌',

    // Safety & Security
    SYSTEM_DETECTOR_SMOKE: '🚨',
    SYSTEM_NO_DETECTOR_CO2: '❌',
    SYSTEM_NO_SURVEILLANCE: '❌',

    // Parking & Access
    SYSTEM_MAPS_CAR_RENTAL: '🚗',
    SYSTEM_PARKING: '🅿️',

    // Services
    SYSTEM_HOST_OWNERS: '🤝',
    SYSTEM_NO_ESSENTIALS: '❌',

    // Bathroom
    SYSTEM_BATHTUB: '🛁',
    SYSTEM_HAIRDRYER: '💨',
    SYSTEM_SHAMPOO: '🧴',
    SYSTEM_TOILETRIES: '🧼',
  }

  return amenities.map((amenityGroup: any) => ({
    ...amenityGroup,
    values:
      amenityGroup.values?.map((amenity: any) => ({
        ...amenity,
        // Use German translation if available, otherwise remove SYSTEM_ prefix
        title:
          AMENITY_TRANSLATIONS[amenity.title] ||
          amenity.title?.replace(/^SYSTEM_/, '') ||
          amenity.title,
        // Map SYSTEM_ icon codes to proper emojis
        icon:
          ICON_MAPPINGS[amenity.icon] ||
          (amenity.icon?.startsWith('SYSTEM_') ? '✨' : amenity.icon) ||
          '✨',
      })) || [],
  }))
}
