# ListingBoost Pro - 1000 Punkte Scoring System v3.0 - Finale Version

## 🎯 Überblick

Dieses Dokument definiert das vollständige 1000-Punkte Scoring-System für ListingBoost Pro. Jeder Score-Faktor ist mit präzisen Datenquellen und Berechnungslogik dokumentiert.

### Datenquellen-Legende:
- **Scraper 1**: Airbnb URL Scraper (Hauptdaten eines Listings)
- **Scraper 2**: Airbnb Review Scraper (Individual-Reviews)
- **Scraper 3**: Airbnb Availability Scraper (365 Tage Verfügbarkeit)
- **Scraper 4**: Airbnb Location Scraper (bis zu 100 Competitor-Listings)
- **Google Maps API**: Optionale Integration für Location-Daten
- **Google Gemini API**: AI-Analyse für Sentiment und Textqualität
- **Self-Report**: Nutzer-Eingabe im Dashboard für nicht verfügbare Daten

### Score-Interpretation:
- **900-1000 Punkte**: Elite Performer (Top 1%, Platz 1-3)
- **800-899 Punkte**: High Performer (Top 5%, erste Seite)
- **700-799 Punkte**: Good Performer (Top 20%, Seite 1-2)
- **600-699 Punkte**: Average Performer (Seite 2-3)
- **500-599 Punkte**: Below Average (Seite 3-5)
- **Unter 500**: Poor Performer

---

## 📊 1. Host Performance & Trust (180 Punkte)

### 1.1 Superhost Status (40 Punkte)
- **40 Punkte**: Aktiver Superhost
- **0 Punkte**: Kein Superhost
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `host_is_superhost` (Boolean)
- **Berechnung**: `IF host_is_superhost = true THEN 40 ELSE 0`

### 1.2 Response Rate (30 Punkte)
- **30 Punkte**: 100% Antwortrate
- **27 Punkte**: 90-99%
- **20 Punkte**: 80-89%
- **10 Punkte**: 70-79%
- **0 Punkte**: <70% oder nicht verfügbar
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `host_response_rate` (String mit %)
- **Berechnung**: `CAST(REPLACE(host_response_rate, '%', '') AS INT)`

### 1.3 Response Time (25 Punkte)
- **25 Punkte**: "within an hour"
- **20 Punkte**: "within a few hours"
- **10 Punkte**: "within a day"
- **0 Punkte**: Länger/nicht verfügbar
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `host_response_time` (String)
- **Berechnung**: String-Matching

### 1.4 Host Verification (20 Punkte)
- **20 Punkte**: Vollständig verifiziert (alle Badges)
- **15 Punkte**: Email + Phone + ID
- **10 Punkte**: Email + Phone
- **5 Punkte**: Nur Email
- **0 Punkte**: Nicht verifiziert
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `host_is_verified` (Boolean), `host_verification_badges` (Array)
- **Hinweis**: Verifizierungsstufen müssen aus Badges extrahiert werden

### 1.5 Host Experience (25 Punkte)
- **25 Punkte**: 5+ Jahre
- **20 Punkte**: 3-4 Jahre
- **15 Punkte**: 2 Jahre
- **10 Punkte**: 1 Jahr
- **5 Punkte**: 6-11 Monate
- **0 Punkte**: <6 Monate
- **Datenquelle**: Scraper 1
- **Benötigtes Felder**: `host_time_as_host_years` (Integer), `host_time_as_host_months` (Integer)

### 1.6 Host Rating (20 Punkte)
- **20 Punkte**: 5.0 Sterne
- **18 Punkte**: 4.8-4.9
- **15 Punkte**: 4.5-4.7
- **10 Punkte**: 4.0-4.4
- **5 Punkte**: 3.5-3.9
- **0 Punkte**: <3.5
- **Datenquelle**: Scraper 1
- **Benötigtes Felder**: `host_rating_average` (Decimal), `host_rating_count` (Integer)

### 1.7 Profile Completeness (20 Punkte)
- **8 Punkte**: Profilbild vorhanden
- **7 Punkte**: About-Text >100 Zeichen
- **5 Punkte**: Highlights definiert
- **Datenquelle**: Scraper 1
- **Benötigte Felder**: `host_profile_image` (String), `host_about` (Text), `host_highlights` (Array)

