import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Inbox, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeedbackInbox } from '@/components/projects/feedback-inbox'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    page?: string
    rating?: string
    status?: string
    tag?: string
  }>
}

export default async function FeedbackInboxPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const { page, rating, status, tag } = await searchParams
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const pageNum = parseInt(page || '1')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            Feedback Inbox
          </h2>
          <p className="text-muted-foreground">
            View and manage all feedback from your users
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackInboxFilters projectId={id} />
        </CardContent>
      </Card>

      {/* Feedback List */}
      <FeedbackInbox
        projectId={id}
        page={pageNum}
        rating={rating}
        status={status}
        tag={tag}
      />
    </div>
  )
}

function FeedbackInboxFilters({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Rating Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Rating:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <Button
              key={r}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              asChild
            >
              <a href={`/projects/${projectId}/inbox?rating=${r}`}>{r}</a>
            </Button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" asChild>
            <a href={`/projects/${projectId}/inbox?status=new`}>New</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/projects/${projectId}/inbox?status=read`}>Read</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/projects/${projectId}/inbox?status=archived`}>
              Archived
            </a>
          </Button>
        </div>
      </div>

      <Button variant="ghost" size="sm" asChild>
        <a href={`/projects/${projectId}/inbox`}>Clear filters</a>
      </Button>
    </div>
  )
}
