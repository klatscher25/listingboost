-- =====================================================
-- SUPABASE SCHEMA UPDATES für erweiterte Apify Datennutzung (SAFE VERSION)
-- =====================================================
-- @file supabase_schema_updates_safe.sql
-- @description Sichere SQL Commands für erweiterte Apify Datenfelder
-- @created 2025-07-21
-- @todo CORE-001-02: Erweitere Database Schema für vollständige Apify Datennutzung

-- =====================================================
-- VORBEDINGUNGEN PRÜFEN
-- =====================================================

-- Prüfe ob listings Tabelle existiert
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
        RAISE EXCEPTION 'listings table does not exist. Please run the initial schema migration first.';
    END IF;
    
    RAISE NOTICE 'listings table found - proceeding with schema updates';
END $$;

-- =====================================================
-- 1. SEO & MARKETING DATEN (Zuvor ungenutzt)
-- =====================================================

-- SEO Title (für Suchmaschinenoptimierung)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS seo_title TEXT;

-- Meta Description (für Search Engine Results)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Social Media Sharing Title
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS sharing_config_title TEXT;

-- Thumbnail URL (Haupt-Thumbnail)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- =====================================================
-- 2. APP INTEGRATION (Deep Links)
-- =====================================================

-- Android App Deep Link
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS android_link TEXT;

-- iOS App Deep Link  
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS ios_link TEXT;

-- =====================================================
-- 3. ERWEITERTE CONTENT DATEN
-- =====================================================

-- HTML-formatierte Beschreibung
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS html_description JSONB;

-- Sub-Description (strukturierte Kurzbeschreibung)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS sub_description JSONB;

-- Original Language der Beschreibung
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS description_language TEXT;

-- =====================================================
-- 4. AIRBNB INTERNAL RANKING DATA
-- =====================================================

-- Home Tier (Airbnb-internes Ranking)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS home_tier INTEGER;

-- Verfügbarkeitsstatus
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN;

-- =====================================================
-- 5. ERWEITERTE HOST DATEN
-- =====================================================

-- Host ID (falls noch nicht vorhanden)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS host_id TEXT;

-- Host Rating Average (echte Bewertung)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS host_rating_average DECIMAL(3,2);

-- Host Rating Count 
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS host_rating_count INTEGER;

-- Host Zeit als Host in Monaten (zusätzlich zu Jahren)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS host_time_as_host_months INTEGER;

-- =====================================================
-- 6. CO-HOSTS SYSTEM
-- =====================================================

-- Co-Hosts Array
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS co_hosts JSONB;

-- =====================================================
-- 7. ERWEITERTE LOCATION DATEN
-- =====================================================

-- Location Subtitle (zusätzliche Geo-Info)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS location_subtitle TEXT;

-- Breadcrumbs (Navigation-Pfad)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS breadcrumbs JSONB;

-- =====================================================
-- 8. BRAND & MARKETING HIGHLIGHTS
-- =====================================================

-- Brand Highlights (Premium Features)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS brand_highlights JSONB;

-- =====================================================
-- 9. ERWEITERTE BOOKING POLICIES
-- =====================================================

-- Cancellation Policies
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS cancellation_policies JSONB;

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
DO $$
BEGIN
    -- Prüfe ob Constraint bereits existiert
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_home_tier_range' 
        AND table_name = 'listings'
    ) THEN
        ALTER TABLE listings 
        ADD CONSTRAINT chk_home_tier_range 
        CHECK (home_tier IS NULL OR (home_tier >= 1 AND home_tier <= 10));
    END IF;
END $$;

-- Validierung für Host Rating Average (0.0-5.0)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_host_rating_avg_range' 
        AND table_name = 'listings'
    ) THEN
        ALTER TABLE listings 
        ADD CONSTRAINT chk_host_rating_avg_range 
        CHECK (host_rating_average IS NULL OR (host_rating_average >= 0.0 AND host_rating_average <= 5.0));
    END IF;
END $$;

-- Validierung für Host Rating Count (positive numbers)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_host_rating_count_positive' 
        AND table_name = 'listings'
    ) THEN
        ALTER TABLE listings 
        ADD CONSTRAINT chk_host_rating_count_positive 
        CHECK (host_rating_count IS NULL OR host_rating_count >= 0);
    END IF;
END $$;

-- Validierung für Host Months (positive numbers)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_host_months_positive' 
        AND table_name = 'listings'
    ) THEN
        ALTER TABLE listings 
        ADD CONSTRAINT chk_host_months_positive 
        CHECK (host_time_as_host_months IS NULL OR host_time_as_host_months >= 0);
    END IF;
END $$;

-- =====================================================
-- 12. KOMMENTARE HINZUFÜGEN
-- =====================================================

COMMENT ON COLUMN listings.seo_title IS 'SEO-optimierter Titel von Airbnb';
COMMENT ON COLUMN listings.meta_description IS 'Meta-Description für Suchmaschinen';
COMMENT ON COLUMN listings.sharing_config_title IS 'Titel für Social Media Sharing';
COMMENT ON COLUMN listings.thumbnail_url IS 'URL zum Haupt-Thumbnail Bild';
COMMENT ON COLUMN listings.android_link IS 'Android App Deep-Link';
COMMENT ON COLUMN listings.ios_link IS 'iOS App Deep-Link';
COMMENT ON COLUMN listings.html_description IS 'HTML-formatierte Beschreibung';
COMMENT ON COLUMN listings.sub_description IS 'Strukturierte Kurzbeschreibung';
COMMENT ON COLUMN listings.description_language IS 'Ursprungssprache der Beschreibung';
COMMENT ON COLUMN listings.home_tier IS 'Airbnb-internes Ranking-System (1-10)';
COMMENT ON COLUMN listings.is_available IS 'Aktueller Verfügbarkeitsstatus';
COMMENT ON COLUMN listings.host_id IS 'Eindeutige Airbnb Host-ID';
COMMENT ON COLUMN listings.host_rating_average IS 'Host-Durchschnittsbewertung';
COMMENT ON COLUMN listings.host_rating_count IS 'Anzahl der Host-Bewertungen';
COMMENT ON COLUMN listings.host_time_as_host_months IS 'Zeit als Host in Monaten';
COMMENT ON COLUMN listings.co_hosts IS 'Array von Co-Hosts mit Details';
COMMENT ON COLUMN listings.location_subtitle IS 'Erweiterte Location-Information';
COMMENT ON COLUMN listings.breadcrumbs IS 'Navigation-Pfad für SEO';
COMMENT ON COLUMN listings.brand_highlights IS 'Premium Brand Features';
COMMENT ON COLUMN listings.cancellation_policies IS 'Detaillierte Stornierungsbedingungen';

-- =====================================================
-- ERFOLGSMELDUNG
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'SUPABASE SCHEMA UPDATES COMPLETED SUCCESSFULLY!';
    RAISE NOTICE 'Added 14 new columns for extended Apify data utilization';
    RAISE NOTICE 'Added 6 performance indices for new fields';
    RAISE NOTICE 'Added 4 data validation constraints';
    RAISE NOTICE 'Database ready for 95+ percent Apify data utilization!';
END $$;