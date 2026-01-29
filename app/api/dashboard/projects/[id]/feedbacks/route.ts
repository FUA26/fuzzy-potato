import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { projects, feedbacks } from '@/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'

/**
 * GET /api/dashboard/projects/[id]/feedbacks
 *
 * Get feedbacks for a project with filtering and pagination.
 *
 * Query Params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - min_rating: Filter by minimum rating (1-5)
 * - max_rating: Filter by maximum rating (1-5)
 * - status: Filter by status ('new', 'read', 'archived')
 * - tag: Filter by tag (JSONB contains)
 * - search: Search in comments
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

    // Parse and validate query params
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '10'))
    )
    const offset = (page - 1) * limit

    const minRating = searchParams.get('min_rating')
    const maxRating = searchParams.get('max_rating')
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')
    const searchQuery = searchParams.get('search')

    // Verify project ownership
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

    // Build conditions
    const conditions = [eq(feedbacks.projectId, projectId)]

    if (minRating) {
      conditions.push(sql`${feedbacks.rating} >= ${parseInt(minRating)}`)
    }

    if (maxRating) {
      conditions.push(sql`${feedbacks.rating} <= ${parseInt(maxRating)}`)
    }

    if (status && ['new', 'read', 'archived'].includes(status)) {
      conditions.push(eq(feedbacks.status, status))
    }

    if (tag) {
      // Filter by tag in JSONB answers column
      conditions.push(
        sql`${feedbacks.answers}->'tags' @> ${JSON.stringify([tag])}`
      )
    }

    if (searchQuery) {
      // Search in comment field
      conditions.push(
        sql`${feedbacks.answers}->>'comment' ILIKE ${`%${searchQuery}%`}`
      )
    }

    // Get total count for pagination
    const countResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(feedbacks)
      .where(and(...conditions))

    const totalItems = Number(countResult[0]?.count) || 0
    const totalPages = Math.ceil(totalItems / limit)

    // Get feedbacks with pagination
    const feedbacksData = await db
      .select({
        id: feedbacks.id,
        rating: feedbacks.rating,
        status: feedbacks.status,
        answers: feedbacks.answers,
        meta: feedbacks.meta,
        createdAt: feedbacks.createdAt,
      })
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      data: feedbacksData,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    })
  } catch (error) {
    console.error('[Feedbacks List API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/dashboard/projects/[id]/feedbacks
 *
 * Bulk update feedback status.
 *
 * Request Body:
 * - feedback_ids: Array of feedback IDs to update
 * - status: New status ('new', 'read', 'archived')
 *
 * Protected: Requires authentication
 */
const BulkUpdateSchema = z.object({
  feedback_ids: z.array(z.string().uuid()).min(1),
  status: z.enum(['new', 'read', 'archived']),
})

export async function PATCH(
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
    const body = await request.json()

    // Validate request body
    const validationResult = BulkUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { feedback_ids, status } = validationResult.data

    // Verify project ownership
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

    // Update feedbacks (only those belonging to this project)
    const updated = await db
      .update(feedbacks)
      .set({ status })
      .where(
        and(
          eq(feedbacks.projectId, projectId),
          sql`${feedbacks.id} = ANY(${feedback_ids})`
        )
      )
      .returning()

    return NextResponse.json({
      success: true,
      updated_count: updated.length,
      data: updated,
    })
  } catch (error) {
    console.error('[Bulk Update Feedbacks API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
