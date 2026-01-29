import { notFound, redirect } from 'next/navigation'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { value: 'overview', label: 'Overview', href: '/projects/[id]/overview' },
  { value: 'inbox', label: 'Inbox', href: '/projects/[id]/inbox' },
  { value: 'builder', label: 'Widget Builder', href: '/projects/[id]/builder' },
  { value: 'install', label: 'Install', href: '/projects/[id]/install' },
  { value: 'settings', label: 'Settings', href: '/projects/[id]/settings' },
]

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect('/login')
  }

  // Verify project ownership
  const project = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      ownerId: projects.ownerId,
    })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)

  if (project.length === 0 || project[0].ownerId !== session.user.id) {
    notFound()
  }

  const projectData = project[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/projects" className="hover:underline">
              Projects
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>{projectData.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {projectData.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            <code className="text-xs bg-muted px-2 py-0.5 rounded">
              /s/{projectData.slug}
            </code>
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const href = tab.href.replace('[id]', id)
            const isActive = tab.value === 'overview' // Default active state
            return (
              <Link
                key={tab.value}
                href={href}
                className={cn(
                  'py-3 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Page Content */}
      {children}
    </div>
  )
}
