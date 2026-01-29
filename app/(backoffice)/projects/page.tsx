import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ProjectsTable } from '@/components/projects/projects-table'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { Suspense } from 'react'

interface ProjectData {
  feedbackCount: number
  avgRating: number | null
}

export default async function ProjectsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your feedback projects and widgets
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
              }
            >
              <TotalProjects userId={session.user.id} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
              }
            >
              <TotalFeedback userId={session.user.id} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
              }
            >
              <AvgRating userId={session.user.id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>
            View and manage all your feedback projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ProjectsTableSkeleton />}>
            <ProjectsTable userId={session.user.id} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function TotalProjects({ userId }: { userId: string }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/projects`,
    {
      cache: 'no-store',
      headers: {
        cookie: `next-auth.session-token=${userId}`,
      },
    }
  )
  const { data } = await response.json()

  return <div className="text-2xl font-bold">{data?.length || 0}</div>
}

async function TotalFeedback({ userId }: { userId: string }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/projects`,
    {
      cache: 'no-store',
      headers: {
        cookie: `next-auth.session-token=${userId}`,
      },
    }
  )
  const { data } = await response.json()

  const total =
    data?.reduce(
      (sum: number, p: ProjectData) => sum + (p.feedbackCount || 0),
      0
    ) || 0
  return <div className="text-2xl font-bold">{total}</div>
}

async function AvgRating({ userId }: { userId: string }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/projects`,
    {
      cache: 'no-store',
      headers: {
        cookie: `next-auth.session-token=${userId}`,
      },
    }
  )
  const { data } = await response.json()

  const projectsWithRatings =
    data?.filter((p: ProjectData) => p.avgRating !== null) || []
  const avg =
    projectsWithRatings.length > 0
      ? projectsWithRatings.reduce(
          (sum: number, p: ProjectData) => sum + (p.avgRating || 0),
          0
        ) / projectsWithRatings.length
      : 0

  return <div className="text-2xl font-bold">{avg.toFixed(1)}</div>
}

function ProjectsTableSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-12 w-12 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
