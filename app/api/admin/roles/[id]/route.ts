import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { roles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyToken } from '@/lib/auth'

// Get single role
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await req.cookies
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const role = await db.select().from(roles).where(eq(roles.id, id)).limit(1)

    if (role.length === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Fetch role permissions
    const { rolePermissions } = await import('@/db/schema')
    const permissions = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, id))

    return NextResponse.json({
      role: {
        ...role[0],
        permissions: permissions.map((p) => p.permissionId),
      },
    })
  } catch (error) {
    console.error('Get role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update role
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await req.cookies
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, isSystem, permissions } = body

    // Check if role exists
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1)

    if (existingRole.length === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Check if system role
    if (existingRole[0].isSystem) {
      return NextResponse.json(
        { error: 'Cannot modify system roles' },
        { status: 403 }
      )
    }

    // Check if name is taken by another role
    if (name && name !== existingRole[0].name) {
      const nameTaken = await db
        .select()
        .from(roles)
        .where(eq(roles.name, name))
        .limit(1)
      if (nameTaken.length > 0) {
        return NextResponse.json(
          { error: 'Role name already taken' },
          { status: 400 }
        )
      }
    }

    const updatedRole = await db
      .update(roles)
      .set({
        name: name || existingRole[0].name,
        description:
          description !== undefined ? description : existingRole[0].description,
        isSystem: isSystem !== undefined ? isSystem : existingRole[0].isSystem,
      })
      .where(eq(roles.id, id))
      .returning()

    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      const { rolePermissions } = await import('@/db/schema')

      // Delete existing permissions
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id))

      // Insert new permissions
      if (permissions.length > 0) {
        await db.insert(rolePermissions).values(
          permissions.map((permissionId: string) => ({
            roleId: id,
            permissionId,
          }))
        )
      }
    }

    return NextResponse.json({ role: updatedRole[0] })
  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete role
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await req.cookies
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if role exists
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1)

    if (existingRole.length === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Check if system role
    if (existingRole[0].isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      )
    }

    await db.delete(roles).where(eq(roles.id, id))

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Delete role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
