import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import { ProjectSettings } from '@/components/projects/project-settings'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectSettingsPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your project configuration and security
        </p>
      </div>

      {/* Settings */}
      <ProjectSettings projectId={id} />
    </div>
  )
}
