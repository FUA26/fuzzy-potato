import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { projects, feedbacks } from '@/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/dashboard/projects
 *
 * Get all projects for the authenticated user.
 * Includes feedback count and average rating for each project.
 *
 * Protected: Requires authentication
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth()

  if (authResult.error) {
    return authResult.error
  }

  const session = authResult.session!

  try {
    // Get all projects with feedback stats
    const userProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        slug: projects.slug,
        tier: projects.tier,
        widgetConfig: projects.widgetConfig,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(eq(projects.ownerId, session.user.id))
      .orderBy(desc(projects.createdAt))

    // Get feedback stats for each project
    const projectsWithStats = await Promise.all(
      userProjects.map(async (project) => {
        const feedbackStats = await db
          .select({
            total: count(),
            avgRating: sql`AVG(${feedbacks.rating})`,
          })
          .from(feedbacks)
          .where(eq(feedbacks.projectId, project.id))

        return {
          ...project,
          feedbackCount: feedbackStats[0]?.total || 0,
          avgRating: feedbackStats[0]?.avgRating
            ? Number(feedbackStats[0].avgRating)
            : null,
        }
      })
    )

    return NextResponse.json({
      data: projectsWithStats,
    })
  } catch (error) {
    console.error('[Projects List API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/dashboard/projects
 *
 * Create a new project.
 *
 * Request Body:
 * - name (required): Project name
 * - slug (required): Unique URL slug
 * - domainWhitelist (required): Array of whitelisted domains
 * - widgetConfig (optional): Widget configuration
 *
 * Protected: Requires authentication
 */
import { sql } from 'drizzle-orm'
import { z } from 'zod'

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  domainWhitelist: z
    .array(z.string())
    .min(1, 'At least one domain is required'),
  widgetConfig: z
    .object({
      theme: z
        .object({
          color_primary: z.string().optional(),
          position: z
            .enum(['bottom_left', 'bottom_right', 'top_left', 'top_right'])
            .optional(),
          trigger_label: z.string().optional(),
        })
        .optional(),
      logic: z
        .array(
          z.object({
            rating_group: z.array(z.number().int().min(1).max(5)),
            title: z.string(),
            tags: z.array(z.string()),
            placeholder: z.string(),
            collect_email: z.boolean(),
            cta_redirect: z.string().optional(),
          })
        )
        .optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  const authResult = await requireAuth()

  if (authResult.error) {
    return authResult.error
  }

  const session = authResult.session!

  try {
    const body = await request.json()

    // Validate request body
    const validationResult = CreateProjectSchema.safeParse(body)
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

    // Generate API key
    const apiKey = generateApiKey()

    // Insert project
    const newProject = await db
      .insert(projects)
      .values({
        ownerId: session.user.id,
        name: data.name,
        slug: data.slug,
        domainWhitelist: data.domainWhitelist,
        apiKey,
        widgetConfig: data.widgetConfig || {},
        tier: 'basic',
      })
      .returning()

    return NextResponse.json(
      {
        data: newProject[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Create Project API] Error:', error)

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate a random API key for the project.
 */
function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
