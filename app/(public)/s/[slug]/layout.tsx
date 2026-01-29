import { notFound } from 'next/navigation'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const metadata = {
  title: 'Share Your Feedback',
  description: 'We value your opinion. Please share your feedback with us.',
}

interface PublicLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata() {
  return metadata
}

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
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
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {projectData.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Share your feedback with us
              </p>
            </div>

            {/* Content */}
            <>{children}</>
          </div>
        </div>
      </body>
    </html>
  )
}
