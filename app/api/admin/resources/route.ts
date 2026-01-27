import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { resources } from '@/db/schema'
import { eq, like, or, asc } from 'drizzle-orm'
import { requireServerPermission } from '@/lib/rbac/server'

/**
 * GET /api/admin/resources
 * Get all resources with optional search
 */
export async function GET(req: NextRequest) {
  try {
    await requireServerPermission('resources.read')

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    let resourcesList
    if (search) {
      resourcesList = await db
        .select()
        .from(resources)
        .where(
          or(
            like(resources.name, `%${search}%`),
            like(resources.identifier, `%${search}%`),
            like(resources.description, `%${search}%`)
          )
        )
        .orderBy(asc(resources.name))
    } else {
      resourcesList = await db
        .select()
        .from(resources)
        .orderBy(asc(resources.name))
    }

    return NextResponse.json({ resources: resourcesList })
  } catch (error) {
    console.error('Get resources error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/resources
 * Create a new resource
 */
export async function POST(req: NextRequest) {
  try {
    await requireServerPermission('resources.create')

    const body = await req.json()
    const { name, identifier, description } = body

    if (!name || !identifier) {
      return NextResponse.json(
        { error: 'Name and identifier are required' },
        { status: 400 }
      )
    }

    // Validate identifier format (alphanumeric, dashes, underscores only)
    const identifierRegex = /^[a-z0-9_-]+$/
    if (!identifierRegex.test(identifier)) {
      return NextResponse.json(
        {
          error:
            'Identifier must contain only lowercase letters, numbers, dashes, and underscores',
        },
        { status: 400 }
      )
    }

    // Check if resource already exists
    const existingResource = await db
      .select()
      .from(resources)
      .where(eq(resources.identifier, identifier))
      .limit(1)

    if (existingResource.length > 0) {
      return NextResponse.json(
        { error: 'Resource with this identifier already exists' },
        { status: 400 }
      )
    }

    const newResource = await db
      .insert(resources)
      .values({
        name,
        identifier,
        description: description || null,
      })
      .returning()

    return NextResponse.json({ resource: newResource[0] }, { status: 201 })
  } catch (error) {
    console.error('Create resource error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
