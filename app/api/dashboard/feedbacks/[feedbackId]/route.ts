import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { feedbacks, projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'

/**
 * PATCH /api/dashboard/feedbacks/[feedbackId]
 *
 * Update a single feedback's status.
 * Used for "Mark as Read" or "Archive" actions.
 *
 * Request Body:
 * - status: 'new', 'read', or 'archived'
 *
 * Protected: Requires authentication + ownership
 */
const UpdateFeedbackSchema = z.object({
  status: z.enum(['new', 'read', 'archived']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const authResult = await requireAuth()

  if (authResult.error) {
    return authResult.error
  }

  const session = authResult.session!
  const { feedbackId } = await params

  try {
    const body = await request.json()

    // Validate request body
    const validationResult = UpdateFeedbackSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { status } = validationResult.data

    // Verify ownership by joining with projects table
    const feedbackWithProject = await db
      .select({
        feedbackId: feedbacks.id,
        projectOwnerId: projects.ownerId,
      })
      .from(feedbacks)
      .innerJoin(projects, eq(feedbacks.projectId, projects.id))
      .where(eq(feedbacks.id, feedbackId))
      .limit(1)

    if (feedbackWithProject.length === 0) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    if (feedbackWithProject[0].projectOwnerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update feedback status
    const updated = await db
      .update(feedbacks)
      .set({ status })
      .where(eq(feedbacks.id, feedbackId))
      .returning()

    return NextResponse.json({
      data: updated[0],
    })
  } catch (error) {
    console.error('[Update Feedback API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/dashboard/feedbacks/[feedbackId]
 *
 * Delete a single feedback.
 *
 * Protected: Requires authentication + ownership
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const authResult = await requireAuth()

  if (authResult.error) {
    return authResult.error
  }

  const session = authResult.session!
  const { feedbackId } = await params

  try {
    // Verify ownership
    const feedbackWithProject = await db
      .select({
        feedbackId: feedbacks.id,
        projectOwnerId: projects.ownerId,
      })
      .from(feedbacks)
      .innerJoin(projects, eq(feedbacks.projectId, projects.id))
      .where(eq(feedbacks.id, feedbackId))
      .limit(1)

    if (feedbackWithProject.length === 0) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    if (feedbackWithProject[0].projectOwnerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete feedback
    await db.delete(feedbacks).where(eq(feedbacks.id, feedbackId))

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted',
    })
  } catch (error) {
    console.error('[Delete Feedback API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
