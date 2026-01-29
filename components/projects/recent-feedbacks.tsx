'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, MessageSquare, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface Feedback {
  id: string
  rating: number
  status: string
  answers: {
    tags?: string[]
    comment?: string
  }
  createdAt: string
}

interface RecentFeedbacksProps {
  projectId: string
  limit: number
}

export function RecentFeedbacks({ projectId, limit }: RecentFeedbacksProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/dashboard/projects/${projectId}/feedbacks?limit=${limit}`)
      .then((res) => res.json())
      .then((res) => {
        setFeedbacks(res.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No feedback yet. Share your widget link to start collecting feedback!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className="flex items-start gap-4 p-4 rounded-lg border bg-card"
        >
          {/* Rating */}
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{feedback.rating}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {feedback.answers.comment && (
              <p className="text-sm line-clamp-2 mb-2">
                {feedback.answers.comment}
              </p>
            )}
            {feedback.answers.tags && feedback.answers.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {feedback.answers.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(feedback.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <Badge
                variant={
                  feedback.status === 'new'
                    ? 'default'
                    : feedback.status === 'read'
                      ? 'secondary'
                      : 'outline'
                }
                className="text-xs"
              >
                {feedback.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-4">
        <Link href={`/projects/${projectId}/inbox`}>
          <Button variant="outline" size="sm" className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            View All Feedbacks
          </Button>
        </Link>
      </div>
    </div>
  )
}
