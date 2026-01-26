import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/layout/app-sidebar'
import { HeaderNotifications } from '@/components/dashboard/layout/header-notifications'
import { HeaderUser } from '@/components/dashboard/layout/header-user'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userDisplay = {
    name: session.user.name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    avatar: session.user.image || '',
    username: undefined,
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
