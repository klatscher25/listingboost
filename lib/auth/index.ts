/**
 * @file auth/index.ts
 * @description Authentication module exports for ListingBoost Pro
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-01: Supabase Auth Setup & Configuration
 */

// Client-side authentication functions
export {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  signInWithGoogle,
  getSession,
  getUser,
  onAuthStateChange,
  type AuthResult,
} from './client'

// Server-side authentication functions
export {
  createServerSupabaseClient,
  getServerUser,
  getServerSession,
  isServerAuthenticated,
  requireAuth,
  requireNoAuth,
  getServerUserProfile,
  hasRole,
  requireRole,
} from './server'

// Authentication context and hooks
export {
  AuthProvider,
  useAuth,
  useRequireAuth,
  AuthGuard,
  GuestGuard,
} from './context'
