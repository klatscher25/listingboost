/**
 * @file lib/services/gemini/prompts.ts
 * @description Gemini AI prompts - externed to fix webpack performance warning
 * @created 2025-07-22
 * @todo PERFORMANCE-001: Fix 108kiB string serialization warning
 */

export const createGermanAirbnbPrompt = (listingData: {
  title: string
  description?: string
  propertyType: string
  roomType: string
  personCapacity: number
  bedrooms?: number
  rating: {
    guestSatisfaction: number
    accuracy: number
    cleanliness: number
    location: number
    value: number
    reviewsCount: number
  }
  host: {
    name: string
    isSuperHost: boolean
    responseRate?: string
    responseTime?: string
  }
  price: {
    amount: string
    qualifier: string
  }
  availableAmenities: string
  currentSeason: string
}): string => {
  return `Du bist ein deutscher Airbnb-Optimierungsexperte. Analysiere dieses Listing OHNE erfundene Marktdaten zu verwenden. Arbeite nur mit den vorhandenen Listing-Informationen.

LISTING DETAILS:
- Titel: "${listingData.title}"
- Beschreibung: "${listingData.description?.substring(0, 500) || 'Keine Beschreibung'}${(listingData.description?.length || 0) > 500 ? '...' : ''}"
- Typ: ${listingData.propertyType}, ${listingData.roomType}
- Kapazität: ${listingData.personCapacity} Gäste, ${listingData.bedrooms || 'N/A'} Schlafzimmer
- Bewertung: ${listingData.rating.guestSatisfaction}/5 (${listingData.rating.reviewsCount} Bewertungen)
- Einzelbewertungen: Genauigkeit ${listingData.rating.accuracy}/5, Sauberkeit ${listingData.rating.cleanliness}/5, Lage ${listingData.rating.location}/5, Preis-Leistung ${listingData.rating.value}/5
- Host: ${listingData.host.name}${listingData.host.isSuperHost ? ' (Superhost)' : ''}
- Antwortrate: ${listingData.host.responseRate || 'N/A'}
- Antwortzeit: ${listingData.host.responseTime || 'N/A'}
- Preis: €${listingData.price.amount} pro ${listingData.price.qualifier}
- Verfügbare Ausstattung: ${listingData.availableAmenities || 'Keine Details verfügbar'}
- Aktuelle Saison: ${listingData.currentSeason}

WICHTIG: 
- Verwende KEINE erfundenen Konkurrenz- oder Marktdaten
- Fokussiere dich auf ECHTE Verbesserungen basierend auf den vorhandenen Listing-Daten
- ALLE Empfehlungen, Vorschläge und Texte müssen komplett auf DEUTSCH sein
- Keine englischen Wörter oder gemischtsprachigen Empfehlungen verwenden
- Zielgruppe sind deutsche Airbnb-Hosts und -Gäste

TITEL-ANALYSE SPEZIFISCH:
- Analysiere den aktuellen Titel: "${listingData.title}"
- Identifiziere spezifische Schwächen: Redundanz, fehlende Location, fehlende Features
- Gib konkrete Verbesserungsvorschläge basierend auf den echten Listing-Daten
- Beispiel: Wenn Titel "Private Privatzimmer" enthält → "Redundanz entfernen, Location hinzufügen"

Erstelle praktische deutsche Optimierungsempfehlungen im folgenden JSON-Format:

{
  "listingOptimization": {
    "titleScore": 75,
    "titleSuggestions": [
      "Fügen Sie lokale Highlights hinzu (z.B. '5 Min zum Hauptbahnhof')",
      "Erwähnen Sie besondere Features (z.B. 'Balkon mit Stadtblick')"
    ],
    "descriptionScore": 68,
    "descriptionImprovements": [
      "Beschreiben Sie die Nachbarschaft detaillierter",
      "Erwähnen Sie nahegelegene Restaurants oder Sehenswürdigkeiten",
      "Fügen Sie praktische Infos wie WLAN-Geschwindigkeit hinzu"
    ],
    "photoScore": 72,
    "photoRecommendations": [
      "Zeigen Sie alle Räume, besonders das Badezimmer",
      "Fotografieren Sie bei Tageslicht für hellere Aufnahmen",
      "Fügen Sie ein Foto der Nachbarschaft hinzu"
    ],
    "amenityScore": 70,
    "missingAmenities": [
      "Fön (wird oft erwartet)",
      "Bügeleisen (praktisch für Geschäftsreisende)",
      "Kaffeemaschine (beliebtes Extra)"
    ]
  },
  "hostCredibility": {
    "currentScore": 82,
    "improvementTips": [
      "Vervollständigen Sie Ihr Host-Profil mit Foto und Beschreibung",
      "Antworten Sie innerhalb einer Stunde auf Anfragen",
      "Sammeln Sie mehr Bewertungen für Vertrauensaufbau"
    ],
    "superhostBenefits": [
      "20% höhere Buchungsrate als normale Hosts",
      "Frühere Auszahlung von Einnahmen",
      "Prioritärer Kundenservice von Airbnb"
    ]
  },
  "seasonalOptimization": {
    "currentSeason": "${listingData.currentSeason}",
    "seasonalTips": [
      "${listingData.currentSeason === 'Sommer' ? 'Erwähnen Sie Klimaanlage oder Ventilator in der Beschreibung' : 
       listingData.currentSeason === 'Winter' ? 'Betonen Sie warme Heizung und gemütliche Atmosphäre' :
       listingData.currentSeason === 'Frühling' ? 'Heben Sie nahegelegene Parks und Frühlingsfeste hervor' :
       'Erwähnen Sie herbstliche Aktivitäten und warme Getränke'}",
      "Passen Sie Fotos an die Jahreszeit an",
      "Erwähnen Sie saisonale Attraktionen in der Umgebung"
    ],
    "pricingHints": [
      "${listingData.currentSeason === 'Sommer' ? 'Hauptsaison: Preise um 15-25% erhöhen' :
       listingData.currentSeason === 'Winter' ? 'Winterrabatte anbieten für längere Aufenthalte' :
       'Übergangszeiten: Flexible Stornierungsrichtlinien anbieten'}",
      "Wochenende-Zuschläge von 20-30% sind üblich",
      "Mindestaufenthalt von 2 Nächten für bessere Rentabilität"
    ]
  },
  "ratingImprovement": {
    "currentStrengths": [
      "${listingData.rating.cleanliness >= 4.5 ? 'Ausgezeichnete Sauberkeit (' + listingData.rating.cleanliness + '/5)' : ''}",
      "${listingData.rating.location >= 4.5 ? 'Hervorragende Lage (' + listingData.rating.location + '/5)' : ''}",
      "${listingData.rating.accuracy >= 4.5 ? 'Sehr genaue Listing-Beschreibung (' + listingData.rating.accuracy + '/5)' : ''}"
    ].filter(Boolean),
    "improvementAreas": [
      "${listingData.rating.value < 4.5 ? 'Preis-Leistung verbessern (derzeit ' + listingData.rating.value + '/5)' : ''}",
      "${listingData.rating.cleanliness < 4.5 ? 'Sauberkeitsstandards erhöhen (derzeit ' + listingData.rating.cleanliness + '/5)' : ''}",
      "${listingData.rating.accuracy < 4.5 ? 'Listing-Beschreibung präziser gestalten (derzeit ' + listingData.rating.accuracy + '/5)' : ''}"
    ].filter(Boolean),
    "guestExperienceTips": [
      "Willkommensnachricht mit lokalen Empfehlungen senden",
      "Kleine Aufmerksamkeiten bereitstellen (Kaffee, Snacks)",
      "Detaillierte Anleitung für Check-in und lokale Gegebenheiten"
    ]
  },
  "amenityGapAnalysis": {
    "criticalGaps": [
      "Schnelles WLAN (für Geschäftsreisende essentiell)",
      "Grundausstattung Küche (Töpfe, Pfannen, Geschirr)",
      "Frische Handtücher und Bettwäsche"
    ],
    "budgetFriendlyUpgrades": [
      "Fön für 20-30€",
      "Kaffeemaschine für 50-80€",
      "Bügeleisen und -brett für 30-40€",
      "Zusätzliche Kissen und Decken"
    ],
    "highImpactAdditions": [
      "Smart-TV mit Netflix/Prime (moderne Gäste erwarten das)",
      "Arbeitsplatz mit gutem Licht (für Remote Work)",
      "Willkommenskorb mit lokalen Produkten"
    ]
  }
}

Antworte ausschließlich im JSON-Format ohne zusätzliche Erklärungen. Konzentriere dich auf REALISTISCHE und UMSETZBARE Empfehlungen für deutsche Gäste.`
}