import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { roles } from '@/db/schema'
import { eq, like, or } from 'drizzle-orm'
import { auth } from '@/auth'

// Get all roles
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    let rolesList
    if (search) {
      rolesList = await db
        .select()
        .from(roles)
        .where(
          or(
            like(roles.name, `%${search}%`),
            like(roles.description, `%${search}%`)
          )
        )
        .orderBy(roles.createdAt)
    } else {
      rolesList = await db.select().from(roles).orderBy(roles.createdAt)
    }

    return NextResponse.json({ roles: rolesList })
  } catch (error) {
    console.error('Get roles error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new role
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, isSystem, permissions } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if role already exists
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1)

    if (existingRole.length > 0) {
      return NextResponse.json(
        { error: 'Role already exists' },
        { status: 400 }
      )
    }

    const newRole = await db
      .insert(roles)
      .values({
        name,
        description: description || null,
        isSystem: isSystem || false,
      })
      .returning()

    // If permissions provided, create role-permission associations
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      const { rolePermissions } = await import('@/db/schema')

      await db.insert(rolePermissions).values(
        permissions.map((permissionId: string) => ({
          roleId: newRole[0].id,
          permissionId,
        }))
      )
    }

    return NextResponse.json({ role: newRole[0] }, { status: 201 })
  } catch (error) {
    console.error('Create role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
