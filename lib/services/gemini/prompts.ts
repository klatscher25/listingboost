/**
 * @file lib/services/gemini/prompts.ts
 * @description AI analysis prompts for Gemini service
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from analyzer.ts for CLAUDE.md compliance
 */

/**
 * Create sentiment analysis prompt for reviews
 */
export function createSentimentAnalysisPrompt(
  reviews: string[],
  language: string = 'de'
): string {
  return `
Du bist ein Experte für Airbnb-Bewertungsanalyse. Analysiere die folgenden Gästebewertungen und erstelle eine detaillierte Sentiment-Analyse.

**Bewertungen:**
${reviews
  .slice(0, 20)
  .map((review, idx) => `${idx + 1}. ${review}`)
  .join('\n')}

**Aufgabe:**
Analysiere diese Bewertungen und erstelle ein JSON-Objekt mit folgender Struktur:

{
  "overallSentiment": "positive/neutral/negative",
  "positiveAspects": ["Aspekt 1", "Aspekt 2", ...],
  "negativeAspects": ["Aspekt 1", "Aspekt 2", ...],
  "commonThemes": ["Thema 1", "Thema 2", ...],
  "guestSatisfactionDrivers": ["Treiber 1", "Treiber 2", ...],
  "improvementAreas": ["Bereich 1", "Bereich 2", ...],
  "emotionalTone": "enthusiastic/satisfied/disappointed/frustrated",
  "specificComplaints": ["Beschwerde 1", "Beschwerde 2", ...],
  "specificPraises": ["Lob 1", "Lob 2", ...],
  "confidenceScore": 0.85
}

**Wichtige Hinweise:**
- Fokussiere auf deutsche Bewertungen und deutsche Antworten
- Achte auf wiederkehrende Themen und Muster
- Identifiziere spezifische Verbesserungsmöglichkeiten
- Bewerte die Zuverlässigkeit deiner Analyse (confidenceScore)
- Nutze nur Informationen aus den gegebenen Bewertungen

Antworte nur mit dem JSON-Objekt, ohne zusätzlichen Text.
`
}

/**
 * Create description analysis prompt
 */
export function createDescriptionAnalysisPrompt(
  title: string,
  description: string,
  propertyType: string,
  location?: string
): string {
  return `
Du bist ein Experte für Airbnb-Listing-Optimierung. Analysiere Titel und Beschreibung dieser Unterkunft.

**Listing-Details:**
- Titel: "${title}"
- Beschreibung: "${description}"
- Immobilienart: "${propertyType}"
${location ? `- Lage: "${location}"` : ''}

**Aufgabe:**
Erstelle eine detaillierte Analyse und liefere ein JSON-Objekt:

{
  "titleAnalysis": {
    "clarity": 8,
    "appeal": 7,
    "keywords": ["keyword1", "keyword2"],
    "improvements": ["Verbesserung 1", "Verbesserung 2"],
    "lengthOptimal": true
  },
  "descriptionAnalysis": {
    "completeness": 6,
    "engagement": 7,
    "structure": 8,
    "missingElements": ["Element 1", "Element 2"],
    "strengths": ["Stärke 1", "Stärke 2"],
    "improvements": ["Verbesserung 1", "Verbesserung 2"]
  },
  "keywordOptimization": {
    "currentKeywords": ["keyword1", "keyword2"],
    "suggestedKeywords": ["suggested1", "suggested2"],
    "localKeywords": ["lokal1", "lokal2"]
  },
  "competitiveAdvantage": ["Vorteil 1", "Vorteil 2"],
  "confidenceScore": 0.88
}

**Bewertungskriterien:**
- Clarity: Ist der Titel klar und verständlich? (1-10)
- Appeal: Wie ansprechend ist der Titel? (1-10)
- Completeness: Wie vollständig ist die Beschreibung? (1-10)
- Engagement: Wie einladend ist der Text? (1-10)
- Structure: Ist der Text gut strukturiert? (1-10)

Antworte nur mit dem JSON-Objekt.
`
}

/**
 * Create amenity gap analysis prompt
 */
