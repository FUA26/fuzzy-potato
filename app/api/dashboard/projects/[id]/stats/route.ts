import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { projects, feedbacks } from '@/db/schema'
import { eq, and, sql, gte } from 'drizzle-orm'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/dashboard/projects/[id]/stats
 *
 * Get analytics statistics for a project.
 *
 * Query Params:
 * - range: 7d, 30d, this_month (default: 30d)
 *
 * Returns:
 * - Summary: total_feedback, average_rating, nps_score
 * - Chart data: daily average ratings and counts
 * - Top tags: most frequently used tags
 *
 * Protected: Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()

  if (authResult.error) {
    return authResult.error
  }

  const session = authResult.session!
  const { id: projectId } = await params

  try {
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '30d'

    // Verify ownership
    const existingProject = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id))
      )
      .limit(1)

    if (existingProject.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get summary stats
    const summaryResult = await db
      .select({
        total: sql<number>`COUNT(*)`,
        avgRating: sql<number>`AVG(${feedbacks.rating})`,
      })
      .from(feedbacks)
      .where(
        and(
          eq(feedbacks.projectId, projectId),
          gte(feedbacks.createdAt, startDate)
        )
      )

    const summary = {
      total_feedback: Number(summaryResult[0]?.total) || 0,
      average_rating: summaryResult[0]?.avgRating
        ? Number(summaryResult[0].avgRating.toFixed(1))
        : 0,
    }

    // Calculate NPS (Net Promoter Score)
    // NPS = % Promoters (4-5) - % Detractors (1-2)
    const npsResult = await db
      .select({
        promoters: sql<number>`COUNT(*) FILTER (WHERE ${feedbacks.rating} >= 4)`,
        detractors: sql<number>`COUNT(*) FILTER (WHERE ${feedbacks.rating} <= 2)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(feedbacks)
      .where(
        and(
          eq(feedbacks.projectId, projectId),
          gte(feedbacks.createdAt, startDate)
        )
      )

    const npsData = npsResult[0]
    const npsScore =
      npsData.total && npsData.total > 0
        ? Math.round(
            (npsData.promoters / npsData.total) * 100 -
              (npsData.detractors / npsData.total) * 100
          )
        : 0

    // Get chart data (daily aggregation)
    const chartData = await db
      .select({
        date: sql<string>`DATE(${feedbacks.createdAt})`,
        avgRating: sql<number>`AVG(${feedbacks.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(feedbacks)
      .where(
        and(
          eq(feedbacks.projectId, projectId),
          gte(feedbacks.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${feedbacks.createdAt})`)
      .orderBy(sql`DATE(${feedbacks.createdAt})`)

    // Get top tags from JSONB answers column
    // This is a simplified version - you might want to use raw SQL for better performance
    const allFeedbacks = await db
      .select({
        answers: feedbacks.answers,
      })
      .from(feedbacks)
      .where(
        and(
          eq(feedbacks.projectId, projectId),
          gte(feedbacks.createdAt, startDate)
        )
      )

    // Aggregate tags manually (for now)
    const tagCounts = new Map<string, number>()
    for (const feedback of allFeedbacks) {
      const tags = feedback.answers?.tags || []
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({
        tag,
        count,
        sentiment: count > 10 ? 'positive' : 'neutral', // Simplified sentiment
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      summary: {
        ...summary,
        nps_score: npsScore,
      },
      chart_data: chartData.map((item) => ({
        date: item.date,
        avg_rating: item.avgRating ? Number(item.avgRating.toFixed(1)) : 0,
        count: Number(item.count),
      })),
      top_tags: topTags,
    })
  } catch (error) {
    console.error('[Project Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
