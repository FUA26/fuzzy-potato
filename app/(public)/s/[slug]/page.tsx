import { notFound } from 'next/navigation'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { FeedbackForm } from '@/components/public/feedback-form'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicFeedbackPage({ params }: PageProps) {
  const { slug } = await params

  // Fetch project by slug
  const project = await db
    .select({
      id: projects.id,
      name: projects.name,
      widgetConfig: projects.widgetConfig,
    })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1)

  if (project.length === 0) {
    notFound()
  }

  const projectData = project[0]

  return (
    <FeedbackForm
      projectId={projectData.id}
      config={projectData.widgetConfig}
    />
  )
}
