/**
 * @file components/auth/AlertMessages.tsx
 * @description Alert message components for success and error states
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-07: Extracted from app/auth/register/page.tsx for CLAUDE.md compliance
 */

'use client'

interface AlertMessagesProps {
  generalError?: string
  successMessage?: string
}

export function AlertMessages({
  generalError,
  successMessage,
}: AlertMessagesProps) {
  return (
    <>
      {generalError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {generalError}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}
    </>
  )
}