### 1.8 Multiple Listings Performance (20 Punkte)
- **20 Punkte**: Alle Listings 4.8+
- **15 Punkte**: Durchschnitt >4.5
- **10 Punkte**: Durchschnitt >4.0
- **5 Punkte**: Einige problematische
- **0 Punkte**: Mehrere schlechte
- **Datenquelle**: Scraper 1 (mehrfach für alle Listings des Hosts)
- **Benötigtes Feld**: `host_id` für Lookup, dann `overall_rating` aller Listings
- **Berechnung**: AVG(overall_rating) WHERE host_id = X

**Co-Host Indikator** (0 Punkte, nur Information)
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `co_hosts` (Array)

---

## 📊 2. Guest Satisfaction & Reviews (200 Punkte)

### 2.1 Overall Rating (45 Punkte)
- **45 Punkte**: 4.9-5.0
- **40 Punkte**: 4.8
- **35 Punkte**: 4.6-4.7
- **25 Punkte**: 4.4-4.5
- **15 Punkte**: 4.0-4.3
- **5 Punkte**: 3.5-3.9
- **0 Punkte**: <3.5
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `overall_rating` (Decimal)

### 2.2 Review Count & Velocity (30 Punkte)
**Anzahl (20 Punkte)**:
- 100+ Reviews: 20
- 50-99: 15
- 20-49: 10
- 10-19: 5
- <10: 0
**Aktualität (10 Punkte)**:
- 5+ in 60 Tagen: 10
- 3-4: 7
- 1-2: 4
- 0: 0
- **Datenquelle**: Scraper 1 + Scraper 2
- **Benötigte Felder**: `reviews_count` (Integer), `created_at_airbnb` (Timestamp) von Reviews

### 2.3 Rating Distribution (25 Punkte)
- **25 Punkte**: 90%+ 5-Sterne
- **20 Punkte**: 80-89%
- **15 Punkte**: 70-79%
- **10 Punkte**: 60-69%
- **0 Punkte**: <60%
- **Datenquelle**: Scraper 2
- **Benötigtes Feld**: `rating` (Integer) aller Reviews
- **Berechnung**: COUNT(rating=5) / COUNT(*)

### 2.4 Guest Sentiment Analysis (30 Punkte)
- **30 Punkte**: Sentiment 0.8-1.0
- **25 Punkte**: 0.6-0.79
- **15 Punkte**: 0.4-0.59
- **5 Punkte**: 0.2-0.39
- **0 Punkte**: <0.2
- **Datenquelle**: Scraper 2 + Google Gemini API
- **Benötigte Felder**: `text` (Review-Text) → Gemini → `sentiment_score`
- **Gemini-Prompt**: "Analyze sentiment of this review on scale -1 to 1"

### 2.5 Response to Reviews (20 Punkte)
- **20 Punkte**: 80%+ beantwortet
- **15 Punkte**: 60-79%
- **10 Punkte**: 40-59%
- **5 Punkte**: 20-39%
- **0 Punkte**: <20%
- **Datenquelle**: Scraper 2
- **Benötigtes Feld**: `response` (Text - NULL wenn nicht beantwortet)
- **Berechnung**: COUNT(response NOT NULL) / COUNT(*)

### 2.6 Category Ratings (50 Punkte)
- **Accuracy** (10): (rating_accuracy/5)*10
- **Check-in** (10): (rating_checkin/5)*10
- **Cleanliness** (10): (rating_cleanliness/5)*10
- **Communication** (10): (rating_communication/5)*10
- **Location** (5): (rating_location/5)*5
- **Value** (5): (rating_value/5)*5
- **Datenquelle**: Scraper 1
- **Benötigte Felder**: Alle `rating_*` Felder (Decimal)

---

## 📊 3. Listing Content & Optimization (180 Punkte)

### 3.1 Title Optimization (25 Punkte)
- **10 Punkte**: Länge 40-50 Zeichen (optimal)
- **10 Punkte**: Location-Keywords vorhanden
- **5 Punkte**: Unique Selling Points erwähnt
- **Datenquelle**: Scraper 1 + Google Gemini API
- **Benötigtes Feld**: `title` (String)
- **Keywords TODO**: Location-spezifische Keywords definieren
  - München: "Zentral", "Altstadt", "U-Bahn", "Marienplatz"
  - Berlin: "Mitte", "Prenzlberg", "Kreuzberg", "S-Bahn"
