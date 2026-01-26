'use client'

import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/dashboard/layout/app-sidebar'
import { HeaderNotifications } from '@/components/dashboard/layout/header-notifications'
import { HeaderUser } from '@/components/dashboard/layout/header-user'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  username?: string | null
  avatar?: string
}

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (!response.ok) {
          // Not authenticated, redirect to login
          window.location.href = '/login'
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        window.location.href = '/login'
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userDisplay = {
    name: user.name || user.email.split('@')[0],
    email: user.email,
    avatar: user.avatar || '',
    username: user.username || undefined,
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="!mt-0 [&_main]:!mt-0">
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <HeaderNotifications />
            <HeaderUser user={userDisplay} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