export function createAmenityGapAnalysisPrompt(
  currentAmenities: any[],
  propertyType: string,
  location?: string,
  priceRange?: string
): string {
  const amenitiesString = currentAmenities
    .map((amenity) =>
      typeof amenity === 'object'
        ? `${amenity.name || amenity.title}: ${amenity.available ? 'Ja' : 'Nein'}`
        : amenity
    )
    .join(', ')

  return `
Du bist ein Experte für Airbnb-Ausstattungsanalyse. Analysiere die aktuelle Ausstattung und identifiziere Lücken.

**Unterkunfts-Details:**
- Typ: "${propertyType}"
${location ? `- Lage: "${location}"` : ''}
${priceRange ? `- Preisbereich: "${priceRange}"` : ''}
- Aktuelle Ausstattung: ${amenitiesString}

**Aufgabe:**
Erstelle eine Lückenanalyse und liefere ein JSON-Objekt:

{
  "missingEssentials": [
    {
      "name": "WLAN",
      "importance": "critical",
      "impactOnBookings": 95,
      "costToImplement": "low",
      "timeToImplement": "immediate"
    }
  ],
  "missingComfort": [
    {
      "name": "Klimaanlage",
      "importance": "high",
      "impactOnBookings": 75,
      "costToImplement": "medium",
      "timeToImplement": "1-2 weeks"
    }
  ],
  "luxuryUpgrades": [
    {
      "name": "Hot Tub",
      "importance": "nice-to-have",
      "impactOnBookings": 40,
      "costToImplement": "high",
      "timeToImplement": "1-2 months"
    }
  ],
  "competitiveGaps": ["Gap 1", "Gap 2"],
  "priorityRecommendations": [
    {
      "amenity": "WLAN",
      "reason": "Essentiell für 95% der Gäste",
      "roi": "sehr hoch",
      "priority": 1
    }
  ],
  "confidenceScore": 0.92
}

**Bewertungskriterien:**
- Importance: critical/high/medium/low/nice-to-have
- Impact: Wahrscheinlicher Einfluss auf Buchungen (0-100%)
- Cost: low/medium/high
- Time: immediate/days/weeks/months

Berücksichtige deutsche Marktstandards und Gästeerwartungen.

Antworte nur mit dem JSON-Objekt.
`
}

/**
 * Create pricing analysis prompt
 */
export function createPricingAnalysisPrompt(
  currentPrice: number,
  propertyType: string,
  amenities: string[],
  location?: string,
  seasonality?: string
): string {
  return `
Du bist ein Experte für Airbnb-Preisoptimierung. Analysiere die aktuelle Preisstrategie.

**Unterkunfts-Details:**
- Aktueller Preis: €${currentPrice} pro Nacht
- Typ: "${propertyType}"
- Ausstattung: ${amenities.join(', ')}
${location ? `- Lage: "${location}"` : ''}
${seasonality ? `- Saison: "${seasonality}"` : ''}

**Aufgabe:**
Erstelle eine Preisanalyse und liefere ein JSON-Objekt:

{
  "priceAssessment": {
    "currentPrice": ${currentPrice},
    "marketPosition": "below/at/above market",
    "competitiveness": 7.5,
    "valuePerception": 8.2
  },
  "recommendedPricing": {
    "basePrice": 85,
    "weekendPremium": 1.2,
    "seasonalAdjustments": {
      "summer": 1.3,
      "winter": 0.9,
      "holidays": 1.5
    },
    "lastMinuteDiscount": 0.85
  },
  "pricingStrategy": {
    "approach": "dynamic/fixed/hybrid",
    "keyFactors": ["Faktor 1", "Faktor 2"],
    "riskAssessment": "low/medium/high"
  },
  "revenueProjection": {
    "currentAnnualRevenue": 12000,
    "optimizedAnnualRevenue": 15600,
    "potentialIncrease": "30%"
  },
  "actionableInsights": [
    "Insight 1",
    "Insight 2"
  ],
  "confidenceScore": 0.85
}

**Berücksichtige:**
- Deutsche Marktverhältnisse
- Saisonale Schwankungen
- Konkurrenzsituation
- Ausstattungsqualität

Antworte nur mit dem JSON-Objekt.
`
}

/**
 * Create optimization recommendations prompt
 */