- **Gemini-Analyse**: "Rate this Airbnb title for SEO and appeal"

### 3.2 Description Quality (30 Punkte)
- **15 Punkte**: 500+ Zeichen
- **10 Punkte**: Keywords eingebaut
- **5 Punkte**: Gut strukturiert
- **Datenquelle**: Scraper 1 + Google Gemini API
- **Benötigte Felder**: `description` (Text), `html_description` (JSONB)
- **Gemini-Analyse**: "Analyze description quality and keyword usage"

### 3.3 HTML Description (25 Punkte)
- **25 Punkte**: Vollständige HTML-Formatierung
- **15 Punkte**: Basis-Formatierung
- **0 Punkte**: Nur Plain-Text
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `html_description` (JSONB)
- **Prüfung**: Contains <p>, <ul>, <strong>, <h3> tags

### 3.4 Highlights Usage (30 Punkte)
- **30 Punkte**: 3+ Highlights
- **20 Punkte**: 2 Highlights
- **10 Punkte**: 1 Highlight
- **0 Punkte**: Keine
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `highlights` (Array)

### 3.5 Location Descriptions (25 Punkte)
- **15 Punkte**: Neighborhood description >200 chars
- **10 Punkte**: Getting around description >100 chars
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `location_descriptions` (JSONB)

### 3.6 House Rules Definition (20 Punkte)
- **20 Punkte**: Strukturierte Regeln
- **10 Punkte**: Basis-Regeln
- **0 Punkte**: Keine/unklar
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `house_rules` (JSONB)

### 3.7 Meta Description (25 Punkte)
- **25 Punkte**: Erste 155 Zeichen optimiert für Klicks
- **15 Punkte**: Guter Anfang aber nicht optimiert
- **0 Punkte**: Schwacher Start
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `description` (erste 155 Zeichen)
- **Hinweis**: Airbnb nutzt die ersten Zeilen als Meta-Description

---

## 📊 4. Visual Presentation (120 Punkte)

### 4.1 Photo Quantity (30 Punkte)
- **30 Punkte**: 30+ Fotos
- **25 Punkte**: 20-29
- **20 Punkte**: 15-19
- **10 Punkte**: 10-14
- **0 Punkte**: <10
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `images_count` (Integer)

### 4.2 Photo Orientation Mix (30 Punkte)
- **30 Punkte**: 60-80% Landscape (Desktop/Mobile Balance)
- **20 Punkte**: 50-59% oder 81-90%
- **10 Punkte**: <50% oder >90%
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `images` (Array mit orientation)
- **Berechnung**: COUNT(orientation='LANDSCAPE') / COUNT(*)

### 4.3 Photo Captions (30 Punkte)
- **30 Punkte**: 80%+ mit Captions
- **20 Punkte**: 50-79%
- **10 Punkte**: 20-49%
- **0 Punkte**: <20%
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `images` (Array mit caption)
- **Berechnung**: COUNT(caption NOT NULL AND LENGTH>10) / COUNT(*)

### 4.4 Photo Technical Quality (30 Punkte)
- **15 Punkte**: Hochauflösend (>1920px Breite)
- **15 Punkte**: Alle Räume abgedeckt
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `images` (Array mit imageUrl)
- **Hinweis**: Technische Analyse der Bildgrößen aus URLs

---

## 📊 5. Property Features & Amenities (140 Punkte)

### 5.1 Essential Amenities (50 Punkte)
- **15 Punkte**: WiFi
- **15 Punkte**: Küche
- **10 Punkte**: Heizung
- **10 Punkte**: Essentials (Handtücher, Bettwäsche)
- **Datenquelle**: Scraper 1
- **Benötigte Felder**: `wifi_available`, `kitchen_available`, `heating_available`, `amenities` (JSONB)

### 5.2 Comfort Amenities (40 Punkte)
- **10 Punkte**: Klimaanlage
- **10 Punkte**: Waschmaschine
- **8 Punkte**: Geschirrspüler
- **7 Punkte**: TV
- **5 Punkte**: Bügeleisen
- **Datenquelle**: Scraper 1
- **Benötigte Felder**: Alle `*_available` Boolean-Felder

### 5.3 Work Features (25 Punkte)
- **15 Punkte**: Arbeitsplatz
- **10 Punkte**: High-Speed WiFi erwähnt
- **Datenquelle**: Scraper 1
- **Benötigte Felder**: `dedicated_workspace_available`, `description` (für WiFi-Speed)

