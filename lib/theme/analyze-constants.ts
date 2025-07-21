/**
 * @file lib/theme/analyze-constants.ts  
 * @description German UI constants for listing analysis interface
 * @created 2025-07-21
 * @todo FRONTEND-001-01: German localization for analysis workflow
 */

/**
 * 🇩🇪 GERMAN UI CONSTANTS - ANALYSIS INTERFACE
 * 
 * Professional German text for DACH market
 * Optimized for business B2B context
 * Layout-tested for German text expansion (30% longer)
 */

export const ANALYZE_UI = {
  // 🏠 Page Headers & Navigation
  page: {
    title: 'Listing-Analyse',
    subtitle: 'Analysieren Sie Ihre Airbnb-Unterkunft und erhalten Sie detaillierte Insights zur Optimierung Ihrer Vermietung',
    breadcrumb: {
      dashboard: 'Dashboard',
      analyze: 'Analyse',
      results: 'Ergebnisse'
    },
    meta: {
      title: 'Airbnb Listing Analyse - ListingBoost Pro',
      description: 'Professionelle Analyse Ihrer Airbnb-Unterkunft mit KI-gestützten Empfehlungen'
    }
  },

  // 📝 Form Interface
  form: {
    // Main form
    header: {
      title: 'Neue Analyse starten',
      subtitle: 'Geben Sie die URL Ihres Airbnb-Listings ein, um eine umfassende Analyse zu erhalten'
    },
    
    // URL Input
    url: {
      label: 'Airbnb-URL',
      placeholder: 'https://airbnb.com/rooms/123456',
      placeholderLong: 'Airbnb-URL eingeben (z.B. https://airbnb.com/rooms/123456)',
      helper: 'Unterstützte Domains: airbnb.com, airbnb.de, airbnb.fr, airbnb.it, airbnb.es',
      required: 'Airbnb-URL ist erforderlich',
      invalid: 'Bitte geben Sie eine gültige Airbnb-URL ein',
      validating: 'URL wird überprüft...',
      valid: 'Gültige Airbnb-URL erkannt'
    },
    
    // Analysis Type Selection
    analysisType: {
      label: 'Analyse-Typ auswählen',
      quick: {
        title: 'Schnelle Analyse',
        duration: '30 Sekunden',
        description: 'Grundlegende Bewertung mit wichtigsten Kennzahlen',
        features: [
          'Listing-Grunddaten',
          'Preis-Bewertung', 
          'Basis-Empfehlungen',
          'Bewertungsübersicht'
        ]
      },
      comprehensive: {
        title: 'Umfassende Analyse', 
        duration: '90 Sekunden',
        description: 'Detaillierte KI-Analyse mit Marktvergleich und Handlungsempfehlungen',
        features: [
          'Komplette Listing-Analyse',
          'KI-gestützte Bewertungsanalyse',
          'Marktvergleich und Wettbewerb',
          'Detaillierte Handlungsempfehlungen',
          'SEO-Optimierungsvorschläge',
          'Preisoptimierung'
        ],
        recommended: 'Empfohlen'
      }
    },
    
    // Actions
    actions: {
      startAnalysis: 'Analyse starten',
      startQuick: 'Schnelle Analyse starten',
      startComprehensive: 'Umfassende Analyse starten', 
      cancel: 'Abbrechen',
      retry: 'Erneut versuchen',
      reset: 'Zurücksetzen'
    }
  },

  // ⏳ Analysis Progress
  progress: {
    header: {
      title: 'Analyse läuft...',
      subtitle: 'Bitte warten Sie, während wir Ihr Listing analysieren',
      timeRemaining: 'Verbleibende Zeit: {time}'
    },
    
    // Progress Steps
    steps: {
      initialization: {
        title: 'Initialisierung',
        description: 'Analyse wird vorbereitet...'
      },
      dataFetching: {
        title: 'Daten abrufen',
        description: 'Listing-Daten werden von Airbnb abgerufen...'
      },
      processing: {
        title: 'Datenverarbeitung',
        description: 'Listing-Informationen werden verarbeitet...'
      },
      reviewAnalysis: {
        title: 'Bewertungsanalyse',
        description: 'Gästebewertungen werden mit KI analysiert...'
      },
      marketComparison: {
        title: 'Marktvergleich',
        description: 'Vergleichbare Unterkünfte werden analysiert...'
      },
      aiInsights: {
        title: 'KI-Empfehlungen',
        description: 'Personalisierte Empfehlungen werden generiert...'
      },
      finalizing: {
        title: 'Abschluss',
        description: 'Ergebnisse werden zusammengestellt...'
      },
      completed: {
        title: 'Analyse abgeschlossen',
        description: 'Ihre Ergebnisse sind bereit!'
      }
    },
    
    // Status Messages
    status: {
      connecting: 'Verbindung wird hergestellt...',
      processing: 'Wird bearbeitet...',
      analyzing: 'Wird analysiert...',
      generating: 'Wird generiert...',
      completing: 'Wird abgeschlossen...',
      success: 'Erfolgreich abgeschlossen!',
      almostDone: 'Fast fertig...'
    }
  },

  // 📊 Results Interface  
  results: {
    header: {
      title: 'Analyse-Ergebnisse',
      subtitle: 'Detaillierte Insights für Ihr Airbnb-Listing',
      lastUpdated: 'Zuletzt aktualisiert: {date}',
      analysisDate: 'Analysiert am {date}',
      viewFullReport: 'Vollständigen Bericht anzeigen'
    },
    
    // Score Display
    score: {
      overall: 'Gesamtbewertung',
      outOf: 'von {max} Punkten',
      excellent: 'Hervorragend', 
      good: 'Gut',
      fair: 'Befriedigend',
      poor: 'Verbesserungsbedürftig',
      categories: {
        photos: 'Fotos & Präsentation',
        description: 'Beschreibung & Details',
        pricing: 'Preisgestaltung',
        amenities: 'Ausstattung',
        location: 'Lage & Erreichbarkeit',
        reviews: 'Bewertungen & Service'
      }
    },
    
    // Action Items
    recommendations: {
      title: 'Handlungsempfehlungen',
      subtitle: 'Prioritäten zur Optimierung Ihres Listings',
      priority: {
        high: 'Hohe Priorität',
        medium: 'Mittlere Priorität', 
        low: 'Niedrige Priorität'
      },
      impact: {
        high: 'Hoher Einfluss',
        medium: 'Mittlerer Einfluss',
        low: 'Geringer Einfluss'
      },
      effort: {
        low: 'Geringer Aufwand',
        medium: 'Mittlerer Aufwand',
        high: 'Hoher Aufwand'
      }
    },
    
    // Export Options
    export: {
      title: 'Ergebnisse exportieren',
      pdf: 'Als PDF herunterladen',
      excel: 'Als Excel exportieren',
      csv: 'Als CSV exportieren',
      share: 'Link teilen',
      email: 'Per E-Mail versenden'
    }
  },

  // ⚠️ Error Handling
  errors: {
    // General Errors
    general: {
      title: 'Ein Fehler ist aufgetreten',
      subtitle: 'Bitte versuchen Sie es erneut oder kontaktieren Sie den Support',
      retry: 'Erneut versuchen',
      contact: 'Support kontaktieren'
    },
    
    // URL Errors
    url: {
      required: 'Bitte geben Sie eine Airbnb-URL ein',
      invalid: 'Die eingegebene URL ist nicht gültig',
      notAirbnb: 'Bitte geben Sie eine gültige Airbnb-URL ein',
      notFound: 'Das Listing konnte nicht gefunden werden',
      private: 'Dieses Listing ist privat und kann nicht analysiert werden',
      blocked: 'Zugriff auf dieses Listing ist gesperrt'
    },
    
    // Analysis Errors
    analysis: {
      timeout: 'Die Analyse dauert zu lange. Bitte versuchen Sie es mit der schnellen Analyse.',
      serverError: 'Server-Fehler bei der Analyse. Bitte versuchen Sie es später erneut.',
      rateLimited: 'Zu viele Anfragen. Bitte warten Sie {minutes} Minuten.',
      dataError: 'Fehler beim Abrufen der Listing-Daten',
      processingError: 'Fehler bei der Datenverarbeitung',
      aiError: 'KI-Analyse konnte nicht abgeschlossen werden'
    },
    
    // Network Errors
    network: {
      offline: 'Sie sind offline. Bitte überprüfen Sie Ihre Internetverbindung.',
      timeout: 'Verbindungszeit überschritten. Bitte versuchen Sie es erneut.',
      serverUnavailable: 'Service ist vorübergehend nicht verfügbar'
    }
  },

  // 💡 Feature Overview
  features: {
    quick: {
      title: 'Schnelle Analyse',
      description: 'Erhalten Sie in wenigen Sekunden grundlegende Insights zu Ihrem Listing',
      icon: '⚡'
    },
    comprehensive: {
      title: 'Umfassende Bewertung', 
      description: 'Detaillierte Analyse mit KI-gestützten Empfehlungen und Marktvergleich',
      icon: '📊'
    },
    recommendations: {
      title: 'Handlungsempfehlungen',
      description: 'Konkrete Tipps zur Optimierung Ihres Listings und Steigerung der Buchungen',
      icon: '💡'
    }
  },

  // 🎯 Call-to-Actions
  cta: {
    getStarted: 'Jetzt starten',
    learnMore: 'Mehr erfahren',
    viewResults: 'Ergebnisse ansehen',
    downloadReport: 'Bericht herunterladen',
    shareResults: 'Ergebnisse teilen',
    upgradeAccount: 'Account upgraden',
    contactSupport: 'Support kontaktieren'
  },

  // 📱 Mobile-Specific
  mobile: {
    navigation: {
      back: 'Zurück',
      menu: 'Menü', 
      close: 'Schließen'
    },
    actions: {
      tapToStart: 'Tippen zum Starten',
      swipeUp: 'Nach oben wischen',
      pullRefresh: 'Zum Aktualisieren ziehen'
    }
  },

  // ⌨️ Keyboard Shortcuts (for power users)
  shortcuts: {
    startAnalysis: 'Strg + Enter',
    focusUrl: 'Strg + L',
    retry: 'Strg + R',
    export: 'Strg + E'
  }
} as const

/**
 * 🔧 UTILITY FUNCTIONS
 */

// Format time remaining
export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} Min`
  }
  return `${remainingSeconds} Sek`
}

// Get progress percentage text
export function getProgressText(percentage: number): string {
  if (percentage >= 95) return ANALYZE_UI.progress.status.almostDone
  if (percentage >= 80) return ANALYZE_UI.progress.status.completing
  if (percentage >= 60) return ANALYZE_UI.progress.status.analyzing
  if (percentage >= 30) return ANALYZE_UI.progress.status.processing
  if (percentage >= 10) return ANALYZE_UI.progress.status.connecting
  return ANALYZE_UI.progress.status.connecting
}

// Type definitions
export type AnalysisType = 'quick' | 'comprehensive'
export type ProgressStep = keyof typeof ANALYZE_UI.progress.steps
export type ErrorType = keyof typeof ANALYZE_UI.errors

export default ANALYZE_UI