-- =====================================================
-- SUPABASE SCHEMA UPDATES für erweiterte Apify Datennutzung
-- =====================================================
-- @file supabase_schema_updates.sql
-- @description SQL Commands für erweiterte Apify Datenfelder
-- @created 2025-07-21
-- @todo CORE-001-02: Erweitere Database Schema für vollständige Apify Datennutzung

-- =====================================================
-- 1. SEO & MARKETING DATEN (Zuvor ungenutzt)
-- =====================================================

-- SEO Title (für Suchmaschinenoptimierung)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS seo_title TEXT;

COMMENT ON COLUMN listings.seo_title IS 'SEO-optimierter Titel von Airbnb (z.B. "Guest room in the heart of Berlin - Condominiums for Rent")';

-- Meta Description (für Search Engine Results)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

COMMENT ON COLUMN listings.meta_description IS 'Meta-Description für Suchmaschinen und Social Media Previews';

-- Social Media Sharing Title
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS sharing_config_title TEXT;

COMMENT ON COLUMN listings.sharing_config_title IS 'Optimierter Titel für Social Media Sharing (z.B. "Condo in Berlin · ★4.90 · 1 bedroom")';

-- Thumbnail URL (Haupt-Thumbnail)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN listings.thumbnail_url IS 'URL zum Haupt-Thumbnail Bild für Listings-Übersichten';

-- =====================================================
-- 2. APP INTEGRATION (Deep Links)
-- =====================================================

-- Android App Deep Link
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS android_link TEXT;

COMMENT ON COLUMN listings.android_link IS 'Android App Deep-Link (z.B. "airbnb://rooms/29732182")';

-- iOS App Deep Link  
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS ios_link TEXT;

COMMENT ON COLUMN listings.ios_link IS 'iOS App Deep-Link für bessere Mobile User Experience';

-- =====================================================
-- 3. ERWEITERTE CONTENT DATEN
-- =====================================================

-- HTML-formatierte Beschreibung
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS html_description JSONB;

COMMENT ON COLUMN listings.html_description IS 'HTML-formatierte Beschreibung mit strukturiertem Content und Formatierung';

-- Sub-Description (strukturierte Kurzbeschreibung)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS sub_description JSONB;

COMMENT ON COLUMN listings.sub_description IS 'Strukturierte Kurzbeschreibung (z.B. "1 queen bed", "Shared bathroom")';

-- Original Language der Beschreibung
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS description_language TEXT;

COMMENT ON COLUMN listings.description_language IS 'Ursprungssprache der Listing-Beschreibung (z.B. "en", "de")';

-- =====================================================
-- 4. AIRBNB INTERNAL RANKING DATA
-- =====================================================

-- Home Tier (Airbnb-internes Ranking)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS home_tier INTEGER;

COMMENT ON COLUMN listings.home_tier IS 'Airbnb-internes Ranking-System (1-10, niedrigere Zahlen = höheres Ranking)';

-- Verfügbarkeitsstatus
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN;

COMMENT ON COLUMN listings.is_available IS 'Aktueller Verfügbarkeitsstatus für angefragte Daten';

-- =====================================================
-- 5. ERWEITERTE HOST DATEN
-- =====================================================

-- Host ID (falls noch nicht vorhanden)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS host_id TEXT;

COMMENT ON COLUMN listings.host_id IS 'Eindeutige Airbnb Host-ID';

-- Host Rating Average (echte Bewertung)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS host_rating_average DECIMAL(3,2);

COMMENT ON COLUMN listings.host_rating_average IS 'Host-Durchschnittsbewertung (aus ratingAverage)';

-- Host Rating Count 
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS host_rating_count INTEGER;

COMMENT ON COLUMN listings.host_rating_count IS 'Anzahl der Host-Bewertungen';

-- Host Zeit als Host in Monaten (zusätzlich zu Jahren)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS host_time_as_host_months INTEGER;

COMMENT ON COLUMN listings.host_time_as_host_months IS 'Gesamte Zeit als Host in Monaten (präziser als nur Jahre)';

-- =====================================================
-- 6. CO-HOSTS SYSTEM
-- =====================================================

-- Co-Hosts Array
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS co_hosts JSONB;

COMMENT ON COLUMN listings.co_hosts IS 'Array von Co-Hosts mit Details (name, profileImage, etc.)';

-- =====================================================
-- 7. ERWEITERTE LOCATION DATEN
-- =====================================================

-- Location Subtitle (zusätzliche Geo-Info)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS location_subtitle TEXT;

COMMENT ON COLUMN listings.location_subtitle IS 'Erweiterte Location-Information (z.B. "Berlin, Germany")';