export function createOptimizationPrompt(
  data: any,
  analysisResults: any
): string {
  return `
Du bist ein Airbnb-Optimierungsexperte. Basierend auf allen verfügbaren Daten, erstelle konkrete Handlungsempfehlungen.

**Verfügbare Daten:**
- Listing-Details: ${JSON.stringify(data, null, 2).substring(0, 500)}...
- Bisherige Analysen: ${JSON.stringify(analysisResults, null, 2).substring(0, 500)}...

**Aufgabe:**
Erstelle konkrete Optimierungsempfehlungen als JSON-Objekt:

{
  "immediateActions": [
    {
      "action": "WLAN-Verfügbarkeit in Titel erwähnen",
      "category": "titel",
      "impact": "high",
      "effort": "low",
      "timeline": "heute",
      "expectedOutcome": "+15% mehr Klicks"
    }
  ],
  "shortTermImprovements": [
    {
      "action": "Professionelle Fotos anfertigen lassen",
      "category": "fotos",
      "impact": "high",
      "effort": "medium",
      "timeline": "1-2 Wochen",
      "expectedOutcome": "+25% höhere Conversion"
    }
  ],
  "longTermStrategies": [
    {
      "action": "Klimaanlage installieren",
      "category": "ausstattung",
      "impact": "medium",
      "effort": "high",
      "timeline": "1-2 Monate",
      "expectedOutcome": "+€200 monatliches Plus"
    }
  ],
  "priorityMatrix": {
    "highImpactLowEffort": ["Action 1", "Action 2"],
    "highImpactHighEffort": ["Action 3"],
    "lowImpactLowEffort": ["Action 4"]
  },
  "overallStrategy": "Fokus auf schnelle Gewinne, dann strukturelle Verbesserungen",
  "confidenceScore": 0.91
}

**Kategorien:**
- titel, beschreibung, fotos, preise, ausstattung, service, marketing

**Impact:** high/medium/low
**Effort:** low/medium/high
**Timeline:** heute/diese-woche/1-2-wochen/1-2-monate

Fokussiere auf den deutschen Markt und realisierbare Verbesserungen.

Antworte nur mit dem JSON-Objekt.
`
}

/**
 * Create German Airbnb analysis prompt for AI insights
 */
export function createGermanAirbnbPrompt(
  listingData: any,
  analysisType: string = 'comprehensive'
): string {
  return `
Du bist ein Experte für Airbnb-Optimierung im deutschen Markt. Analysiere dieses Listing und erstelle personalisierte deutsche Verbesserungsvorschläge.

**Listing-Daten:**
${JSON.stringify(listingData, null, 2).substring(0, 2000)}...

**Aufgabe:**
Erstelle eine detaillierte deutsche Analyse als JSON-Objekt:

{
  "listingOptimization": {
    "titleScore": 75,
    "titleSuggestions": ["Verbesserung 1", "Verbesserung 2"],
    "descriptionScore": 68,
    "descriptionImprovements": ["Verbesserung 1", "Verbesserung 2"],
    "photoScore": 80,
    "photoRecommendations": ["Empfehlung 1", "Empfehlung 2"],
    "amenityScore": 72,
    "missingAmenities": ["WLAN", "Klimaanlage"]
  },
  "hostCredibility": {
    "currentScore": 85,
    "improvementTips": ["Tipp 1", "Tipp 2"],
    "superhostBenefits": ["Vorteil 1", "Vorteil 2"]
  },
  "seasonalOptimization": {
    "currentSeason": "Winter",
    "seasonalTips": ["Tipp 1", "Tipp 2"],
    "pricingHints": ["Hinweis 1", "Hinweis 2"]
  },
  "ratingImprovement": {
    "currentStrengths": ["Stärke 1", "Stärke 2"],
    "improvementAreas": ["Bereich 1", "Bereich 2"],
    "guestExperienceTips": ["Tipp 1", "Tipp 2"]
  },
  "amenityGapAnalysis": {
    "criticalGaps": ["WLAN", "Heizung"],
    "budgetFriendlyUpgrades": ["Upgrade 1", "Upgrade 2"],
    "highImpactAdditions": ["Addition 1", "Addition 2"]
  }
}

**Wichtige Hinweise:**
- Alle Texte auf Deutsch
- Fokus auf deutsche Marktgegebenheiten
- Konkrete, umsetzbare Vorschläge
- Realistische Bewertungen (20-100 Punkte)
- Berücksichtige DACH-Region (Deutschland, Österreich, Schweiz)

Antworte nur mit dem JSON-Objekt.
`
}
