/**
 * @file German UI Text Constants for DACH Market
 * @description Centralized German localization constants for ListingBoost Pro
 * @created 2025-07-21
 * @todo F004-01A - German text constants foundation
 */

export const GERMAN_UI = {
  // Navigation & Menu Items
  navigation: {
    dashboard: 'Dashboard',
    listings: 'Inseraten',
    analytics: 'Analysen',
    einstellungen: 'Einstellungen',
    profil: 'Profil',
    abmelden: 'Abmelden',
    hilfe: 'Hilfe',
    support: 'Support',
    dokumentation: 'Dokumentation',
  },

  // Layout & Common Elements
  layout: {
    willkommen: 'Willkommen bei ListingBoost Pro',
    willkommenZurueck: 'Willkommen zurück',
    suchePlatzhalter: 'Suchen...',
    loading: 'Wird geladen...',
    fehler: 'Fehler',
    erfolgreich: 'Erfolgreich',
    speichern: 'Speichern',
    abbrechen: 'Abbrechen',
    loeschen: 'Löschen',
    bearbeiten: 'Bearbeiten',
    hinzufuegen: 'Hinzufügen',
    schliessen: 'Schließen',
    oeffnen: 'Öffnen',
    mehr: 'Mehr',
    weniger: 'Weniger',
  },

  // User Interface Elements
  ui: {
    benutzerMenu: 'Benutzermenü',
    profilAnzeigen: 'Profil anzeigen',
    kontoEinstellungen: 'Kontoeinstellungen',
    benachrichtigungen: 'Benachrichtigungen',
    spracheAendern: 'Sprache ändern',
    themaAendern: 'Design ändern',
    logout: 'Abmelden',
    loginErforderlich: 'Anmeldung erforderlich',
    zugriffVerweigert: 'Zugriff verweigert',
  },

  // Form Labels & Placeholders
  forms: {
    pflichtfeld: 'Pflichtfeld',
    optional: 'Optional',
    name: 'Name',
    email: 'E-Mail-Adresse',
    passwort: 'Passwort',
    passwortBestaetigen: 'Passwort bestätigen',
    telefon: 'Telefonnummer',
    adresse: 'Adresse',
    stadt: 'Stadt',
    postleitzahl: 'Postleitzahl',
    land: 'Land',
    beschreibung: 'Beschreibung',
    titel: 'Titel',
    kategorie: 'Kategorie',
    preis: 'Preis',
    waehrung: 'Währung',
  },

  // Status & State Messages
  status: {
    aktiv: 'Aktiv',
    inaktiv: 'Inaktiv',
    ausstehend: 'Ausstehend',
    abgeschlossen: 'Abgeschlossen',
    abgebrochen: 'Abgebrochen',
    entwurf: 'Entwurf',
    veroeffentlicht: 'Veröffentlicht',
    archiviert: 'Archiviert',
    gesperrt: 'Gesperrt',
    genehmigt: 'Genehmigt',
    abgelehnt: 'Abgelehnt',
  },

  // Dashboard Sections
  dashboard: {
    uebersicht: 'Übersicht',
    schnellaktionen: 'Schnellaktionen',
    recenteAktivitaet: 'Letzte Aktivitäten',
    statistiken: 'Statistiken',
    leistung: 'Leistung',
    benachrichtigungen: 'Benachrichtigungen',
    aufgaben: 'Aufgaben',
    kalender: 'Kalender',
    berichte: 'Berichte',
    einstellungen: 'Einstellungen',
  },

  // Error & Success Messages
  messages: {
    fehlerAufgetreten: 'Ein Fehler ist aufgetreten',
    erfolgreichGespeichert: 'Erfolgreich gespeichert',
    erfolgreichAktualisiert: 'Erfolgreich aktualisiert',
    erfolgreichGeloescht: 'Erfolgreich gelöscht',
    netzwerkfehler: 'Netzwerkfehler - Bitte versuchen Sie es später erneut',
    unbekannteFehler: 'Unbekannter Fehler aufgetreten',
    dateiZuGross: 'Datei ist zu groß',
    ungueltigesFormat: 'Ungültiges Dateiformat',
    pflichtfelderAusfuellen: 'Bitte füllen Sie alle Pflichtfelder aus',
    ungueltigeEmail: 'Ungültige E-Mail-Adresse',
    passwortZuKurz: 'Passwort ist zu kurz (mindestens 8 Zeichen)',
    passwoerterStimmenNichtUeberein: 'Passwörter stimmen nicht überein',
  },

  // Time & Date Formats
  time: {
    gerade: 'gerade eben',
    vorEinerMinute: 'vor einer Minute',
    vorMinuten: 'vor {count} Minuten',
    vorEinerStunde: 'vor einer Stunde',
    vorStunden: 'vor {count} Stunden',
    vorEinemTag: 'vor einem Tag',
    vorTagen: 'vor {count} Tagen',
    vorEinerWoche: 'vor einer Woche',
    vorWochen: 'vor {count} Wochen',
    vorEinemMonat: 'vor einem Monat',
    vorMonaten: 'vor {count} Monaten',
    vorEinemJahr: 'vor einem Jahr',
    vorJahren: 'vor {count} Jahren',
  },
} as const

export type GermanUIKeys = keyof typeof GERMAN_UI
export type NavigationKeys = keyof typeof GERMAN_UI.navigation
export type LayoutKeys = keyof typeof GERMAN_UI.layout
export type UIKeys = keyof typeof GERMAN_UI.ui
export type FormKeys = keyof typeof GERMAN_UI.forms
export type StatusKeys = keyof typeof GERMAN_UI.status
export type DashboardKeys = keyof typeof GERMAN_UI.dashboard
export type MessageKeys = keyof typeof GERMAN_UI.messages
export type TimeKeys = keyof typeof GERMAN_UI.time
