import { z } from 'zod'
import { logInfo } from '@/lib/utils/logger'

// Simple development configuration without validation errors
function createDevelopmentConfig() {
  return {
    NODE_ENV:
      (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
      'development',
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME:
      process.env.NEXT_PUBLIC_APP_NAME || 'ListingBoost Pro',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET:
      process.env.NEXTAUTH_SECRET ||
      'dev_secret_key_at_least_32_characters_long',
    GOOGLE_GEMINI_API_KEY:
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      'dev_placeholder_gemini_key',
    GOOGLE_GEMINI_MODEL: process.env.GOOGLE_GEMINI_MODEL || 'gemini-1.5-flash',
    APIFY_API_TOKEN: process.env.APIFY_API_TOKEN || 'placeholder_apify_token',
    APIFY_ACTOR_URL_SCRAPER:
      process.env.APIFY_ACTOR_URL_SCRAPER ||
      'tri_angle/airbnb-rooms-urls-scraper',
    APIFY_ACTOR_REVIEW_SCRAPER:
      process.env.APIFY_ACTOR_REVIEW_SCRAPER ||
      'tri_angle/airbnb-reviews-scraper',
    APIFY_ACTOR_AVAILABILITY_SCRAPER:
      process.env.APIFY_ACTOR_AVAILABILITY_SCRAPER ||
      'rigelbytes/airbnb-availability-calendar',
    APIFY_ACTOR_LOCATION_SCRAPER:
      process.env.APIFY_ACTOR_LOCATION_SCRAPER || 'tri_angle/airbnb-scraper',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
    STRIPE_WEBHOOK_SECRET:
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
    CLOUDINARY_CLOUD_NAME:
      process.env.CLOUDINARY_CLOUD_NAME || 'placeholder_cloud',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'placeholder_api_key',
    CLOUDINARY_API_SECRET:
      process.env.CLOUDINARY_API_SECRET || 'placeholder_api_secret',
    BREVO_API_KEY: process.env.BREVO_API_KEY || 'placeholder_brevo_key',
    NEXT_PUBLIC_GA_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined,
  }
}

// Production validation schema
const prodEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  GOOGLE_GEMINI_API_KEY: z.string().default('dev_placeholder_gemini_key'),
  GOOGLE_GEMINI_MODEL: z.string(),
  APIFY_API_TOKEN: z.string().min(1),
  APIFY_ACTOR_URL_SCRAPER: z.string().min(1),
  APIFY_ACTOR_REVIEW_SCRAPER: z.string().min(1),
  APIFY_ACTOR_AVAILABILITY_SCRAPER: z.string().min(1),
  APIFY_ACTOR_LOCATION_SCRAPER: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  BREVO_API_KEY: z.string().min(1),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
})

// Parse and validate environment variables
function parseEnv() {
  // In development, skip validation and use safe defaults
  if (process.env.NODE_ENV === 'development') {
    logInfo('✅ Entwicklungskonfiguration wird verwendet')
    return createDevelopmentConfig()
  }

  // In production, validate strictly
  try {
    return prodEnvSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Production environment validation failed:', error)
    throw new Error('Environment validation failed')
  }
}

// Export validated config
export const config = parseEnv()
export const env = config // Alias for consistency

// Type for the config
export type Config = z.infer<typeof prodEnvSchema>

// Helper to check if we're in development
export const isDev = config.NODE_ENV === 'development'
export const isProd = config.NODE_ENV === 'production'
export const isTest = config.NODE_ENV === 'test'
