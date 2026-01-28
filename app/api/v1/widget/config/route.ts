import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/v1/widget/config
 *
 * Public API endpoint for widget to fetch configuration.
 *
 * Query Params:
 * - project_id (required): UUID of the project
 *
 * Security:
 * - Validates Origin header against domain_whitelist
 * - Returns 403 if domain not whitelisted
 * - Returns 404 if project not found
 *
 * Response: Widget configuration JSON
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('project_id')

    // Validate project_id parameter
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project_id parameter' },
        { status: 400 }
      )
    }

    // Get origin from headers for CORS validation
    const origin =
      request.headers.get('origin') || request.headers.get('referer')

    // Fetch project from database
    const projectResult = await db
      .select({
        id: projects.id,
        name: projects.name,
        widgetConfig: projects.widgetConfig,
        domainWhitelist: projects.domainWhitelist,
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (projectResult.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const project = projectResult[0]

    // Extract domain from origin for validation
    let originDomain: string | null = null
    if (origin) {
      try {
        const url = new URL(origin)
        originDomain = url.hostname
      } catch {
        // Invalid URL, continue without origin check
      }
    }

    // Validate domain whitelist (if whitelist is configured)
    if (project.domainWhitelist && project.domainWhitelist.length > 0) {
      // Allow requests without origin (e.g., direct QR code links)
      if (originDomain && !project.domainWhitelist.includes(originDomain)) {
        return NextResponse.json(
          { error: 'Domain not whitelisted' },
          { status: 403 }
        )
      }
    }

    // Return widget configuration
    return NextResponse.json(
      {
        project_name: project.name,
        theme: project.widgetConfig?.theme || {
          color_primary: '#000000',
          position: 'bottom_right',
          trigger_label: 'Feedback',
        },
        logic: project.widgetConfig?.logic || [],
      },
      {
        status: 200,
        headers: {
          // Cache for 5 minutes to reduce database load
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('[Widget Config API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
