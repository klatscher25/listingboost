
## 📊 Database Schema

### **TABELLE: listings**
**Zweck:** Haupttabelle für alle Airbnb-Listing Daten vom Listing-Scraper

**Primärschlüssel & Beziehungen:**
- `id`: UUID, automatisch generiert
- `user_id`: UUID, Referenz zu profiles Tabelle

**Airbnb Identifikation & Rankings:**
- `airbnb_id`: Text, eindeutig, NICHT NULL (z.B. "721435506304471257")
- `airbnb_url`: Text, NICHT NULL
- `home_tier`: Integer (Airbnb-interne Ranking-Stufe, 1-10, niedrigere Zahlen = höheres Ranking)
- `is_available`: Boolean (aktueller Verfügbarkeitsstatus für angefragte Daten)

**App-Integration & Deep Links:**
- `android_link`: Text (Android App Deep-Link, z.B. "airbnb://rooms/29732182")
- `ios_link`: Text (iOS App Deep-Link für bessere Mobile User Experience)

**Titel & SEO-Daten (für Titel-Scoring):**
- `title`: Text (Haupt-Titel)
- `seo_title`: Text (SEO-optimierter Titel, z.B. "Guest room in the heart of Berlin - Condominiums for Rent")
- `meta_description`: Text (Meta-Description für Suchmaschinen und Social Media Previews)
- `sharing_config_title`: Text (Social Media Titel, z.B. "Condo in Berlin · ★4.90 · 1 bedroom")
- `thumbnail_url`: Text (URL zum Haupt-Thumbnail für Listings-Übersichten)

**Beschreibungs-Daten (für Content-Scoring):**
- `description`: Text (Haupt-Beschreibung)
- `html_description`: JSONB (mit HTML-Formatierung)
- `sub_description`: JSONB (strukturierte Kurzbeschreibung)
- `description_language`: Text (z.B. "en-GB", "de")

**Property-Details (für Kategorie-Scoring):**
- `property_type`: Text (z.B. "Entire condo", "Entire rental unit")
- `room_type`: Text (z.B. "Entire home/apt")
- `person_capacity`: Integer (maximale Gästeanzahl)
- `bedroom_count`: Integer (Anzahl Schlafzimmer)
- `bed_count`: Integer (Anzahl Betten)
- `bathroom_count`: Integer (Anzahl Badezimmer)

**Location-Daten (für Location-Scoring):**
- `location`: Text (Stadtname, z.B. "Munich")
- `location_subtitle`: Text (z.B. "Munich, Bavaria, Germany")
- `coordinates_latitude`: Decimal (GPS-Koordinate)
- `coordinates_longitude`: Decimal (GPS-Koordinate)
- `location_descriptions`: JSONB (Verkehrsanbindung, Getting around)
- `breadcrumbs`: JSONB (Navigation-Pfad auf Airbnb)

**Bewertungs-Daten (für Quality-Scoring):**
- `overall_rating`: Decimal (Gesamt-Bewertung, z.B. 5.0)
- `rating_accuracy`: Decimal (Bewertung Genauigkeit)
- `rating_checkin`: Decimal (Bewertung Check-in)
- `rating_cleanliness`: Decimal (Bewertung Sauberkeit)
- `rating_communication`: Decimal (Bewertung Kommunikation)
- `rating_location`: Decimal (Bewertung Lage)
- `rating_value`: Decimal (Bewertung Preis-Leistung)
- `reviews_count`: Integer (Anzahl Bewertungen)

**Host-Daten (für Trust-Scoring):**
- `host_id`: Text (Airbnb Host-ID, z.B. "223679612")
- `host_name`: Text (Name des Hosts)
- `host_profile_image`: Text (URL zum Profilbild)
- `host_is_superhost`: Boolean (Superhost-Status)
- `host_is_verified`: Boolean (Verifiziert-Status)
- `host_response_rate`: Text (z.B. "95%" - extrahiert aus hostDetails)
- `host_response_time`: Text (z.B. "within a few hours" - extrahiert aus hostDetails)
- `host_rating_average`: Decimal (Host-Durchschnittsbewertung aus ratingAverage)
- `host_rating_count`: Integer (Anzahl Host-Bewertungen aus ratingCount)
- `host_time_as_host_months`: Integer (Gesamte Zeit als Host in Monaten - präziser)
- `host_time_as_host_years`: Integer (Jahre als Host - für Schnellübersicht)
- `host_about`: Text (Host-Beschreibung)
- `host_highlights`: JSONB (Host-Highlights Array, z.B. ["Lives in Berlin, Germany"])
- `co_hosts`: JSONB (Array von Co-Hosts mit Details - zuvor ungenutzt)