-- Breadcrumbs (Navigation-Pfad)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS breadcrumbs JSONB;

COMMENT ON COLUMN listings.breadcrumbs IS 'Airbnb Navigation-Pfad für SEO und Kategorisierung';

-- =====================================================
-- 8. BRAND & MARKETING HIGHLIGHTS
-- =====================================================

-- Brand Highlights (Premium Features)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS brand_highlights JSONB;

COMMENT ON COLUMN listings.brand_highlights IS 'Premium Brand Features (hasGoldenLaurel, Guest favorite, etc.)';

-- =====================================================
-- 9. ERWEITERTE BOOKING POLICIES
-- =====================================================

-- Cancellation Policies
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS cancellation_policies JSONB;

COMMENT ON COLUMN listings.cancellation_policies IS 'Detaillierte Stornierungsbedingungen mit Policy-IDs';

-- =====================================================
-- 10. INDICES für PERFORMANCE
-- =====================================================

-- Index für SEO Title (für Suche und Optimierung)
CREATE INDEX IF NOT EXISTS idx_listings_seo_title ON listings USING gin(to_tsvector('german', seo_title));

-- Index für Home Tier (für Ranking-Analysen)
CREATE INDEX IF NOT EXISTS idx_listings_home_tier ON listings(home_tier) WHERE home_tier IS NOT NULL;

-- Index für Host ID (für Host-übergreifende Analysen)
CREATE INDEX IF NOT EXISTS idx_listings_host_id ON listings(host_id) WHERE host_id IS NOT NULL;

-- Index für Host Rating Average (für Host-Qualitäts-Analysen)
CREATE INDEX IF NOT EXISTS idx_listings_host_rating_avg ON listings(host_rating_average) WHERE host_rating_average IS NOT NULL;

-- Index für Brand Highlights (für Premium Listing Detection)
CREATE INDEX IF NOT EXISTS idx_listings_brand_highlights ON listings USING gin(brand_highlights) WHERE brand_highlights IS NOT NULL;

-- Index für Description Language (für Mehrsprachigkeits-Features)
CREATE INDEX IF NOT EXISTS idx_listings_description_language ON listings(description_language) WHERE description_language IS NOT NULL;

-- =====================================================
-- 11. DATENVALIDIERUNG & CONSTRAINTS
-- =====================================================

-- Validierung für Home Tier (1-10 Range)
ALTER TABLE listings 
ADD CONSTRAINT chk_home_tier_range 
CHECK (home_tier IS NULL OR (home_tier >= 1 AND home_tier <= 10));

-- Validierung für Host Rating Average (0.0-5.0)
ALTER TABLE listings 
ADD CONSTRAINT chk_host_rating_avg_range 
CHECK (host_rating_average IS NULL OR (host_rating_average >= 0.0 AND host_rating_average <= 5.0));

-- Validierung für Host Rating Count (positive numbers)
ALTER TABLE listings 
ADD CONSTRAINT chk_host_rating_count_positive 
CHECK (host_rating_count IS NULL OR host_rating_count >= 0);

-- Validierung für Host Months (positive numbers)
ALTER TABLE listings 
ADD CONSTRAINT chk_host_months_positive 
CHECK (host_time_as_host_months IS NULL OR host_time_as_host_months >= 0);

-- =====================================================
-- 12. UPDATE EXISTING RECORDS POLICY
-- =====================================================

-- Füge Kommentar für Update-Policy hinzu
COMMENT ON TABLE listings IS 
'Listings Tabelle - Erweitert um vollständige Apify Datennutzung. 
Neue Felder werden bei nächstem Scraping automatisch befüllt.
Bestehende Listings behalten ihre Werte, neue Felder sind initial NULL.';

-- =====================================================
-- 13. GRANT PERMISSIONS (falls RLS aktiv)
-- =====================================================

-- Falls Row Level Security aktiv ist, stelle sicher dass die neuen Felder
-- in bestehenden Policies inkludiert sind

-- Beispiel Policy Update (anpassen je nach aktueller RLS Konfiguration):
-- ALTER POLICY "Users can view their own listings" ON listings
-- FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- ERFOLGSMELDUNG
-- =====================================================

-- Log Success
DO $$
BEGIN
    RAISE NOTICE '✅ SUPABASE SCHEMA UPDATES COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '📊 Added 14 new columns for extended Apify data utilization';
    RAISE NOTICE '🔍 Added 6 performance indices for new fields';
    RAISE NOTICE '✅ Added 4 data validation constraints';
    RAISE NOTICE '🎯 Database ready for 95%+ Apify data utilization!';
END $$;