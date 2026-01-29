'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Checkbox } from '@/components/ui/checkbox'

interface Feedback {
  id: string
  rating: number
  status: string
  answers: {
    tags?: string[]
    comment?: string
    email?: string
  }
  meta?: {
    url?: string
    browser?: string
    os?: string
  }
  createdAt: string
}

interface FeedbackInboxProps {
  projectId: string
  page: number
  rating?: string
  status?: string
  tag?: string
}

export function FeedbackInbox({
  projectId,
  page,
  rating,
  status,
  tag,
}: FeedbackInboxProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
    })
    if (rating) params.set('min_rating', rating)
    if (status) params.set('status', status)
    if (tag) params.set('tag', tag)

    fetch(`/api/dashboard/projects/${projectId}/feedbacks?${params}`)
      .then((res) => res.json())
      .then((res) => {
        setFeedbacks(res.data || [])
        setPagination(
          res.pagination || { current_page: 1, total_pages: 1, total_items: 0 }
        )
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId, page, rating, status, tag])

  const handleStatusChange = async (feedbackId: string, newStatus: string) => {
    await fetch(`/api/dashboard/feedbacks/${feedbackId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    // Refresh the list
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
    })
    if (rating) params.set('min_rating', rating)
    if (status) params.set('status', status)
    if (tag) params.set('tag', tag)

    fetch(`/api/dashboard/projects/${projectId}/feedbacks?${params}`)
      .then((res) => res.json())
      .then((res) => {
        setFeedbacks(res.data || [])
      })
  }

  const handleBulkAction = async (newStatus: string) => {
    if (selected.length === 0) return

    await fetch(`/api/dashboard/projects/${projectId}/feedbacks`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback_ids: selected, status: newStatus }),
    })
    setSelected([])
    // Refresh
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
    })
    if (rating) params.set('min_rating', rating)
    if (status) params.set('status', status)
    if (tag) params.set('tag', tag)

    fetch(`/api/dashboard/projects/${projectId}/feedbacks?${params}`)
      .then((res) => res.json())
      .then((res) => {
        setFeedbacks(res.data || [])
      })
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">Loading...</div>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No feedback found</p>
      </div>
    )
  }

  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    params.set('page', pageNum.toString())
    if (rating) params.set('rating', rating)
    if (status) params.set('status', status)
    if (tag) params.set('tag', tag)
    return `/projects/${projectId}/inbox?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm">{selected.length} selected</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBulkAction('read')}
          >
            Mark as Read
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBulkAction('archived')}
          >
            Archive
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
            Cancel
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selected.length === feedbacks.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelected(feedbacks.map((f) => f.id))
                    } else {
                      setSelected([])
                    }
                  }}
                />
              </TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(feedback.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelected([...selected, feedback.id])
                      } else {
                        setSelected(selected.filter((id) => id !== feedback.id))
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{feedback.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="line-clamp-2 text-sm">
                    {feedback.answers.comment || (
                      <span className="text-muted-foreground">No comment</span>
                    )}
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {feedback.answers.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {feedback.answers.tags &&
                      feedback.answers.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{feedback.answers.tags.length - 2}
                        </Badge>
                      )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant={
                      feedback.status === 'new'
                        ? 'default'
                        : feedback.status === 'read'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="text-xs cursor-pointer"
                    onClick={() => {
                      const newStatus =
                        feedback.status === 'new' ? 'read' : 'new'
                      handleStatusChange(feedback.id, newStatus)
                    }}
                  >
                    {feedback.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(feedback.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Feedback Details</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-lg font-semibold">
                              {feedback.rating}
                            </span>
                          </div>
                        </div>

                        {/* Comment */}
                        {feedback.answers.comment && (
                          <div>
                            <span className="text-sm font-medium">
                              Comment:
                            </span>
                            <p className="mt-1 text-sm">
                              {feedback.answers.comment}
                            </p>
                          </div>
                        )}

                        {/* Tags */}
                        {feedback.answers.tags &&
                          feedback.answers.tags.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Tags:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {feedback.answers.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Email */}
                        {feedback.answers.email && (
                          <div>
                            <span className="text-sm font-medium">Email:</span>
                            <p className="mt-1 text-sm">
                              {feedback.answers.email}
                            </p>
                          </div>
                        )}

                        {/* Meta */}
                        {feedback.meta && (
                          <div className="space-y-1">
                            <span className="text-sm font-medium">
                              Metadata:
                            </span>
                            {feedback.meta.url && (
                              <p className="text-xs text-muted-foreground">
                                URL: {feedback.meta.url}
                              </p>
                            )}
                            {feedback.meta.browser && (
                              <p className="text-xs text-muted-foreground">
                                Browser: {feedback.meta.browser}
                              </p>
                            )}
                            {feedback.meta.os && (
                              <p className="text-xs text-muted-foreground">
                                OS: {feedback.meta.os}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(feedback.id, 'read')
                            }
                          >
                            Mark as Read
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(feedback.id, 'archived')
                            }
                          >
                            Archive
                          </Button>
                          <DrawerClose asChild>
                            <Button size="sm" variant="ghost">
                              Close
                            </Button>
                          </DrawerClose>
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {pagination.total_items} feedbacks
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            asChild={page > 1}
          >
            {page > 1 ? (
              <Link href={buildPageUrl(page - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </>
            )}
          </Button>
          <span className="text-sm">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.total_pages}
            asChild={page < pagination.total_pages}
          >
            {page < pagination.total_pages ? (
              <Link href={buildPageUrl(page + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