**Preis-Daten (für Value-Scoring):**
- `price_per_night`: Integer (Preis pro Nacht in Cents)
- `original_price`: Integer (Ursprungspreis vor Rabatt)
- `discounted_price`: Integer (Rabattpreis)
- `price_qualifier`: Text (z.B. "for 3 nights")
- `price_breakdown`: JSONB (komplette Preis-Aufschlüsselung)
- `currency`: Text, Standard 'EUR'

**Bild-Daten (für Photo-Scoring):**
- `thumbnail_url`: Text (Haupt-Thumbnail URL)
- `images`: JSONB (Array aller Bilder mit URLs, captions, orientation)
- `images_count`: Integer (Anzahl der Bilder)

**Ausstattungs-Daten für detailliertes Feature-Scoring:**
- `amenities`: JSONB (komplette Amenities-Struktur von Apify)

**Essential Features:**
- `wifi_available`: Boolean (Internet-Zugang)
- `kitchen_available`: Boolean (Komplette Küche)
- `parking_available`: Boolean (Parkplatz verfügbar)
- `air_conditioning_available`: Boolean (Klimaanlage)
- `heating_available`: Boolean (Heizung)
- `pets_allowed`: Boolean (Haustiere erlaubt)
- `self_checkin_available`: Boolean (Selbst-Check-in)

**Comfort & Convenience:**
- `washer_available`: Boolean (Waschmaschine)
- `dryer_available`: Boolean (Trockner)
- `dishwasher_available`: Boolean (Geschirrspüler)
- `tv_available`: Boolean (Fernseher)
- `hair_dryer_available`: Boolean (Föhn)
- `iron_available`: Boolean (Bügeleisen)
- `dedicated_workspace_available`: Boolean (Arbeitsplatz)
- `private_entrance_available`: Boolean (Privater Eingang)

**Kitchen & Dining:**
- `refrigerator_available`: Boolean (Kühlschrank)
- `stove_available`: Boolean (Herd)
- `microwave_available`: Boolean (Mikrowelle)
- `coffee_maker_available`: Boolean (Kaffeemaschine)
- `toaster_available`: Boolean (Toaster)
- `dining_table_available`: Boolean (Esstisch)
- `cooking_basics_available`: Boolean (Koch-Grundausstattung)

**Safety & Security:**
- `smoke_alarm_available`: Boolean (Rauchmelder)
- `fire_extinguisher_available`: Boolean (Feuerlöscher)
- `first_aid_kit_available`: Boolean (Erste-Hilfe-Kasten)
- `carbon_monoxide_alarm_available`: Boolean (CO-Melder)

**Premium Features:**
- `hot_tub_available`: Boolean (Whirlpool)
- `pool_available`: Boolean (Pool)
- `gym_available`: Boolean (Fitnessstudio)
- `elevator_available`: Boolean (Aufzug)
- `balcony_available`: Boolean (Balkon/Terrasse)

**Host Service Level:**
- `long_term_stays_allowed`: Boolean (Langzeitaufenthalte)
- `instant_book_available`: Boolean (Sofortbuchung)
- `luggage_dropoff_allowed`: Boolean (Gepäckaufbewahrung)

**Family-Friendly:**
- `crib_available`: Boolean (Kinderbett)
- `high_chair_available`: Boolean (Hochstuhl)
- `pack_n_play_available`: Boolean (Reisebett)

**Buchungsregeln (für UX-Scoring):**
- `house_rules`: JSONB (Check-in/out Zeiten, Regeln)
- `cancellation_policies`: JSONB (Stornierungsbedingungen)
- `minimum_stay`: Integer (Mindestaufenthalt in Nächten)
- `maximum_stay`: Integer (Maximalaufenthalt in Nächten)

**Marketing & Highlights (für Marketing-Scoring):**
- `highlights`: JSONB (Listing-Highlights Array mit title, subtitle, icon, type)
- `brand_highlights`: JSONB (Brand-Highlights mit hasGoldenLaurel, Guest favorite Status - zuvor ungenutzt)

**Erweiterte Booking Policies:**
- `cancellation_policies`: JSONB (Detaillierte Stornierungsbedingungen mit Policy-IDs - zuvor ungenutzt)

**Backup & Metadaten:**
- `raw_scraped_data`: JSONB (komplette ursprüngliche Apify-Antwort)
- `last_scraped_at`: Timestamp mit Zeitzone
- `created_at`: Timestamp mit Zeitzone, Standard jetzt
- `updated_at`: Timestamp mit Zeitzone, Standard jetzt

---

### **TABELLE: listing_reviews**
**Zweck:** Individual Review-Daten vom Review-Scraper für Sentiment-Analyse

**Primärschlüssel & Beziehungen:**
- `id`: UUID, automatisch generiert
- `listing_id`: UUID, Referenz zu listings, CASCADE DELETE
- `airbnb_review_id`: Text, eindeutig, NICHT NULL (z.B. "1187002287342743799")

**Review-Identifikation:**
- `start_url`: Text (ursprüngliche Airbnb-URL des Listings)
- `language`: Text (Review-Sprache, z.B. "en")

