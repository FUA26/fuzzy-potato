import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { permissions } from '@/db/schema'
import { eq, like, or } from 'drizzle-orm'
import { auth } from '@/auth'

// Get all permissions
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    let permissionsList
    if (search) {
      permissionsList = await db
        .select()
        .from(permissions)
        .where(
          or(
            like(permissions.name, `%${search}%`),
            like(permissions.slug, `%${search}%`),
            like(permissions.resource, `%${search}%`)
          )
        )
        .orderBy(permissions.resource, permissions.action)
    } else {
      permissionsList = await db
        .select()
        .from(permissions)
        .orderBy(permissions.resource, permissions.action)
    }

    return NextResponse.json({ permissions: permissionsList })
  } catch (error) {
    console.error('Get permissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new permission
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, slug, description, resource, action } = body

    if (!name || !slug || !resource || !action) {
      return NextResponse.json(
        { error: 'Name, slug, resource, and action are required' },
        { status: 400 }
      )
    }

    // Check if permission already exists
    const existingPermission = await db
      .select()
      .from(permissions)
      .where(eq(permissions.slug, slug))
      .limit(1)

    if (existingPermission.length > 0) {
      return NextResponse.json(
        { error: 'Permission already exists' },
        { status: 400 }
      )
    }

    const newPermission = await db
      .insert(permissions)
      .values({
        name,
        slug,
        description: description || null,
        resource,
        action,
      })
      .returning()

    return NextResponse.json({ permission: newPermission[0] }, { status: 201 })
  } catch (error) {
    console.error('Create permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
