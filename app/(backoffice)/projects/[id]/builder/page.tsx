import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Hammer } from 'lucide-react'
import { WidgetBuilder } from '@/components/projects/widget-builder'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WidgetBuilderPage({ params }: PageProps) {
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
          <Hammer className="h-6 w-6" />
          Widget Builder
        </h2>
        <p className="text-muted-foreground">
          Customize how your feedback widget looks and behaves
        </p>
      </div>

      {/* Builder */}
      <WidgetBuilder projectId={id} />
    </div>
  )
}