**Review-Content:**
- `text`: Text (Review-Text in Originalsprache)
- `localized_text`: Text (übersetzter Text falls verfügbar)
- `localized_review`: Text (vollständige übersetzte Review falls verfügbar)
- `rating`: Integer (1-5 Sterne-Bewertung)

**Review-Timing:**
- `created_at_airbnb`: Timestamp mit Zeitzone (Erstellungsdatum auf Airbnb)
- `created_at`: Timestamp mit Zeitzone, Standard jetzt (in unserer DB)

**Reviewer-Daten:**
- `reviewer_id`: Text (Airbnb User-ID des Reviewers)
- `reviewer_first_name`: Text (Vorname des Reviewers)
- `reviewer_host_name`: Text (Host-Name des Reviewers)
- `reviewer_picture_url`: Text (URL zum Profilbild)
- `reviewer_profile_path`: Text (Airbnb-Profil-Pfad)
- `reviewer_profile_picture`: Text (alternative Profilbild-URL)

**Host-Response:**
- `response`: Text (Antwort des Hosts auf Review, falls vorhanden)
- `reviewee_id`: Text (Airbnb Host-ID)
- `reviewee_first_name`: Text (Vorname des Hosts)
- `reviewee_host_name`: Text (Host-Name)
- `reviewee_picture_url`: Text (Host Profilbild-URL)
- `reviewee_profile_path`: Text (Host-Profil-Pfad)
- `reviewee_profile_picture`: Text (alternative Host-Profilbild-URL)

**Review-Kategorisierung:**
- `review_highlight`: Text (z.B. "Stayed a few nights")
- `highlight_type`: Text (z.B. "LENGTH_OF_STAY")
- `rating_accessibility_label`: Text (Accessibility-Label für Rating)

**AI-Sentiment-Analyse (später von Gemini):**
- `sentiment_score`: Decimal (Sentiment-Analyse Ergebnis -1 bis +1)
- `sentiment_category`: Text ("positive", "neutral", "negative")
- `topic_categories`: JSONB (erkannte Themen: cleanliness, location, etc.)
- `quality_indicators`: JSONB (Qualitätsindikatoren für Host-Scoring)
- `emotional_tone`: Text (Tonalität des Reviews)

**Meta-Daten:**
- `raw_scraped_data`: JSONB (komplette ursprüngliche Apify-Antwort)
- `analyzed_at`: Timestamp mit Zeitzone (wann AI-Analyse durchgeführt)

---

### **TABELLE: listing_images**
**Zweck:** Separate Tabelle für detaillierte Bild-Analyse und Photo-Scoring

**Struktur:**
- `id`: UUID, automatisch generiert
- `listing_id`: UUID, Referenz zu listings, CASCADE DELETE
- `image_url`: Text, NICHT NULL (direkte Bild-URL)
- `caption`: Text (z.B. "Living room image 1", "Full kitchen image 2")
- `orientation`: Text ("LANDSCAPE" oder "PORTRAIT")
- `position_order`: Integer (Reihenfolge in der Bildergalerie - wichtig für Scoring)

**AI-Bild-Analyse (später):**
- `ai_analysis`: JSONB (Qualität, Helligkeit, Komposition, etc.)
- `room_category`: Text (automatische Kategorisierung: kitchen, bedroom, etc.)
- `quality_score`: Integer (0-100 Bildqualitäts-Score)
- `lighting_score`: Integer (0-100 Beleuchtungs-Score)
- `composition_score`: Integer (0-100 Kompositions-Score)

**Meta:**
- `created_at`: Timestamp mit Zeitzone, Standard jetzt

---

### **TABELLE: listing_availability**
**Zweck:** Tägliche Verfügbarkeitsdaten vom Availability-Scraper (365 Tage pro Listing)

**Primärschlüssel & Beziehungen:**
- `id`: UUID, automatisch generiert
- `listing_id`: UUID, Referenz zu listings, CASCADE DELETE

**Verfügbarkeits-Daten:**
- `date`: Date, NICHT NULL (spezifisches Datum)
- `available`: Boolean (grundsätzlich verfügbar an diesem Tag)
- `available_for_checkin`: Boolean (Check-in an diesem Tag möglich)
- `available_for_checkout`: Boolean (Check-out an diesem Tag möglich)

**Preis-Daten für diesen Tag (falls verfügbar):**
- `price_per_night`: Integer (Tagespreis in Cents, kann variieren)
- `minimum_stay`: Integer (Mindestaufenthalt ab diesem Tag)
- `currency`: Text, Standard 'EUR'

**Buchungs-Einschränkungen:**
- `blocked_reason`: Text (Grund für Nicht-Verfügbarkeit: "booked", "blocked", "maintenance")
- `special_event`: Text (besondere Ereignisse die Preise beeinflussen)
- `seasonal_pricing`: Boolean (saisonale Preisgestaltung aktiv)

