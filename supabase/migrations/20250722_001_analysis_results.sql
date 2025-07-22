-- ===================================================================
-- ListingBoost Pro - Analysis Results Table
-- Created: 2025-07-22
-- Purpose: Store AI analysis results and insights for caching
-- ===================================================================

-- analysis_results table - Store AI analysis results from various sources
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Analysis type and status
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('full', 'freemium', 'quick', 'competitor')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- AI insights and results
    ai_insights TEXT, -- JSON string with AI analysis
    gemini_response TEXT, -- Raw Gemini response
    processing_error TEXT, -- Error message if failed
    
    -- Processing metadata
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_duration_seconds INTEGER,
    
    -- Metadata for caching and attribution
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

CREATE INDEX idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX idx_analysis_results_listing_id ON analysis_results(listing_id);
CREATE INDEX idx_analysis_results_type ON analysis_results(analysis_type);
CREATE INDEX idx_analysis_results_status ON analysis_results(status);
CREATE INDEX idx_analysis_results_created ON analysis_results(created_at);
CREATE INDEX idx_analysis_results_metadata ON analysis_results USING GIN(metadata);

-- ===================================================================
-- UPDATE TRIGGER
-- ===================================================================

CREATE TRIGGER update_analysis_results_updated_at 
    BEFORE UPDATE ON analysis_results 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ROW LEVEL SECURITY
-- ===================================================================

ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analysis results
CREATE POLICY "Users can view own analysis results" ON analysis_results
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own analysis results
CREATE POLICY "Users can insert own analysis results" ON analysis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own analysis results
CREATE POLICY "Users can update own analysis results" ON analysis_results
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own analysis results
CREATE POLICY "Users can delete own analysis results" ON analysis_results
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================================================
-- SUCCESS CONFIRMATION
-- ===================================================================

-- Log successful migration
INSERT INTO audit_logs (action, resource_type, new_values, created_at) 
VALUES ('migration_completed', 'database', '{"migration": "20250722_001_analysis_results", "table_created": "analysis_results"}'::jsonb, NOW());