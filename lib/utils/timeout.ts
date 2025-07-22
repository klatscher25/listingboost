/**
 * @file lib/utils/timeout.ts
 * @description Promise timeout utility functions
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from api/freemium/analyze/route.ts for CLAUDE.md compliance
 */

/**
 * Wraps a promise with a timeout
 */
export function timeoutPromise<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Scraping timeout after ' + ms / 1000 + 's'))
    }, ms)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}