**Meta-Daten:**
- `scraped_at`: Timestamp mit Zeitzone, Standard jetzt
- `data_source`: Text, Standard 'apify-availability-scraper'

**Eindeutigkeits-Constraint:**
- `listing_id + date` UNIQUE (ein Eintrag pro Listing pro Tag)

---

### **TABELLE: price_checks**
**Zweck:** Historische Preis-Verfolgung und Verfügbarkeit vom Availability-Scraper

**Struktur:**
- `id`: UUID, automatisch generiert
- `listing_id`: UUID, Referenz zu listings

**Preis-Anfrage:**
- `check_in_date`: Date (angefragtes Check-in Datum)
- `check_out_date`: Date (angefragtes Check-out Datum)
- `guest_count`: Integer (Anzahl Gäste für Preisanfrage)

**Preis-Ergebnisse:**
- `price_per_night`: Integer (Preis pro Nacht in Cents)
- `total_price`: Integer (Gesamtpreis für Aufenthalt in Cents)
- `original_price`: Integer (Preis vor Rabatten)
- `discounted_price`: Integer (Preis nach Rabatten)
- `is_available`: Boolean (war für diese Daten verfügbar)
- `currency`: Text, Standard 'EUR'

**Competitor-Vergleich (vom Location-Scraper):**
- `avg_competitor_price`: Integer (Durchschnittspreis ähnlicher Listings)
- `competitor_count`: Integer (Anzahl verglichener Listings)
- `price_position`: Text ("above_average", "competitive", "below_average")
- `price_percentile`: Integer (Preis-Perzentil 0-100)
- `market_context`: JSONB (Marktkontext aus location_competitors)

**Verfügbarkeits-Details:**
- `booking_restrictions`: JSONB (eventuelle Buchungseinschränkungen)
- `minimum_stay_required`: Integer (erforderliche Mindestaufenthaltsdauer)
- `instant_book_available`: Boolean (Sofortbuchung verfügbar)

**Meta:**
- `checked_at`: Timestamp mit Zeitzone, Standard jetzt
- `raw_scraped_data`: JSONB (komplette Apify-Antwort)

---

### **TABELLE: location_competitors**
**Zweck:** Competitor-Listings vom Location-Scraper für Marktanalyse und Preis-Benchmarking

**Primärschlüssel & Beziehungen:**
- `id`: UUID, automatisch generiert
- `search_location`: Text, NICHT NULL (gesuchte Stadt/Gebiet, z.B. "London", "Munich")
- `airbnb_id`: Text, NICHT NULL (z.B. "14926879")

**Basis-Listing-Daten:**
- `title`: Text (Listing-Titel)
- `description`: Text (Kurzbeschreibung)
- `description_language`: Text (z.B. "en")
- `url`: Text (Airbnb-URL)
- `thumbnail`: Text (Haupt-Bild URL)
- `android_link`: Text (App Deep-Link)
- `ios_link`: Text (App Deep-Link)

**Property-Details für Vergleichbarkeit:**
- `room_type`: Text (z.B. "Entire home/apt")
- `person_capacity`: Integer (Gästekapazität)
- `bedroom_count`: Integer (aus subDescription extrahiert)
- `bed_count`: Integer (aus subDescription extrahiert)
- `bathroom_count`: Integer (aus subDescription extrahiert)
- `property_type`: Text (aus subDescription extrahiert)

**Location-Daten:**
- `coordinates_latitude`: Decimal
- `coordinates_longitude`: Decimal
- `location_descriptions`: JSONB (Neighborhood highlights, Getting around)

**Bewertungs-Daten für Benchmarking:**
- `overall_rating`: Decimal (guestSatisfaction)
- `rating_accuracy`: Decimal
- `rating_checkin`: Decimal
- `rating_cleanliness`: Decimal
- `rating_communication`: Decimal
- `rating_location`: Decimal
- `rating_value`: Decimal
- `reviews_count`: Integer

**Host-Informationen:**
- `host_id`: Text
- `host_name`: Text
- `host_is_superhost`: Boolean
- `host_profile_image`: Text
- `host_highlights`: JSONB
- `host_about`: JSONB
- `co_hosts`: JSONB

**Preis-Daten für Markt-Benchmarking:**
- `price_per_night`: Integer (in Cents)
- `price_amount`: Text (formatierter Preis, z.B. "$107")
- `price_qualifier`: Text (z.B. "night")
- `price_breakdown`: JSONB (detaillierte Preis-Aufschlüsselung)
- `cleaning_fee`: Integer (Reinigungsgebühr in Cents)
- `service_fee`: Integer (Service-Gebühr in Cents)
- `total_before_taxes`: Integer (Gesamt vor Steuern in Cents)
- `currency`: Text, Standard 'USD' (Location-Scraper nutzt oft USD)

