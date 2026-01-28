import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { feedbacks, projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

/**
 * POST /api/v1/widget/feedback
 *
 * Public API endpoint for submitting feedback.
 *
 * Request Body:
 * - project_id (required): UUID of the project
 * - rating (required): Integer 1-5
 * - answers (optional): { tags: string[], comment: string, email: string }
 * - meta (optional): { url, user_agent, device_type, etc }
 *
 * Response: Success message
 */

// Validation schema using Zod
const FeedbackSchema = z.object({
  project_id: z.string().uuid('Invalid project_id format'),
  rating: z.number().int().min(1).max(5),
  answers: z
    .object({
      tags: z.array(z.string()).optional(),
      comment: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  meta: z
    .object({
      url: z.string().optional(),
      user_agent: z.string().optional(),
      device_type: z.enum(['mobile', 'tablet', 'desktop']).optional(),
      os: z.string().optional(),
      browser: z.string().optional(),
      geo: z.string().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate request body
    const validationResult = FeedbackSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify project exists
    const projectResult = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, data.project_id))
      .limit(1)

    if (projectResult.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Insert feedback into database
    await db.insert(feedbacks).values({
      projectId: data.project_id,
      rating: data.rating,
      answers: data.answers || {},
      meta: data.meta || {},
    })

    // TODO: Trigger webhook asynchronously (implement in Phase 2)

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback received',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Feedback Submission API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
