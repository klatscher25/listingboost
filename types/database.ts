/**
 * @file database.ts
 * @description TypeScript types for ListingBoost Pro database
 * @created 2025-07-20
 * @todo F002-02: Database schema implementation
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ===================================================================
      // USER MANAGEMENT TABLES
      // ===================================================================
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          language: string
          onboarding_completed: boolean
          marketing_emails_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: string
          onboarding_completed?: boolean
          marketing_emails_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: string
          onboarding_completed?: boolean
          marketing_emails_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          invited_at?: string
          joined_at?: string | null
        }
      }
      // ===================================================================
      // SUBSCRIPTION & BILLING TABLES
      // ===================================================================
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          plan_type: 'freemium' | 'starter' | 'growth' | 'pro'
          status: 'active' | 'canceled' | 'past_due' | 'incomplete'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          plan_type: 'freemium' | 'starter' | 'growth' | 'pro'
          status: 'active' | 'canceled' | 'past_due' | 'incomplete'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          plan_type?: 'freemium' | 'starter' | 'growth' | 'pro'
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          stripe_payment_intent_id: string | null
          amount_cents: number
          currency: string
          status: 'succeeded' | 'failed' | 'pending'
          payment_type: 'subscription' | 'one_time'
          description: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          stripe_payment_intent_id?: string | null
          amount_cents: number
          currency?: string
          status: 'succeeded' | 'failed' | 'pending'
          payment_type: 'subscription' | 'one_time'
          description?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          stripe_payment_intent_id?: string | null
          amount_cents?: number
          currency?: string
          status?: 'succeeded' | 'failed' | 'pending'
          payment_type?: 'subscription' | 'one_time'
          description?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          resource_type:
            | 'listing_analysis'
            | 'api_call'
            | 'export'
            | 'competitor_check'
          count: number
          date: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          resource_type:
            | 'listing_analysis'
            | 'api_call'
            | 'export'
            | 'competitor_check'
          count?: number
          date?: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          resource_type?:
            | 'listing_analysis'
            | 'api_call'
            | 'export'
            | 'competitor_check'
          count?: number
          date?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      // ===================================================================
      // CORE LISTING TABLES
      // ===================================================================
      listings: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          is_archived: boolean
          analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed'
          airbnb_id: string
          airbnb_url: string
          home_tier: number | null
          title: string | null
          seo_title: string | null
          meta_description: string | null
          sharing_config_title: string | null
          description: string | null
          html_description: Json | null
          sub_description: Json | null
          description_language: string | null
          property_type: string | null
          room_type: string | null
          person_capacity: number | null
          bedroom_count: number | null
          bed_count: number | null
          bathroom_count: number | null
          location: string | null
          location_subtitle: string | null
          coordinates_latitude: number | null
          coordinates_longitude: number | null
          location_descriptions: Json | null
          breadcrumbs: Json | null
          overall_rating: number | null
          rating_accuracy: number | null
          rating_checkin: number | null
          rating_cleanliness: number | null
          rating_communication: number | null
          rating_location: number | null
          rating_value: number | null
          reviews_count: number | null
          host_id: string | null
          host_name: string | null
          host_profile_image: string | null
          host_is_superhost: boolean | null
          host_is_verified: boolean | null
          host_response_rate: string | null
          host_response_time: string | null
          host_rating_average: number | null
          host_rating_count: number | null
          host_time_as_host_months: number | null
          host_time_as_host_years: number | null
          host_about: string | null
          host_highlights: Json | null
          co_hosts: Json | null
          price_per_night: number | null
          original_price: number | null
          discounted_price: number | null
          price_qualifier: string | null
          price_breakdown: Json | null
          currency: string
          thumbnail_url: string | null
          images: Json | null
          images_count: number | null
          amenities: Json | null
          wifi_available: boolean | null
          kitchen_available: boolean | null
          parking_available: boolean | null
          air_conditioning_available: boolean | null
          heating_available: boolean | null
          pets_allowed: boolean | null
          self_checkin_available: boolean | null
          washer_available: boolean | null
          dryer_available: boolean | null
          dishwasher_available: boolean | null
          tv_available: boolean | null
          hair_dryer_available: boolean | null
          iron_available: boolean | null
          dedicated_workspace_available: boolean | null
          private_entrance_available: boolean | null
          refrigerator_available: boolean | null
          stove_available: boolean | null
          microwave_available: boolean | null
          coffee_maker_available: boolean | null
          toaster_available: boolean | null
          dining_table_available: boolean | null
          cooking_basics_available: boolean | null
          smoke_alarm_available: boolean | null
          fire_extinguisher_available: boolean | null
          first_aid_kit_available: boolean | null
          carbon_monoxide_alarm_available: boolean | null
          hot_tub_available: boolean | null
          pool_available: boolean | null
          gym_available: boolean | null
          elevator_available: boolean | null
          balcony_available: boolean | null
          long_term_stays_allowed: boolean | null
          instant_book_available: boolean | null
          luggage_dropoff_allowed: boolean | null
          crib_available: boolean | null
          high_chair_available: boolean | null
          pack_n_play_available: boolean | null
          house_rules: Json | null
          cancellation_policies: Json | null
          minimum_stay: number | null
          maximum_stay: number | null
          highlights: Json | null
          brand_highlights: Json | null
          is_available: boolean | null
          android_link: string | null
          ios_link: string | null
          raw_scraped_data: Json | null
          last_scraped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          is_archived?: boolean
          analysis_status?: 'pending' | 'analyzing' | 'completed' | 'failed'
          airbnb_id: string
          airbnb_url: string
          home_tier?: number | null
          title?: string | null
          seo_title?: string | null
          meta_description?: string | null
          sharing_config_title?: string | null
          description?: string | null
          html_description?: Json | null
          sub_description?: Json | null
          description_language?: string | null
          property_type?: string | null
          room_type?: string | null
          person_capacity?: number | null
          bedroom_count?: number | null
          bed_count?: number | null
          bathroom_count?: number | null
          location?: string | null
          location_subtitle?: string | null
          coordinates_latitude?: number | null
          coordinates_longitude?: number | null
          location_descriptions?: Json | null
          breadcrumbs?: Json | null
          overall_rating?: number | null
          rating_accuracy?: number | null
          rating_checkin?: number | null
          rating_cleanliness?: number | null
          rating_communication?: number | null
          rating_location?: number | null
          rating_value?: number | null
          reviews_count?: number | null
          host_id?: string | null
          host_name?: string | null
          host_profile_image?: string | null
          host_is_superhost?: boolean | null
          host_is_verified?: boolean | null
          host_response_rate?: string | null
          host_response_time?: string | null
          host_rating_average?: number | null
          host_rating_count?: number | null
          host_time_as_host_months?: number | null
          host_time_as_host_years?: number | null
          host_about?: string | null
          host_highlights?: Json | null
          co_hosts?: Json | null
          price_per_night?: number | null
          original_price?: number | null
          discounted_price?: number | null
          price_qualifier?: string | null
          price_breakdown?: Json | null
          currency?: string
          thumbnail_url?: string | null
          images?: Json | null
          images_count?: number | null
          amenities?: Json | null
          wifi_available?: boolean | null
          kitchen_available?: boolean | null
          parking_available?: boolean | null
          air_conditioning_available?: boolean | null
          heating_available?: boolean | null
          pets_allowed?: boolean | null
          self_checkin_available?: boolean | null
          washer_available?: boolean | null
          dryer_available?: boolean | null
          dishwasher_available?: boolean | null
          tv_available?: boolean | null
          hair_dryer_available?: boolean | null
          iron_available?: boolean | null
          dedicated_workspace_available?: boolean | null
          private_entrance_available?: boolean | null
          refrigerator_available?: boolean | null
          stove_available?: boolean | null
          microwave_available?: boolean | null
          coffee_maker_available?: boolean | null
          toaster_available?: boolean | null
          dining_table_available?: boolean | null
          cooking_basics_available?: boolean | null
          smoke_alarm_available?: boolean | null
          fire_extinguisher_available?: boolean | null
          first_aid_kit_available?: boolean | null
          carbon_monoxide_alarm_available?: boolean | null
          hot_tub_available?: boolean | null
          pool_available?: boolean | null
          gym_available?: boolean | null
          elevator_available?: boolean | null
          balcony_available?: boolean | null
          long_term_stays_allowed?: boolean | null
          instant_book_available?: boolean | null
          luggage_dropoff_allowed?: boolean | null
          crib_available?: boolean | null
          high_chair_available?: boolean | null
          pack_n_play_available?: boolean | null
          house_rules?: Json | null
          cancellation_policies?: Json | null
          minimum_stay?: number | null
          maximum_stay?: number | null
          highlights?: Json | null
          brand_highlights?: Json | null
          is_available?: boolean | null
          android_link?: string | null
          ios_link?: string | null
          raw_scraped_data?: Json | null
          last_scraped_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          // Update type would be similar to Insert but all optional
          [K in keyof Database['public']['Tables']['listings']['Insert']]?: Database['public']['Tables']['listings']['Insert'][K]
        }
      }
      // Additional tables would follow the same pattern...
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          prefix: string
          permissions: Json
          last_used_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          prefix: string
          permissions?: Json
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          prefix?: string
          permissions?: Json
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type:
            | 'listing_analyzed'
            | 'price_alert'
            | 'competitor_change'
            | 'subscription_expiring'
          title: string
          message: string | null
          data: Json | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type:
            | 'listing_analyzed'
            | 'price_alert'
            | 'competitor_change'
            | 'subscription_expiring'
          title: string
          message?: string | null
          data?: Json | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?:
            | 'listing_analyzed'
            | 'price_alert'
            | 'competitor_change'
            | 'subscription_expiring'
          title?: string
          message?: string | null
          data?: Json | null
          read_at?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Update the main supabase client to use the typed database
export type SupabaseClient =
  import('@supabase/supabase-js').SupabaseClient<Database>