**Ausstattungs-Daten für Feature-Vergleich:**
- `amenities`: JSONB (komplette Amenities-Struktur)
- `wifi_available`: Boolean
- `kitchen_available`: Boolean
- `parking_available`: Boolean
- `air_conditioning_available`: Boolean
- `pets_allowed`: Boolean
- `self_checkin_available`: Boolean

**Buchungsregeln für Vergleichbarkeit:**
- `house_rules`: JSONB (Check-in/out, Regeln)
- `minimum_stay`: Integer (falls verfügbar)
- `instant_book_available`: Boolean (falls verfügbar)

**Marketing-Features:**
- `highlights`: JSONB (Listing-Highlights)
- `home_tier`: Integer (Airbnb-Ranking)

**Marktanalyse-Daten:**
- `distance_to_center_km`: Decimal (Entfernung zum Stadtzentrum)
- `neighborhood`: Text (Stadtteil)
- `locale`: Text (z.B. "en")
- `language`: Text (z.B. "en")

**Meta-Daten:**
- `scraped_at`: Timestamp mit Zeitzone, Standard jetzt
- `search_parameters`: JSONB (verwendete Suchparameter)
- `data_source`: Text, Standard 'apify-location-scraper'
- `raw_scraped_data`: JSONB (komplette ursprüngliche Antwort)

**Eindeutigkeits-Constraint:**
- `search_location + airbnb_id + scraped_at::date` UNIQUE (ein Eintrag pro Listing pro Suche pro Tag)

---

### **TABELLE: listing_scores**
**Zweck:** AI-Bewertungen und Scoring-Ergebnisse (Struktur wird später definiert)

**Identifikation:**
- `id`: UUID, automatisch generiert
- `listing_id`: UUID, Referenz zu listings

**Scoring-Platzhalter (Details werden später festgelegt):**
- `overall_score`: Integer (Gesamtscore, Bereich wird definiert)
- `category_scores`: JSONB (flexible Struktur für verschiedene Scoring-Kategorien)
- `scoring_details`: JSONB (detaillierte Metriken und Berechnungen)

**AI-Analyse Daten:**
- `gemini_analysis_raw`: Text (komplette Gemini-Antwort)
- `improvement_recommendations`: JSONB (strukturierte Empfehlungen)
- `analysis_summary`: JSONB (Zusammenfassung der Analyse)

**Scoring-Metadaten:**
- `scored_at`: Timestamp mit Zeitzone, Standard jetzt
- `gemini_model_version`: Text, Standard 'gemini-2.5-flash'
- `scoring_version`: Text (Version des Scoring-Algorithmus)
- `scoring_methodology`: Text (verwendete Scoring-Methodik)

---

### **Datentyp-Definitionen für JSONB-Felder:**

#### **images Format:**
```json
[
  {
    "caption": "Living room image 1",
    "imageUrl": "https://a0.muscache.com/pictures/...",
    "orientation": "LANDSCAPE"
  }
]
```

#### **amenities Format:**
```json
[
  {
    "title": "Kitchen and dining",
    "values": [
      {
        "title": "Kitchen",
        "subtitle": "Space where guests can cook their own meals",
        "icon": "SYSTEM_COOKING_BASICS",
        "available": true
      }
    ]
  }
]
```

#### **improvement_recommendations Format:**
```json
[
  {
    "category": "title",
    "priority": "high",
    "current_score": 85,
    "max_score": 150,
    "issue": "Titel zu kurz für SEO",
    "suggestion": "Füge 'Modern' und 'Zentral' hinzu",
    "impact": "+25 Punkte",
    "difficulty": "easy"
  }
]
```

#### **topic_categories Format (für Reviews):**
```json
{
  "cleanliness": 0.8,
  "location": 0.9,
  "communication": 0.7,
  "check_in": 0.6,
  "amenities": 0.8
}
```

---

### **Constraints & Validierung:**

**Eindeutigkeits-Constraints:**
- `listings.airbnb_id` UNIQUE
- `listing_reviews.airbnb_review_id` UNIQUE
- `listing_images.listing_id + position_order` UNIQUE
- `listing_availability.listing_id + date` UNIQUE
- `location_competitors.search_location + airbnb_id + scraped_at::date` UNIQUE

**Wertebereiche:**
- Alle `rating_*` Felder: 0.0 bis 5.0
- `person_capacity`: > 0
- `sentiment_score`: -1.0 bis +1.0
- Boolean-Felder: true/false/null