### 5.4 Premium Features (25 Punkte)
- **8 Punkte**: Pool/Whirlpool
- **8 Punkte**: Fitnessstudio
- **5 Punkte**: Balkon/Terrasse
- **4 Punkte**: Besondere Features
- **Datenquelle**: Scraper 1
- **Benötigte Felder**: `pool_available`, `hot_tub_available`, `gym_available`, `balcony_available`

---

## 📊 6. Pricing Strategy (100 Punkte)

### 6.1 Competitive Base Pricing (40 Punkte)
- **40 Punkte**: 5-10% unter Markt (bei gleicher Qualität)
- **35 Punkte**: Marktpreis (±5%)
- **25 Punkte**: 5-15% über Markt
- **10 Punkte**: 15-25% über Markt
- **0 Punkte**: >25% über Markt
- **Datenquelle**: Scraper 1 + Scraper 4
- **Benötigte Felder**: `price_per_night` (eigenes), `price_per_night` (Competitors)
- **Berechnung**: Vergleich mit ähnlichen Listings (gleiche Größe, Amenities)

### 6.2 Dynamic Pricing (20 Punkte)
- **20 Punkte**: Intelligente Preisvariation (>20% Spread)
- **15 Punkte**: Moderate Variation (10-20%)
- **10 Punkte**: Wenig Variation (5-10%)
- **0 Punkte**: Statische Preise oder keine Daten
- **Datenquelle**: Scraper 3 ODER Self-Report
- **Benötigtes Feld**: `price_per_night` über 365 Tage
- **Alternative**: User gibt im Dashboard an ob Dynamic Pricing aktiv

### 6.3 Seasonal Pricing (20 Punkte)
- **20 Punkte**: Saisonale Anpassungen erkennbar
- **10 Punkte**: Einige Anpassungen
- **0 Punkte**: Keine oder keine Daten
- **Datenquelle**: Scraper 3 ODER Self-Report
- **Benötigtes Feld**: `seasonal_pricing` Flag oder Preisanalyse
- **Alternative**: User-Eingabe im Dashboard

### 6.4 Long-Stay Discounts (20 Punkte)
- **10 Punkte**: Wochenrabatt (7-15%)
- **10 Punkte**: Monatsrabatt (20-40%)
- **Datenquelle**: Scraper 1 ODER Self-Report
- **Benötigtes Feld**: `price_breakdown` (wenn verfügbar)
- **Alternative**: User gibt Rabatte im Dashboard ein

---

## 📊 7. Availability & Booking (80 Punkte)

### 7.1 Occupancy Balance (30 Punkte)
- **30 Punkte**: 60-80% Auslastung (optimal)
- **25 Punkte**: 50-59% oder 81-90%
- **15 Punkte**: 30-49% oder 91-95%
- **5 Punkte**: 10-29% oder 96-99%
- **0 Punkte**: <10% (zu wenig) oder 100% (überlastet)
- **Datenquelle**: Scraper 3
- **Benötigtes Feld**: `available` (Boolean) für 365 Tage
- **Berechnung**: 1 - (COUNT(available=true) / 365)
- **Hinweis**: Mittlere Auslastung ist optimal, nicht hohe Verfügbarkeit!

### 7.2 Instant Book (25 Punkte)
- **25 Punkte**: Instant Book aktiviert
- **0 Punkte**: Nur auf Anfrage
- **Datenquelle**: Self-Report (nicht im Scraper)
- **Alternative**: User gibt im Dashboard an

### 7.3 Booking Window (15 Punkte)
- **15 Punkte**: 365 Tage buchbar
- **10 Punkte**: 180-364 Tage
- **5 Punkte**: 90-179 Tage
- **0 Punkte**: <90 Tage
- **Datenquelle**: Scraper 3
- **Benötigtes Feld**: `date` (maximales Datum)

### 7.4 Minimum Stay Flexibility (10 Punkte)
- **10 Punkte**: 1-2 Nächte
- **7 Punkte**: 3 Nächte
- **3 Punkte**: 4-6 Nächte
- **0 Punkte**: 7+ Nächte
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `minimum_stay` (Integer)

---

## 📊 8. Location & Market Position (60 Punkte)

