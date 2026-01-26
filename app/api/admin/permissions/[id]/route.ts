import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { permissions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'

// Get single permission
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const permission = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1)

    if (permission.length === 0) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ permission: permission[0] })
  } catch (error) {
    console.error('Get permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update permission
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, slug, description, resource, action } = body

    // Check if permission exists
    const existingPermission = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1)

    if (existingPermission.length === 0) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    // Check if slug is taken by another permission
    if (slug && slug !== existingPermission[0].slug) {
      const slugTaken = await db
        .select()
        .from(permissions)
        .where(eq(permissions.slug, slug))
        .limit(1)
      if (slugTaken.length > 0) {
        return NextResponse.json(
          { error: 'Permission slug already taken' },
          { status: 400 }
        )
      }
    }

    const updatedPermission = await db
      .update(permissions)
      .set({
        name: name || existingPermission[0].name,
        slug: slug || existingPermission[0].slug,
        description:
          description !== undefined
            ? description
            : existingPermission[0].description,
        resource: resource || existingPermission[0].resource,
        action: action || existingPermission[0].action,
      })
      .where(eq(permissions.id, id))
      .returning()

    return NextResponse.json({ permission: updatedPermission[0] })
  } catch (error) {
    console.error('Update permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete permission
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if permission exists
    const existingPermission = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1)

    if (existingPermission.length === 0) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    await db.delete(permissions).where(eq(permissions.id, id))

    return NextResponse.json({ message: 'Permission deleted successfully' })
  } catch (error) {
    console.error('Delete permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