**Performance-Indices für schnelle Queries:**
- `listings.user_id` (User findet seine Listings)
- `listings.airbnb_id` (Lookup via Airbnb-ID)
- `listings.overall_rating` (Sortierung nach Rating)
- `listing_reviews.listing_id` (alle Reviews eines Listings)
- `listing_reviews.rating` (Reviews nach Bewertung)
- `listing_scores.overall_score` (Ranking-Queries)
- `listing_scores.listing_id` (Score-Lookup)
- `price_checks.listing_id + checked_at` (Preis-Historie)
- `listing_images.listing_id + position_order` (Bilder-Reihenfolge)
- `listing_availability.listing_id + date` (Verfügbarkeit-Lookup)
- `listing_availability.date + available` (freie Tage finden)
- `location_competitors.search_location + scraped_at` (Marktdaten-Lookup)
- `location_competitors.airbnb_id` (Competitor-Lookup)
- `location_competitors.price_per_night` (Preis-Benchmarking)

---

### **Integration zwischen allen Scrapern:**

**Marktanalyse-Funktionen:**
- Automatische Competitor-Analyse für neue Listings
- Preis-Benchmarking gegen lokale Konkurrenz
- Feature-Vergleich (Amenities, Host-Qualität, etc.)
- Standort-basierte Scoring-Adjustments

**Datenvolumen-Planung:**
- **listings**: 1 Eintrag pro analysiertes Listing
- **listing_reviews**: ~50-200 Reviews pro Listing
- **listing_availability**: 365 Einträge pro Listing pro Jahr
- **location_competitors**: ~100 Listings pro Stadt pro Scraping
- **price_checks**: Variable Anzahl für Preis-Tracking

TABELLE: profiles
Zweck: Haupttabelle für User-Management (wird in listings.user_id referenziert)
Primärschlüssel & Identifikation:

id: UUID, automatisch generiert
email: Text, eindeutig, NICHT NULL

Profil-Daten:

full_name: Text (vollständiger Name)
avatar_url: Text (Profilbild-URL, z.B. Cloudinary)
timezone: Text, Standard 'Europe/Berlin'
language: Text, Standard 'de' (für Lokalisierung)

User Experience & Settings:

onboarding_completed: Boolean, Standard false
marketing_emails_enabled: Boolean, Standard true

Meta-Daten:

created_at: Timestamp mit Zeitzone, Standard jetzt
updated_at: Timestamp mit Zeitzone, Standard jetzt


TABELLE: organizations
Zweck: Team-Features und Multi-User-Support (für spätere Skalierung)
Primärschlüssel & Beziehungen:

id: UUID, automatisch generiert
owner_id: UUID, Referenz zu profiles, CASCADE DELETE

Organisation-Details:

name: Text, NICHT NULL (Firmenname)
slug: Text, eindeutig, NICHT NULL (URL-freundlicher Identifier)

Meta-Daten:

created_at: Timestamp mit Zeitzone, Standard jetzt


TABELLE: organization_members
Zweck: Team-Mitgliedschaft und Rollen-Management
Primärschlüssel & Beziehungen:

id: UUID, automatisch generiert
organization_id: UUID, Referenz zu organizations, CASCADE DELETE
user_id: UUID, Referenz zu profiles, CASCADE DELETE

Rollen & Berechtigungen:

role: Text, Standard 'member' ("owner", "admin", "member")

Einladungs-Management:

invited_at: Timestamp mit Zeitzone, Standard jetzt
joined_at: Timestamp mit Zeitzone (null bis Einladung angenommen)

Eindeutigkeits-Constraint:

organization_id + user_id UNIQUE (eine Mitgliedschaft pro User pro Organisation)


TABELLE: subscriptions
Zweck: Subscription-Management für SaaS-Billing
Primärschlüssel & Beziehungen:

id: UUID, automatisch generiert
user_id: UUID, Referenz zu profiles, CASCADE DELETE

Stripe-Integration:

stripe_subscription_id: Text, eindeutig
stripe_customer_id: Text (Stripe Customer-ID)

Plan-Management:

plan_type: Text, NICHT NULL ("freemium", "starter", "growth", "pro")
status: Text, NICHT NULL ("active", "canceled", "past_due", "incomplete")

Billing-Zyklen:

current_period_start: Timestamp mit Zeitzone
current_period_end: Timestamp mit Zeitzone
cancel_at_period_end: Boolean, Standard false

Meta-Daten:

created_at: Timestamp mit Zeitzone, Standard jetzt
updated_at: Timestamp mit Zeitzone, Standard jetzt


TABELLE: payments
Zweck: Payment-Tracking und Rechnungshistorie
Primärschlüssel & Beziehungen:

id: UUID, automatisch generiert
user_id: UUID, Referenz zu profiles, CASCADE DELETE
subscription_id: UUID, Referenz zu subscriptions, SET NULL

Stripe-Payment-Details:

stripe_payment_intent_id: Text, eindeutig
amount_cents: Integer, NICHT NULL (Betrag in Cents)
currency: Text, Standard 'EUR'

Payment-Status & Typ:

status: Text, NICHT NULL ("succeeded", "failed", "pending")
payment_type: Text, NICHT NULL ("subscription", "one_time")
description: Text (Zahlungsbeschreibung)

