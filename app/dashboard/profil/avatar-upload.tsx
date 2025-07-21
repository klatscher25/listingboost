/**
 * @file app/dashboard/profil/avatar-upload.tsx
 * @description Avatar upload component with German UI
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-04: User Profile Management
 */

'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  onAvatarChange: (url: string | null) => void
  userId: string
}

/**
 * Avatar Upload Component
 * Handles image upload to Supabase Storage with German UI
 */
export default function AvatarUpload({
  currentAvatarUrl,
  onAvatarChange,
  userId,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Bitte wählen Sie eine gültige Bilddatei aus.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Datei ist zu groß. Maximale Größe: 5MB.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Avatar upload failed:', uploadError)
        setUploadError('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        onAvatarChange(urlData.publicUrl)
        setUploadError(null)
      } else {
        setUploadError('Fehler beim Abrufen der Bild-URL.')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      setUploadError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = () => {
    onAvatarChange(null)
    setUploadError(null)
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Current Avatar */}
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Profilbild"
              className="h-full w-full object-cover"
              onError={(e) => {
                // Handle broken images
                const target = e.target as HTMLImageElement
                target.src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEMzNi42ODYzIDQwIDM0IDM3LjMxMzcgMzQgMzRDMzQgMzAuNjg2MyAzNi42ODYzIDI4IDQwIDI4QzQzLjMxMzcgMjggNDYgMzAuNjg2MyA0NiAzNEM0NiAzNy4zMTM3IDQzLjMxMzcgNDAgNDAgNDBaTTQwIDQyQzQ3LjE3OTcgNDIgNTMgNDcuODIwMyA1MyA1NVY1OEgzNFY1NUM0NyA0Ny44MjAzIDQ5LjgyMDMgNDIgNDAgNDJaIiBmaWxsPSIjOUM5Q0EzIi8+Cjwvc3ZnPgo='
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <button
              type="button"
              onClick={handleClickUpload}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isUploading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Wird hochgeladen...
                </span>
              ) : (
                'Bild hochladen'
              )}
            </button>

            {currentAvatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="ml-2 text-red-600 hover:text-red-700 disabled:text-gray-400 text-sm font-medium"
              >
                Entfernen
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            JPG, PNG oder GIF. Maximal 5MB.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
