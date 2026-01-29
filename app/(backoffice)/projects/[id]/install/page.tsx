import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Code } from 'lucide-react'
import { InstallationContent } from '@/components/projects/installation-content'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InstallationPage({ params }: PageProps) {
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
          <Code className="h-6 w-6" />
          Installation
        </h2>
        <p className="text-muted-foreground">
          Get your widget code and share links
        </p>
      </div>

      {/* Installation Content */}
      <InstallationContent projectId={id} />
    </div>
  )
}