Timing:

paid_at: Timestamp mit Zeitzone
created_at: Timestamp mit Zeitzone, Standard jetzt


TABELLE: usage_tracking
Zweck: Verbrauchsmonitoring für Plan-Limits und Fair-Use
Primärschlüssel & Beziehungen:

id: UUID, automatisch generiert
user_id: UUID, Referenz zu profiles, CASCADE DELETE
subscription_id: UUID, Referenz zu subscriptions, SET NULL

Usage-Daten:

resource_type: Text, NICHT NULL ("listing_analysis", "api_call", "dashboard_refresh", "competitor_check")
count: Integer, Standard 1 (Anzahl der Nutzungen)
date: Date, Standard heute

Zusätzliche Metadaten:

metadata: JSONB (zusätzliche Kontext-Daten)
created_at: Timestamp mit Zeitzone, Standard jetzt

Eindeutigkeits-Constraint:

user_id + resource_type + date UNIQUE (ein Eintrag pro User pro Ressource pro Tag)


TABELLE: api_keys
Zweck: API-Schlüssel-Management für Pro-Plan
Primärschlüssel & Beziehungen:

id: UUID, automatisch generiert
user_id: UUID, Referenz zu profiles, CASCADE DELETE

API-Key-Details:

name: Text, NICHT NULL (benutzerfreundlicher Name)
key_hash: Text, eindeutig, NICHT NULL (gehashter API-Key für Sicherheit)
prefix: Text, NICHT NULL (erste 8 Zeichen für UI-Anzeige)

Berechtigungen & Sicherheit:

permissions: JSONB, Standard '[]' (Array von Berechtigungen)
last_used_at: Timestamp mit Zeitzone
expires_at: Timestamp mit Zeitzone
is_active: Boolean, Standard true

Meta-Daten:

created_at: Timestamp mit Zeitzone, Standard jetzt


TABELLE: notifications
Zweck: In-App-Benachrichtigungen und User-Kommunikation
Primärschlüssel & Beziehungen:

id: UUID, automatisch generiert
user_id: UUID, Referenz zu profiles, CASCADE DELETE

Notification-Content:

type: Text, NICHT NULL ("listing_analyzed", "price_alert", "competitor_change", "subscription_expiring")
title: Text, NICHT NULL (Notification-Titel)
message: Text (detaillierte Nachricht)

Daten & Status:

data: JSONB (zusätzliche Daten wie listing_id, URLs, etc.)
read_at: Timestamp mit Zeitzone (null = ungelesen)

Meta-Daten:

created_at: Timestamp mit Zeitzone, Standard jetzt


TABELLE: audit_logs
Zweck: System-Audit und Compliance-Tracking
Primärschlüssel & Beziehungen:

id: UUID, automatisch generiert
user_id: UUID, Referenz zu profiles, SET NULL (für System-Actions)

Audit-Details:

action: Text, NICHT NULL ("listing_created", "subscription_changed", "payment_processed")
resource_type: Text ("listing", "subscription", "user", "api_key")
resource_id: UUID (ID der betroffenen Ressource)

Change-Tracking:

old_values: JSONB (vorherige Werte)
new_values: JSONB (neue Werte)

Request-Kontext:

ip_address: INET (Client-IP)
user_agent: Text (Browser/Client-Info)

Meta-Daten:

created_at: Timestamp mit Zeitzone, Standard jetzt


TABELLE: support_tickets
Zweck: Kundenservice und Support-Management
Primärschlüssel & Beziehungen:

id: UUID, automatisch generiert
user_id: UUID, Referenz zu profiles, CASCADE DELETE

Ticket-Content:

subject: Text, NICHT NULL (Betreff)
description: Text, NICHT NULL (Problem-Beschreibung)

Status & Priorität:

status: Text, Standard 'open' ("open", "in_progress", "resolved", "closed")
priority: Text, Standard 'normal' ("low", "normal", "high", "urgent")

Support-Team:

assigned_to: Text (Support-Team Member)

Meta-Daten:

created_at: Timestamp mit Zeitzone, Standard jetzt
updated_at: Timestamp mit Zeitzone, Standard jetzt


TABELLE: waitlist
Zweck: Pre-Launch-Marketing und Lead-Generation
Primärschlüssel & Marketing:

id: UUID, automatisch generiert
email: Text, eindeutig, NICHT NULL

Marketing-Attribution:

source: Text ("landing_page", "referral", "social_media")
utm_source: Text (UTM-Parameter für Tracking)
utm_campaign: Text (Kampagnen-Tracking)

Conversion-Tracking:

converted_to_user: Boolean, Standard false

Meta-Daten:

created_at: Timestamp mit Zeitzone, Standard jetzt


TABELLE: plan_limits
Zweck: Definition der Plan-Beschränkungen und Features
Plan-Definition:

plan_type: Text, PRIMÄRSCHLÜSSEL ("freemium", "starter", "growth", "pro")

