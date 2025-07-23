-- ===================================================================
-- ListingBoost Pro - Background Analysis Jobs System
-- Created: 2025-07-23
-- Purpose: Enable async analysis processing to eliminate 90s user blocking
-- ===================================================================

-- analysis_jobs table - Track background analysis jobs with real-time progress
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(50) NOT NULL, -- freemium token for unauthenticated users
    url TEXT NOT NULL, -- airbnb URL to analyze
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- optional for authenticated users
    
    -- Job Status and Progress
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100), -- 0-100%
    current_step VARCHAR(50), -- "initializing", "scraping", "analyzing", "generating_recommendations", "finalizing"
    
    -- Result Data (populated when completed)
    listing_data JSONB, -- scraped listing data
    analysis_data JSONB, -- analysis results  
    recommendations_data JSONB, -- recommendations
    is_real_data BOOLEAN DEFAULT false, -- whether real Apify data was scraped
    
    -- Error Handling and Retry Logic
    error_message TEXT,
    error_details JSONB, -- structured error information
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timestamps for job lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ, -- when job processing began
    completed_at TIMESTAMPTZ, -- when job finished (success or failure)
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'), -- automatic cleanup
    
    -- Performance Metrics
    scraping_duration_ms INTEGER, -- time spent on Apify scraping
    analysis_duration_ms INTEGER, -- time spent on Gemini analysis  
    total_duration_ms INTEGER, -- total processing time
    
    -- Metadata for debugging and monitoring
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

CREATE INDEX idx_analysis_jobs_token ON analysis_jobs(token);
CREATE INDEX idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX idx_analysis_jobs_created_at ON analysis_jobs(created_at);
CREATE INDEX idx_analysis_jobs_expires_at ON analysis_jobs(expires_at);
CREATE INDEX idx_analysis_jobs_user_id ON analysis_jobs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analysis_jobs_status_created ON analysis_jobs(status, created_at);

-- Composite index for job queue processing (pending jobs by creation time)
CREATE INDEX idx_analysis_jobs_queue ON analysis_jobs(status, created_at) WHERE status = 'pending';

-- ===================================================================
-- UPDATE TRIGGER
-- ===================================================================

CREATE TRIGGER update_analysis_jobs_updated_at 
    BEFORE UPDATE ON analysis_jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ROW LEVEL SECURITY POLICIES
-- ===================================================================

ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Allow freemium users to read their jobs by token (no authentication required)
CREATE POLICY "Freemium users can read jobs by token" ON analysis_jobs
    FOR SELECT USING (
        token = current_setting('request.headers', true)::json->>'x-freemium-token' OR
        token = current_setting('request.jwt.claims', true)::json->>'freemium_token'
    );

-- Allow authenticated users to read their own jobs
CREATE POLICY "Users can read their own jobs" ON analysis_jobs
    FOR SELECT USING (auth.uid() = user_id);

-- Allow job creation for freemium users (token-based)
CREATE POLICY "Allow job creation for freemium" ON analysis_jobs
    FOR INSERT WITH CHECK (
        token IS NOT NULL AND 
        LENGTH(token) >= 10 -- minimum token length
    );

-- Allow authenticated users to create jobs
CREATE POLICY "Users can create jobs" ON analysis_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can manage all jobs (for background worker)
CREATE POLICY "Service role full access" ON analysis_jobs
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- ===================================================================
-- BACKGROUND JOB MANAGEMENT FUNCTIONS
-- ===================================================================

-- Function to get next pending job for processing
CREATE OR REPLACE FUNCTION get_next_pending_job()
RETURNS TABLE (
    job_id UUID,
    token VARCHAR(50),
    url TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    UPDATE analysis_jobs 
    SET 
        status = 'running',
        started_at = NOW(),
        current_step = 'initializing'
    WHERE id = (
        SELECT aj.id 
        FROM analysis_jobs aj
        WHERE aj.status = 'pending' 
          AND aj.expires_at > NOW()
        ORDER BY aj.created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING id, analysis_jobs.token, analysis_jobs.url, analysis_jobs.user_id, analysis_jobs.created_at;
END;
$$;

-- Function to update job progress
CREATE OR REPLACE FUNCTION update_job_progress(
    job_id UUID,
    new_progress INTEGER,
    new_step VARCHAR(50) DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE analysis_jobs 
    SET 
        progress = new_progress,
        current_step = COALESCE(new_step, current_step),
        updated_at = NOW()
    WHERE id = job_id;
    
    RETURN FOUND;
END;
$$;

-- Function to complete job with results
CREATE OR REPLACE FUNCTION complete_job(
    job_id UUID,
    listing_data JSONB,
    analysis_data JSONB,
    recommendations_data JSONB,
    is_real_data BOOLEAN,
    scraping_duration INTEGER DEFAULT NULL,
    analysis_duration INTEGER DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    job_start_time TIMESTAMPTZ;
BEGIN
    -- Get job start time for total duration calculation
    SELECT started_at INTO job_start_time FROM analysis_jobs WHERE id = job_id;
    
    UPDATE analysis_jobs 
    SET 
        status = 'completed',
        progress = 100,
        current_step = 'completed',
        listing_data = complete_job.listing_data,
        analysis_data = complete_job.analysis_data,
        recommendations_data = complete_job.recommendations_data,
        is_real_data = complete_job.is_real_data,
        scraping_duration_ms = scraping_duration,
        analysis_duration_ms = analysis_duration,
        total_duration_ms = EXTRACT(EPOCH FROM (NOW() - job_start_time)) * 1000,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = job_id;
    
    RETURN FOUND;
END;
$$;

-- Function to fail job with error
CREATE OR REPLACE FUNCTION fail_job(
    job_id UUID,
    error_message TEXT,
    error_details JSONB DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    job_start_time TIMESTAMPTZ;
    current_retry_count INTEGER;
    max_retries INTEGER;
BEGIN
    -- Get job details
    SELECT started_at, retry_count, analysis_jobs.max_retries 
    INTO job_start_time, current_retry_count, max_retries
    FROM analysis_jobs WHERE id = job_id;
    
    -- Check if we should retry
    IF current_retry_count < max_retries THEN
        -- Reset to pending for retry
        UPDATE analysis_jobs 
        SET 
            status = 'pending',
            progress = 0,
            current_step = NULL,
            retry_count = retry_count + 1,
            error_message = fail_job.error_message,
            error_details = fail_job.error_details,
            started_at = NULL,
            updated_at = NOW()
        WHERE id = job_id;
    ELSE
        -- Mark as permanently failed
        UPDATE analysis_jobs 
        SET 
            status = 'failed',
            current_step = 'failed',
            error_message = fail_job.error_message,
            error_details = fail_job.error_details,
            total_duration_ms = EXTRACT(EPOCH FROM (NOW() - job_start_time)) * 1000,
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = job_id;
    END IF;
    
    RETURN FOUND;
END;
$$;

-- Function to cleanup expired jobs
CREATE OR REPLACE FUNCTION cleanup_expired_jobs()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analysis_jobs 
    WHERE expires_at < NOW() 
      AND status IN ('completed', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ===================================================================
-- SUCCESS CONFIRMATION
-- ===================================================================

-- Log successful migration
INSERT INTO audit_logs (action, resource_type, new_values, created_at) 
VALUES (
    'migration_completed', 
    'database', 
    '{"migration": "20250723_001_analysis_jobs", "table_created": "analysis_jobs", "functions_created": ["get_next_pending_job", "update_job_progress", "complete_job", "fail_job", "cleanup_expired_jobs"]}'::jsonb, 
    NOW()
);