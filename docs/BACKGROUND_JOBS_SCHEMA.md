# Background Job System Architecture

## Database Schema Design

### analysis_jobs Table

```sql
CREATE TABLE analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(50) NOT NULL, -- freemium token
  url TEXT NOT NULL, -- airbnb URL
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- optional for authenticated users
  
  -- Job Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100), -- 0-100%
  current_step VARCHAR(50), -- "scraping", "analyzing", "generating_recommendations"
  
  -- Result Data (when completed)
  listing_data JSONB, -- scraped listing data
  analysis_data JSONB, -- analysis results
  recommendations_data JSONB, -- recommendations
  is_real_data BOOLEAN DEFAULT false, -- whether real data was scraped
  
  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'), -- job cleanup
  
  -- Performance Metrics
  scraping_duration_ms INTEGER,
  analysis_duration_ms INTEGER,
  total_duration_ms INTEGER
);

-- Indexes for performance
CREATE INDEX idx_analysis_jobs_token ON analysis_jobs(token);
CREATE INDEX idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX idx_analysis_jobs_created_at ON analysis_jobs(created_at);
CREATE INDEX idx_analysis_jobs_expires_at ON analysis_jobs(expires_at);

-- RLS Policies
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own jobs (by token or user_id)
CREATE POLICY "Users can read their own jobs" ON analysis_jobs
FOR SELECT USING (
  token = ANY(ARRAY[current_setting('request.jwt.claims', true)::json->>'freemium_token']) OR
  user_id = auth.uid()
);

-- Service role can manage all jobs (for backend worker)
CREATE POLICY "Service role can manage all jobs" ON analysis_jobs
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

## Job Queue Architecture

### Job Lifecycle
1. **pending** → User submits URL, job created immediately
2. **running** → Background worker picks up job, updates progress
3. **completed** → Job finished successfully with results
4. **failed** → Job failed, error message stored

### Progress Steps
- 0-20%: Initializing and validating URL
- 20-70%: Scraping listing data from Apify
- 70-90%: Running AI analysis with Gemini
- 90-100%: Generating recommendations and saving results

### Background Worker Process
1. Poll for pending jobs every 5 seconds
2. Mark job as 'running' and update progress
3. Execute scraping with timeout handling
4. Run analysis and recommendations
5. Mark job as 'completed' or 'failed'
6. Clean up expired jobs (>24 hours old)

## API Endpoints

### Job Creation
- `POST /api/jobs/analyze` - Create new analysis job
- Returns: `{ jobId, estimatedTime, pollUrl }`

### Job Status
- `GET /api/jobs/status/[jobId]` - Get job status and progress
- Returns: `{ status, progress, currentStep, results?, error? }`

### Job Cleanup (Internal)
- `POST /api/jobs/cleanup` - Clean expired jobs (cron job)

## Frontend Integration

### Real-time Progress Updates
- Use `useEffect` hook with polling every 2 seconds
- Display progress bar with current step description
- Automatic redirect to results when completed
- Error handling with retry option

### User Experience Improvements
- Immediate job creation (<500ms perceived wait time)
- Real-time progress updates with German descriptions
- Background processing eliminates 90s blocking
- Users can close browser and return later