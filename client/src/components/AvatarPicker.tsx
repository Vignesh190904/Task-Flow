import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AVATAR_OPTIONS } from '@/lib/auth'

interface AvatarPickerProps {
  selectedAvatar: string
  onAvatarSelect: (avatarUrl: string) => void
  className?: string
}

export function AvatarPicker({ selectedAvatar, onAvatarSelect, className = '' }: AvatarPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {/* Selected Avatar Display */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={selectedAvatar}
          alt="Selected avatar"
          className="w-12 h-12 rounded-full border-2 border-primary"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm"
        >
          {isOpen ? 'Hide Options' : 'Choose Avatar'}
        </Button>
      </div>

      {/* Avatar Options Grid */}
      {isOpen && (
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">
            Choose your avatar
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_OPTIONS.map((avatarUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onAvatarSelect(avatarUrl)
                  setIsOpen(false)
                }}
                className={`p-1 rounded-lg transition-all duration-200 hover:scale-105 ${
                  selectedAvatar === avatarUrl
                    ? 'ring-2 ring-primary bg-primary/10'
                    : 'hover:bg-muted'
                }`}
              >
                <img
                  src={avatarUrl}
                  alt={`Avatar option ${index + 1}`}
                  className="w-8 h-8 rounded-full"
                />
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
} 