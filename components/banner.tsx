'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Banner() {
  const handleClose = () => {
    const banner = document.querySelector('[data-banner]') as HTMLElement
    if (banner) {
      banner.style.display = 'none'
    }
  }

  return (
    <div data-banner className="border-b bg-primary/10 backdrop-blur-sm">
      <div className="container flex items-center justify-between px-4 py-2.5 text-sm">
        <p className="flex-1 text-center font-medium">
          <span className="hidden sm:inline">
            🎉 Phase 4 Complete! Full authentication flow with login, register,
            forgot password & dashboard
          </span>
          <span className="sm:hidden">🎉 Phase 4! Auth flow & dashboard</span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close banner</span>
        </Button>
      </div>
    </div>
  )
}
