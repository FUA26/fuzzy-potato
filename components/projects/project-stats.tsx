'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface ProjectStatsProps {
  projectId: string
  type: 'total' | 'rating' | 'nps' | 'month'
}

export function ProjectStats({ projectId, type }: ProjectStatsProps) {
  const [data, setData] = useState<{ value: string; change?: string } | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const range = '30d'
    fetch(`/api/dashboard/projects/${projectId}/stats?range=${range}`)
      .then((res) => res.json())
      .then((res) => {
        const summary = res.summary || {}
        let value = ''
        let change = ''

        switch (type) {
          case 'total':
            value = summary.total_feedback?.toLocaleString() || '0'
            break
          case 'rating':
            value = summary.average_rating?.toFixed(1) || '0.0'
            break
          case 'nps':
            value = summary.nps_score?.toString() || '0'
            break
          case 'month':
            value = summary.total_feedback?.toLocaleString() || '0'
            change = 'last 30 days'
            break
        }

        setData({ value, change })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId, type])

  if (loading) {
    return <Skeleton className="h-8 w-16" />
  }

  return (
    <div>
      <div className="text-2xl font-bold">{data?.value || '0'}</div>
      {data?.change && (
        <p className="text-xs text-muted-foreground">{data.change}</p>
      )}
    </div>
  )
}
