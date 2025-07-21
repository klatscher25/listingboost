/**
 * @file __tests__/auth/client.test.ts
 * @description Comprehensive tests for client-side authentication utilities
 * @created 2025-07-21
 */

import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  signInWithGoogle,
  getSession,
  getUser,
  updateProfile,
  onAuthStateChange,
} from '@/lib/auth/client'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      signInWithOAuth: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  },
}))

const mockSupabase = require('@/lib/supabase').supabase

describe('Auth Client Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console methods to keep test output clean
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await signUp('test@example.com', 'password123', {
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Corp',
      })

      expect(result).toEqual({
        success: true,
        user: mockUser,
      })
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            company: 'Test Corp',
          },
        },
      })
    })

    it('should handle sign up errors', async () => {
      const mockError = { message: 'User already registered' }
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await signUp('test@example.com', 'password123')

      expect(result).toEqual({
        success: false,
        error: 'An account with this email already exists.',
      })
    })

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.signUp.mockRejectedValue(new Error('Network error'))

      const result = await signUp('test@example.com', 'password123')

      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred during sign up',
      })
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await signIn('test@example.com', 'password123')

      expect(result).toEqual({
        success: true,
        user: mockUser,
      })
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle invalid credentials', async () => {
      const mockError = { message: 'Invalid login credentials' }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await signIn('test@example.com', 'wrongpassword')

      expect(result).toEqual({
        success: false,
        error: 'Invalid email or password. Please try again.',
      })
    })
  })

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await signOut()

      expect(result).toEqual({ success: true })
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Sign out failed' }
      mockSupabase.auth.signOut.mockResolvedValue({ error: mockError })

      const result = await signOut()

      expect(result).toEqual({
        success: false,
        error: 'Sign out failed',
      })
    })
  })

  describe('resetPassword', () => {
    it('should successfully initiate password reset', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      const result = await resetPassword('test@example.com')

      expect(result).toEqual({ success: true })
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost/auth/reset-password',
        }
      )
    })
  })

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await updatePassword('newpassword123')

      expect(result).toEqual({
        success: true,
        user: mockUser,
      })
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      })
    })
  })

  describe('signInWithGoogle', () => {
    it('should successfully initiate Google OAuth', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: {},
        error: null,
      })

      const result = await signInWithGoogle()

      expect(result).toEqual({ success: true })
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost/auth/callback',
        },
      })
    })
  })

  describe('getSession', () => {
    it('should successfully get session', async () => {
      const mockSession = { access_token: 'token123', user: { id: '123' } }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await getSession()

      expect(result).toEqual(mockSession)
    })

    it('should return null on error', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: null,
        error: { message: 'Session error' },
      })

      const result = await getSession()

      expect(result).toBeNull()
    })
  })

  describe('getUser', () => {
    it('should successfully get user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await getUser()

      expect(result).toEqual(mockUser)
    })

    it('should return null on error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'User error' },
      })

      const result = await getUser()

      expect(result).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should successfully update profile', async () => {
      const mockUpdate = mockSupabase.from().update().eq
      mockUpdate.mockResolvedValue({ error: null })

      const updates = {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        timezone: 'Europe/Berlin',
        language: 'de',
      }

      const result = await updateProfile('123', updates)

      expect(result).toEqual({})
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle profile update errors', async () => {
      const mockUpdate = mockSupabase.from().update().eq
      mockUpdate.mockResolvedValue({ error: { message: 'Update failed' } })

      const result = await updateProfile('123', { full_name: 'Test User' })

      expect(result).toEqual({
        error: 'Profile update failed. Please try again.',
      })
    })
  })

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = jest.fn()
      const mockUnsubscribe = jest.fn()
      mockSupabase.auth.onAuthStateChange.mockReturnValue(mockUnsubscribe)

      const unsubscribe = onAuthStateChange(mockCallback)

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(
        mockCallback
      )
      expect(unsubscribe).toBe(mockUnsubscribe)
    })
  })
})

describe('Error Message Handling', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const errorTestCases = [
    {
      supabaseError: 'Invalid login credentials',
      expectedMessage: 'Invalid email or password. Please try again.',
    },
    {
      supabaseError: 'User already registered',
      expectedMessage: 'An account with this email already exists.',
    },
    {
      supabaseError: 'Email not confirmed',
      expectedMessage:
        'Please check your email and click the confirmation link.',
    },
    {
      supabaseError: 'Password should be at least 6 characters',
      expectedMessage: 'Password must be at least 6 characters long.',
    },
    {
      supabaseError: 'Invalid email',
      expectedMessage: 'Please enter a valid email address.',
    },
    {
      supabaseError: 'Custom error message',
      expectedMessage: 'Custom error message',
    },
  ]

  errorTestCases.forEach(({ supabaseError, expectedMessage }) => {
    it(`should handle "${supabaseError}" error correctly`, async () => {
      const mockError = { message: supabaseError }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await signIn('test@example.com', 'password')

      expect(result.error).toBe(expectedMessage)
    })
  })
})
