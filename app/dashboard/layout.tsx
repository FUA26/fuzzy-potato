'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AppSidebar } from '@/components/dashboard/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface User {
  id: string
  email: string
  name?: string | null
  username?: string | null
  image?: string | null
  createdAt: Date
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch - run once on mount

  useEffect(() => {
    fetchUser()
  }, [])

  // Update titles based on pathname
  useEffect(() => {
    // Clear previous states when pathname changes
    // ...
  }, [pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname === '/dashboard/projects') return 'Projects'
    if (pathname === '/dashboard/team') return 'Team'
    if (pathname === '/dashboard/roles') return 'Roles'
    if (pathname === '/dashboard/permissions') return 'Permissions'
    if (pathname === '/dashboard/settings') return 'Settings'
    return 'Dashboard'
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">{getTitle()}</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