### 8.1 Location Rating (20 Punkte)
- **20 Punkte**: 5.0 Location-Rating
- **18 Punkte**: 4.8-4.9
- **15 Punkte**: 4.5-4.7
- **10 Punkte**: 4.0-4.4
- **0 Punkte**: <4.0
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `rating_location` (Decimal)

### 8.2 Transit Accessibility (20 Punkte)
- **20 Punkte**: <500m zu U-/S-Bahn
- **15 Punkte**: <1km zu ÖPNV
- **10 Punkte**: <2km zu ÖPNV
- **5 Punkte**: >2km aber ÖPNV erreichbar
- **0 Punkte**: Schlechte Anbindung
- **Datenquelle**: Google Maps API ODER Scraper 1
- **Benötigtes Feld**: `coordinates_latitude/longitude` → Maps API
- **Alternative**: Analyse von `location_descriptions`

### 8.3 Market Position (20 Punkte)
- **20 Punkte**: Top 10% (Rating/Preis-Verhältnis)
- **15 Punkte**: Top 25%
- **10 Punkte**: Top 50%
- **5 Punkte**: Untere 50%
- **0 Punkte**: Bottom 25%
- **Datenquelle**: Scraper 4
- **Benötigte Felder**: Alle Competitors mit `overall_rating` und `price_per_night`
- **Berechnung**: Ranking nach (rating / price) Score

---

## 📊 9. Business Performance (40 Punkte)

### 9.1 Booking Momentum (20 Punkte)
- **20 Punkte**: Täglich neue Buchungen
- **15 Punkte**: Wöchentlich
- **10 Punkte**: Monatlich
- **5 Punkte**: Selten
- **0 Punkte**: Stagnierend
- **Datenquelle**: Scraper 3 (Zeitreihe)
- **Benötigtes Feld**: `available` Änderungen über Zeit
- **Berechnung**: Availability-Änderungen = Buchungen

### 9.2 Review Velocity (20 Punkte)
- **20 Punkte**: Wöchentlich neue Reviews
- **15 Punkte**: Monatlich
- **10 Punkte**: Alle 2-3 Monate
- **5 Punkte**: Seltener
- **0 Punkte**: >6 Monate keine
- **Datenquelle**: Scraper 2
- **Benötigtes Feld**: `created_at_airbnb` aller Reviews
- **Berechnung**: Durchschnittlicher Abstand zwischen Reviews

---

## 📊 10. Trust & Safety (40 Punkte)

### 10.1 Safety Features (20 Punkte)
- **8 Punkte**: Rauchmelder
- **6 Punkte**: CO-Melder
- **6 Punkte**: Erste-Hilfe + Feuerlöscher
- **Datenquelle**: Scraper 1
- **Benötigte Felder**: `smoke_alarm_available`, `carbon_monoxide_alarm_available`, `first_aid_kit_available`

### 10.2 Verification Requirements (10 Punkte)
- **10 Punkte**: Angemessene Gäste-Requirements
- **5 Punkte**: Zu streng/zu locker
- **0 Punkte**: Nicht definiert
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `house_rules` (Analyse der Requirements)

### 10.3 Professional Indicators (10 Punkte)
- **10 Punkte**: Business-/Lizenz-Nummer angegeben
- **0 Punkte**: Keine professionellen Indikatoren
- **Datenquelle**: Scraper 1
- **Benötigtes Feld**: `description` (Text-Analyse)

---


---

## 🔧 Technische Umsetzung

1. Airbnb URL Scraper - get details for one specific listing

2. Airbnb Review Scraper - get the review detaisl for one specific listing

3. Airbnb Availailbity Scraper - returns for each day of the next 365 if listing is available - just for one specific listig

4. Airbnb Location Scraper - returns up to 100 listings for a specific location

### Datensammlung Reihenfolge:
1. **Scraper 1**: Basis-Listing-Daten
2. **Scraper 4**: Marktvergleich (nur wenn Location match)
3. **Scraper 2**: Reviews (kann parallel laufen)
4. **Scraper 3**: Availability (kann parallel laufen)
5. **Gemini API**: Text-Analysen
6. **Google Maps** (optional): Transit-Daten
7. **Self-Report**: Dashboard-Eingaben

### Fallback-Strategien:
- Fehlende Daten = 0 Punkte (mit Hinweis)
- Self-Report Option für wichtige fehlende Daten
- Teilpunkte bei unvollständigen Daten
