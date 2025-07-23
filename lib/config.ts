import { z } from 'zod'
import { logInfo } from '@/lib/utils/logger'

/**
 * Creates development configuration with safe defaults for all required environment variables.
 *
 * This function provides fallback values for all environment variables to ensure the application
 * can run in development mode without requiring a complete .env setup. All sensitive values
 * use safe placeholders that are clearly identifiable as non-production values.
 *
 * @returns {Object} Complete configuration object with development-safe defaults
 * @complexity O(1) - Simple object creation with constant-time operations
 * @dependencies None - Pure function with no external dependencies
 * @calledBy parseEnv() - Only called during development environment initialization
 */
function createDevelopmentConfig() {
  return {
    NODE_ENV:
      (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
      'development',
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME:
      process.env.NEXT_PUBLIC_APP_NAME || 'ListingBoost Pro',
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://exarikehlmtczpaarfed.supabase.co',
    SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'YOUR_SUPABASE_ANON_KEY_HERE',
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
    APIFY_API_TOKEN: (() => {
      const token = process.env.APIFY_API_TOKEN || 'placeholder_apify_token'
      console.log(
        '[CONFIG DEBUG] APIFY_API_TOKEN loaded:',
        token.substring(0, 10) + '...'
      )
      return token
    })(),
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

/**
 * Zod schema for validating production environment variables.
 *
 * Defines strict validation rules for all required environment variables in production:
 * - URLs must be valid and accessible
 * - API keys must have minimum lengths to catch obvious configuration errors
 * - Secrets must meet minimum security requirements (32+ characters)
 * - Service identifiers must be non-empty strings
 *
 * @type {z.ZodObject} Zod validation schema object
 * @complexity O(1) - Schema definition is constant-time
 * @usedBy parseEnv() - Used to validate production configuration
 * @throws {z.ZodError} When environment variables don't meet validation criteria
 */
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

/**
 * Parses and validates environment variables based on NODE_ENV.
 *
 * Main configuration entry point that handles environment-specific validation:
 * - Development: Uses safe defaults via createDevelopmentConfig(), skips validation
 * - Production/Test: Strictly validates all required environment variables using Zod schema
 *
 * Flow:
 * 1. Check NODE_ENV to determine validation strategy
 * 2. Development: Return development config with fallbacks
 * 3. Production: Create config object from process.env and validate
 * 4. Handle validation errors and provide clear error messages
 *
 * @returns {Config} Validated and typed configuration object
 * @throws {Error} When production environment validation fails
 * @complexity O(1) - Linear validation of fixed number of environment variables
 * @sideEffects Logs configuration status, may throw on validation failure
 * @calledBy Module initialization - Called once when module is imported
 * @calls createDevelopmentConfig(), logInfo(), prodEnvSchema.parse()
 */
function parseEnv() {
  // In development, skip validation and use safe defaults
  if (process.env.NODE_ENV === 'development') {
    logInfo('✅ Entwicklungskonfiguration wird verwendet')
    return createDevelopmentConfig()
  }

  // In production, validate strictly
  try {
    // Create production config object with correct environment variable mapping
    const prodConfig = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // Map from NEXT_PUBLIC_ version
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      GOOGLE_GEMINI_API_KEY:
        process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
      GOOGLE_GEMINI_MODEL: process.env.GOOGLE_GEMINI_MODEL,
      APIFY_API_TOKEN: process.env.APIFY_API_TOKEN,
      APIFY_ACTOR_URL_SCRAPER: process.env.APIFY_ACTOR_URL_SCRAPER,
      APIFY_ACTOR_REVIEW_SCRAPER: process.env.APIFY_ACTOR_REVIEW_SCRAPER,
      APIFY_ACTOR_AVAILABILITY_SCRAPER:
        process.env.APIFY_ACTOR_AVAILABILITY_SCRAPER,
      APIFY_ACTOR_LOCATION_SCRAPER: process.env.APIFY_ACTOR_LOCATION_SCRAPER,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      BREVO_API_KEY: process.env.BREVO_API_KEY,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    }

    return prodEnvSchema.parse(prodConfig)
  } catch (error) {
    console.error('❌ Production environment validation failed:', error)
    throw new Error('Environment validation failed')
  }
}

/**
 * Main application configuration object.
 *
 * Contains all validated environment variables and configuration settings.
 * In development, includes safe fallback values. In production, all values
 * are validated against strict schema requirements.
 *
 * @type {Config} Validated configuration object
 * @example
 * ```typescript
 * import { config } from '@/lib/config'
 * console.log(config.NEXT_PUBLIC_APP_NAME) // "ListingBoost Pro"
 * ```
 */
export const config = parseEnv()

/**
 * Alias for config object to provide consistent naming across the application.
 *
 * @type {Config} Same as config, provided for backward compatibility
 * @deprecated Use `config` instead for consistency
 */
export const env = config // Alias for consistency

/**
 * TypeScript type definition for the configuration object.
 *
 * Inferred from the Zod schema to ensure type safety across the application.
 * All configuration values are strongly typed and match the validation schema.
 *
 * @type {z.infer<typeof prodEnvSchema>} TypeScript type for configuration
 */
export type Config = z.infer<typeof prodEnvSchema>

/**
 * Boolean flag indicating if the application is running in development mode.
 *
 * @type {boolean} True when NODE_ENV === 'development'
 * @example
 * ```typescript
 * if (isDev) {
 *   console.log('Development debugging enabled')
 * }
 * ```
 */
export const isDev = config.NODE_ENV === 'development'

/**
 * Boolean flag indicating if the application is running in production mode.
 *
 * @type {boolean} True when NODE_ENV === 'production'
 * @example
 * ```typescript
 * if (isProd) {
 *   // Enable production optimizations
 * }
 * ```
 */
export const isProd = config.NODE_ENV === 'production'

/**
 * Boolean flag indicating if the application is running in test mode.
 *
 * @type {boolean} True when NODE_ENV === 'test'
 * @example
 * ```typescript
 * if (isTest) {
 *   // Use test-specific configurations
 * }
 * ```
 */
export const isTest = config.NODE_ENV === 'test'
