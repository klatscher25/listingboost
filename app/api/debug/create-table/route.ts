/**
 * @file app/api/debug/create-table/route.ts
 * @description Debug endpoint to create missing analysis_results table
 * @created 2025-07-22
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      )
    }

    console.log('🔧 Creating analysis_results table via API...')

    // Test if table already exists
    const { data: existingTable, error: testError } = await supabaseAdmin
      .from('analysis_results')
      .select('id')
      .limit(1)

    if (!testError) {
      return NextResponse.json({
        success: true,
        message: 'analysis_results table already exists',
        alreadyExists: true
      })
    }

    // If error is not "relation does not exist", something else is wrong
    if (!testError.message.includes('relation "analysis_results" does not exist')) {
      throw new Error(`Unexpected error testing table: ${testError.message}`)
    }

    return NextResponse.json({
      success: false,
      message: 'Table does not exist. Please create it manually in Supabase Dashboard.',
      instruction: 'Run the SQL from supabase/migrations/20250722_001_analysis_results.sql',
      sql: `
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('full', 'freemium', 'quick', 'competitor')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    ai_insights TEXT,
    gemini_response TEXT,
    processing_error TEXT,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX idx_analysis_results_listing_id ON analysis_results(listing_id);
CREATE INDEX idx_analysis_results_type ON analysis_results(analysis_type);
CREATE INDEX idx_analysis_results_created ON analysis_results(created_at);
CREATE INDEX idx_analysis_results_metadata ON analysis_results USING GIN(metadata);

ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analysis results" ON analysis_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analysis results" ON analysis_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analysis results" ON analysis_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analysis results" ON analysis_results FOR DELETE USING (auth.uid() = user_id);
      `.trim()
    })

  } catch (error) {
    console.error('❌ Error in create-table API:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check/create table',
      details: (error as Error).message,
      instruction: 'Please create the table manually in Supabase Dashboard'
    }, { status: 500 })
  }
}