Nutzungslimits:

max_listings: Integer (maximale Anzahl Listings)
max_api_calls_per_month: Integer (API-Limit für Pro-Plan)
max_dashboard_refreshes_per_month: Integer (Dashboard Refresh-Limit)

Feature-Set:

features: JSONB (Array verfügbarer Features wie "competitor_tracking", "api_access", "priority_support")


---

### **TABELLE: analysis_results** ✅
**Zweck:** AI-Analyse-Resultate und Insights-Caching für Freemium & Premium Features  
**Status:** ✅ Produktiv erstellt (2025-07-22 Migration)

**Primärschlüssel & Beziehungen:**
- `id`: UUID, automatisch generiert
- `user_id`: UUID, NICHT NULL, Referenz zu profiles (CASCADE DELETE)
- `listing_id`: UUID, Referenz zu listings (CASCADE DELETE, optional für freemium)

**Analyse-Kategorisierung:**
- `analysis_type`: TEXT, NICHT NULL ("full", "freemium", "quick", "competitor")
- `status`: TEXT, Standard 'pending' ("pending", "processing", "completed", "failed")

**AI-Analyse-Daten (Gemini & GPT Integration):**
- `ai_insights`: TEXT (JSON string mit strukturierten KI-Empfehlungen)
- `gemini_response`: TEXT (Raw Gemini API Response für Debugging)
- `processing_error`: TEXT (Fehlermeldung bei gescheiterten Analysen)

**Performance-Tracking:**
- `processing_started_at`: TIMESTAMPTZ (Start der AI-Verarbeitung)
- `processing_completed_at`: TIMESTAMPTZ (Ende der AI-Verarbeitung)
- `processing_duration_seconds`: INTEGER (Verarbeitungsdauer für Optimierung)

**Metadaten & Caching:**
- `metadata`: JSONB, Standard '{}' (Freemium-Token, Caching-Info, etc.)
- `created_at`: TIMESTAMPTZ, Standard NOW()
- `updated_at`: TIMESTAMPTZ, Standard NOW() (mit Update-Trigger)

**Indizes für Performance:**
```sql
CREATE INDEX idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX idx_analysis_results_listing_id ON analysis_results(listing_id);
CREATE INDEX idx_analysis_results_type ON analysis_results(analysis_type);
CREATE INDEX idx_analysis_results_status ON analysis_results(status);
CREATE INDEX idx_analysis_results_created ON analysis_results(created_at);
CREATE INDEX idx_analysis_results_metadata ON analysis_results USING GIN(metadata);
```

**Row Level Security (RLS):**
- Aktiviert mit User-basierten Policies
- Users können nur eigene analysis_results sehen/bearbeiten
- System kann über Service-Role alle Operationen durchführen

**Verwendung:**
- **Freemium Flow**: Caching von AI-Insights für 30-Tage-Wiederverwendung
- **Premium Features**: Vollständige Analyse-Historien und Vergleiche
- **Performance**: Vermeidet Doppel-Analysen durch intelligentes Caching

---

🔧 Schema-Erweiterungen für bestehende Tabellen
Erweiterung: listings
Zusätzliche Felder für SaaS-Integration:
Organisation & Archivierung:

organization_id: UUID, Referenz zu organizations (für Team-Features)
is_archived: Boolean, Standard false

Status-Tracking:

analysis_status: Text, Standard 'pending' ("pending", "analyzing", "completed", "failed")


📈 Performance-Indizes für SaaS-Features
Kritische Indizes für Performance:

subscriptions.user_id + status (aktive Subscriptions finden)
usage_tracking.user_id + date (tägliche Nutzung aggregieren)
notifications.user_id + read_at (ungelesene Notifications)
audit_logs.user_id + created_at (Audit-Historie)
api_keys.key_hash (API-Key-Lookup, nur aktive)

Eindeutigkeits-Constraints Zusammenfassung:

profiles.email UNIQUE
organizations.slug UNIQUE
organization_members.organization_id + user_id UNIQUE
subscriptions.stripe_subscription_id UNIQUE
payments.stripe_payment_intent_id UNIQUE
usage_tracking.user_id + resource_type + date UNIQUE
api_keys.key_hash UNIQUE
waitlist.email UNIQUE
plan_limits.plan_type PRIMARY KEY


🛡️ Security & Compliance Überlegungen
Row Level Security (RLS):

Alle User-bezogenen Tabellen sollten RLS aktiviert haben
Policies basierend auf auth.uid() für User-Isolation

Daten-Retention:

audit_logs: 2 Jahre aufbewahren
notifications: 6 Monate nach read_at löschen
support_tickets: Unbegrenzt für Compliance

GDPR-Compliance:

Alle Tabellen mit user_id müssen CASCADE DELETE unterstützen
audit_logs kann SET NULL verwenden für System-Actions