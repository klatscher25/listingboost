/**
 * @file components/analyze/URLInputField.tsx
 * @description Modern glassmorphism URL input with real-time validation
 * @created 2025-07-21
 * @todo FRONTEND-001-01: Critical path component - URL input field
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MODERN_DESIGN, glass, interactiveGlass } from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'
import type { URLInputProps, URLValidation } from './shared-types'

/**
 * 🌟 MODERN URL INPUT FIELD
 * 
 * Features:
 * - Glassmorphism design with smooth animations
 * - Real-time URL validation with debouncing  
 * - German localization with text expansion support
 * - Mobile-first responsive design
 * - Accessibility optimized (WCAG 2.1 AA)
 * - Floating label with micro-animations
 */

export function URLInputField({
  value,
  onChange,
  onValidation,
  validationDebounce = 500,
  supportedDomains = ['airbnb.com', 'airbnb.de', 'airbnb.fr', 'airbnb.it', 'airbnb.es', 'airbnb.co.uk'],
  autoFocus = false,
  className,
  disabled = false,
  size = 'lg',
  ...props
}: URLInputProps) {
  // State management
  const [validation, setValidation] = useState<URLValidation | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Validation logic
  const validateURL = useCallback((url: string): URLValidation => {
    const result: URLValidation = {
      isValid: false,
      isAirbnb: false,
      domain: null,
      listingId: null,
      errors: []
    }

    // Empty URL validation
    if (!url.trim()) {
      result.errors.push(ANALYZE_UI.form.url.required)
      return result
    }

    try {
      const urlObject = new URL(url.toLowerCase())
      result.domain = urlObject.hostname

      // Check if it's an Airbnb domain
      const isAirbnbDomain = supportedDomains.some(domain => 
        urlObject.hostname === domain || urlObject.hostname === `www.${domain}`
      )

      if (!isAirbnbDomain) {
        result.errors.push(ANALYZE_UI.form.url.invalid)
        return result
      }

      result.isAirbnb = true

      // Extract listing ID from path
      const pathMatch = urlObject.pathname.match(/\/rooms\/(\d+)/)
      if (!pathMatch) {
        result.errors.push(ANALYZE_UI.form.url.invalid)
        return result
      }

      result.listingId = pathMatch[1]
      result.isValid = true
      
    } catch (error) {
      result.errors.push(ANALYZE_UI.form.url.invalid)
    }

    return result
  }, [supportedDomains])

  // Debounced validation effect
  useEffect(() => {
    if (!value || !hasInteracted) return

    setIsValidating(true)
    
    const timeoutId = setTimeout(() => {
      const validationResult = validateURL(value)
      setValidation(validationResult)
      setIsValidating(false)
      onValidation?.(validationResult)
    }, validationDebounce)

    return () => clearTimeout(timeoutId)
  }, [value, validateURL, validationDebounce, onValidation, hasInteracted])

  // Event handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setHasInteracted(true)
    
    // Reset validation state on change
    if (validation && !newValue) {
      setValidation(null)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setHasInteracted(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Enter to trigger form submission
    if (e.key === 'Enter' && validation?.isValid) {
      e.preventDefault()
      // Parent form will handle submission
    }
  }

  // Dynamic styling based on state
  const getInputState = () => {
    if (disabled) return 'disabled'
    if (validation?.errors.length && hasInteracted) return 'error'
    if (validation?.isValid) return 'success'
    if (isFocused) return 'focused'
    return 'default'
  }

  const inputState = getInputState()

  // Size variants
  const sizeClasses = {
    xs: 'text-xs px-2 py-2 h-8',
    sm: 'text-sm px-3 py-2 h-10',
    md: 'text-base px-4 py-3 h-12',
    lg: 'text-lg px-5 py-4 h-14',
    xl: 'text-xl px-6 py-5 h-16'
  }

  // State-specific styling
  const stateStyles = {
    default: `${MODERN_DESIGN.glass.input.base} ${MODERN_DESIGN.glass.input.border}`,
    focused: `${MODERN_DESIGN.glass.input.base} ${MODERN_DESIGN.glass.input.focus}`,
    success: `${MODERN_DESIGN.glass.input.base} border-emerald-400/60 bg-emerald-50/20`,
    error: `${MODERN_DESIGN.glass.input.base} ${MODERN_DESIGN.glass.input.error}`,
    disabled: `${MODERN_DESIGN.glass.input.base} opacity-50 cursor-not-allowed`
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Input Container with Glassmorphism */}
      <div className="relative">
        {/* Floating Label */}
        <label
          htmlFor={props.id}
          className={cn(
            'absolute left-5 transition-all duration-300 ease-out pointer-events-none',
            'text-gray-600 bg-gradient-to-r from-white/80 to-white/60 px-2 rounded-md',
            (isFocused || value) 
              ? '-top-3 text-sm font-medium text-blue-700' 
              : `top-1/2 -translate-y-1/2 ${sizeClasses[size].includes('text-lg') ? 'text-lg' : 'text-base'}`
          )}
        >
          {ANALYZE_UI.form.url.label}
          <span className="text-red-400 ml-1">*</span>
        </label>

        {/* Main Input Field */}
        <input
          type="url"
          inputMode="url"
          autoComplete="url"
          autoFocus={autoFocus}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={isFocused ? ANALYZE_UI.form.url.placeholderLong : ''}
          className={cn(
            // Base styles
            'w-full rounded-xl font-medium placeholder-gray-400/70',
            'focus:outline-none focus:ring-0 border-0',
            'transition-all duration-300 ease-out',
            // Size
            sizeClasses[size],
            // State styles
            stateStyles[inputState],
            // Animation
            MODERN_DESIGN.animations.gentle
          )}
          {...props}
        />

        {/* Validation Icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {/* Loading Spinner */}
          {isValidating && (
            <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          )}
          
          {/* Success Icon */}
          {validation?.isValid && !isValidating && (
            <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {/* Error Icon */}
          {validation?.errors.length && hasInteracted && !isValidating && (
            <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* URL Type Badge */}
        {validation?.isValid && validation.domain && (
          <div className="absolute -top-3 right-4">
            <div className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              MODERN_DESIGN.glass.secondary.base,
              MODERN_DESIGN.glass.secondary.border,
              'text-blue-700'
            )}>
              {validation.domain}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text & Validation Messages */}
      <div className="mt-3 space-y-2">
        {/* Helper Text (when no errors) */}
        {!validation?.errors.length && (
          <p className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {ANALYZE_UI.form.url.helper}
          </p>
        )}

        {/* Success Message */}
        {validation?.isValid && (
          <div className={cn(
            'flex items-center p-3 rounded-lg text-sm font-medium text-emerald-700',
            MODERN_DESIGN.glass.secondary.base,
            'border border-emerald-200/50 bg-emerald-50/30'
          )}>
            <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {ANALYZE_UI.form.url.valid} • Listing ID: {validation.listingId}
          </div>
        )}

        {/* Error Messages */}
        {validation?.errors.map((error, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center p-3 rounded-lg text-sm font-medium text-red-700',
              MODERN_DESIGN.glass.secondary.base,
              'border border-red-200/50 bg-red-50/30',
              MODERN_DESIGN.animations.gentle
            )}
          >
            <svg className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        ))}

        {/* Validating State */}
        {isValidating && (
          <div className={cn(
            'flex items-center p-3 rounded-lg text-sm font-medium text-blue-700',
            MODERN_DESIGN.glass.secondary.base,
            'border border-blue-200/50 bg-blue-50/30'
          )}>
            <div className="w-4 h-4 mr-2 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            {ANALYZE_UI.form.url.validating}
          </div>
        )}
      </div>
    </div>
  )
}

// Display name for debugging
URLInputField.displayName = 'URLInputField'

// Default export for convenience
export default URLInputField