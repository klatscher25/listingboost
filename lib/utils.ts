import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function for merging and deduplicating CSS class names with Tailwind CSS conflict resolution.
 *
 * Combines the power of clsx for conditional class handling with tailwind-merge for intelligent
 * Tailwind CSS class deduplication. Automatically resolves conflicting Tailwind classes,
 * keeping the most specific or last-defined class when conflicts occur.
 *
 * @function cn
 * @param {...ClassValue[]} inputs - Variable arguments of class values (strings, objects, arrays, etc.)
 * @returns {string} Merged and deduplicated class string with Tailwind conflicts resolved
 * @complexity O(n) where n is the total number of classes across all inputs
 * @dependencies clsx for conditional class handling, tailwind-merge for conflict resolution
 * @usedBy React components, conditional styling, dynamic class composition
 * @relatedTo Tailwind CSS utility classes, component styling system
 * @example
 * ```typescript
 * import { cn } from '@/lib/utils'
 *
 * // Basic merging
 * cn('px-4 py-2', 'bg-blue-500') // 'px-4 py-2 bg-blue-500'
 *
 * // Conflict resolution (last wins)
 * cn('px-4 px-8', 'py-2 py-4') // 'px-8 py-4'
 *
 * // Conditional classes
 * cn('base-class', {
 *   'active-class': isActive,
 *   'disabled-class': isDisabled
 * })
 *
 * // Component usage
 * <div className={cn(
 *   'default-styles',
 *   variant === 'primary' && 'bg-blue-500',
 *   className // Allow override from props
 * )} />
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency using German locale formatting standards.
 *
 * Uses the Intl.NumberFormat API with German locale (de-DE) to format numbers
 * as currency values. Defaults to EUR currency but supports any valid currency code.
 * Applies German formatting conventions (comma as decimal separator, period as thousands separator).
 *
 * @function formatCurrency
 * @param {number} amount - The numeric amount to format as currency
 * @param {string} [currency='EUR'] - ISO 4217 currency code (defaults to EUR for DACH market)
 * @returns {string} Formatted currency string using German locale conventions
 * @complexity O(1) - Single Intl.NumberFormat operation with constant-time formatting
 * @dependencies Intl.NumberFormat (native browser/Node.js API)
 * @usedBy Price displays, financial calculations, invoice generation, dashboard metrics
 * @relatedTo German localization requirements, DACH market focus
 * @throws {RangeError} When invalid currency code is provided
 * @example
 * ```typescript
 * import { formatCurrency } from '@/lib/utils'
 *
 * // Default EUR formatting
 * formatCurrency(1234.56) // '1.234,56 €'
 *
 * // Other currencies
 * formatCurrency(1234.56, 'USD') // '1.234,56 $'
 * formatCurrency(999.99, 'CHF') // '999,99 CHF'
 *
 * // Component usage
 * <span className="price">
 *   {formatCurrency(listing.price)}
 * </span>
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR'
): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Formats a Date object using German locale formatting standards (DD.MM.YYYY).
 *
 * Uses the Intl.DateTimeFormat API with German locale (de-DE) to format dates
 * according to German conventions. Returns dates in DD.MM.YYYY format which is
 * standard for the DACH market and aligns with user expectations.
 *
 * @function formatDate
 * @param {Date} date - The Date object to format
 * @returns {string} Formatted date string in DD.MM.YYYY format (German standard)
 * @complexity O(1) - Single Intl.DateTimeFormat operation with constant-time formatting
 * @dependencies Intl.DateTimeFormat (native browser/Node.js API)
 * @usedBy Date displays, audit timestamps, listing creation dates, dashboard metrics
 * @relatedTo German localization requirements, DACH market date conventions
 * @throws {TypeError} When invalid Date object is provided
 * @example
 * ```typescript
 * import { formatDate } from '@/lib/utils'
 *
 * // Current date
 * formatDate(new Date()) // '22.07.2025' (example)
 *
 * // Specific date
 * formatDate(new Date('2024-01-15')) // '15.01.2024'
 *
 * // Component usage
 * <span className="timestamp">
 *   Erstellt am {formatDate(listing.createdAt)}
 * </span>
 * ```
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE').format(date)
}

/**
 * Creates a Promise-based delay/sleep function for asynchronous code.
 *
 * Utility function that creates a Promise which resolves after a specified number
 * of milliseconds. Useful for implementing delays, rate limiting, animation timing,
 * and testing scenarios that require time-based coordination.
 *
 * @async
 * @function sleep
 * @param {number} ms - Number of milliseconds to delay/sleep
 * @returns {Promise<void>} Promise that resolves after the specified delay
 * @complexity O(1) - Single setTimeout operation with Promise wrapper
 * @dependencies setTimeout (native browser/Node.js API), Promise constructor
 * @usedBy Rate limiting, animation sequences, testing delays, API throttling
 * @relatedTo Async/await patterns, timing control, performance optimization
 * @sideEffects Creates a timer that must be garbage collected after resolution
 * @example
 * ```typescript
 * import { sleep } from '@/lib/utils'
 *
 * // Basic delay
 * await sleep(1000) // Wait 1 second
 * console.log('Executed after 1 second')
 *
 * // Rate limiting API calls
 * for (const item of items) {
 *   await processItem(item)
 *   await sleep(500) // 500ms between calls
 * }
 *
 * // Animation timing
 * const animateSequence = async () => {
 *   setStep(1)
 *   await sleep(300)
 *   setStep(2)
 *   await sleep(300)
 *   setStep(3)
 * }
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
