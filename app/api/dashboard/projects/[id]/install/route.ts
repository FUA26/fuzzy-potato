import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/dashboard/projects/[id]/install
 *
 * Get installation assets for a project.
 * Returns the embed script, public link, and QR code URL.
 *
 * Protected: Requires authentication + ownership
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
    // Verify ownership
    const project = await db
      .select({
        id: projects.id,
        name: projects.name,
        slug: projects.slug,
        apiKey: projects.apiKey,
      })
      .from(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id))
      )
      .limit(1)

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const projectData = project[0]

    // Generate script snippet
    const scriptSnippet = `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/widget.js" data-project-id="${projectData.id}"></script>`

    // Generate public link
    const publicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${projectData.slug}`

    // Generate QR code URL (using external service)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicLink)}`

    return NextResponse.json({
      data: {
        script_snippet: scriptSnippet,
        public_link: publicLink,
        qr_code_url: qrCodeUrl,
        project_id: projectData.id,
        project_name: projectData.name,
      },
    })
  } catch (error) {
    console.error('[Project Install API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
