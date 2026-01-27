import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { resources, permissions } from '@/db/schema'
import { eq, ne, and } from 'drizzle-orm'
import { requireServerPermission } from '@/lib/rbac/server'

/**
 * PUT /api/admin/resources/[id]
 * Update a resource
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireServerPermission('resources.update')

    const { id } = await params
    const body = await req.json()
    const { name, identifier, description } = body

    if (!name || !identifier) {
      return NextResponse.json(
        { error: 'Name and identifier are required' },
        { status: 400 }
      )
    }

    // Validate identifier format
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

    // Check if another resource has this identifier
    const existingResource = await db
      .select()
      .from(resources)
      .where(and(eq(resources.identifier, identifier), ne(resources.id, id)))
      .limit(1)

    if (existingResource.length > 0) {
      return NextResponse.json(
        { error: 'Resource with this identifier already exists' },
        { status: 400 }
      )
    }

    await db
      .update(resources)
      .set({
        name,
        identifier,
        description: description || null,
      })
      .where(eq(resources.id, id))

    return NextResponse.json({ message: 'Resource updated successfully' })
  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      {
        status:
          error instanceof Error && error.message.includes('Permission')
            ? 403
            : 500,
      }
    )
  }
}

/**
 * DELETE /api/admin/resources/[id]
 * Delete a resource
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireServerPermission('resources.delete')

    const { id } = await params

    // Get resource to check identifier
    const resourceResult = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1)

    if (resourceResult.length === 0) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    const resource = resourceResult[0]

    // Check usage in permissions
    const usage = await db
      .select()
      .from(permissions)
      .where(eq(permissions.resource, resource.identifier))
      .limit(1)

    if (usage.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete resource because it is referenced by existing permissions.',
        },
        { status: 409 }
      )
    }

    await db.delete(resources).where(eq(resources.id, id))

    return NextResponse.json({ message: 'Resource deleted successfully' })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      {
        status:
          error instanceof Error && error.message.includes('Permission')
            ? 403
            : 500,
      }
    )
  }
}
