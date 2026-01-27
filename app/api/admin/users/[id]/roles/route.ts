import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users, roles, userRoles } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerPermission } from '@/lib/rbac/server'

/**
 * GET /api/admin/users/[userId]/roles
 * Get all roles assigned to a specific user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireServerPermission('users.read')

    const { id: userId } = await params

    // Get user's roles
    const userRolesData = await db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        isSystem: roles.isSystem,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))

    return NextResponse.json({
      roles: userRolesData,
    })
  } catch (error) {
    console.error('Error fetching user roles:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch user roles',
      },
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
 * POST /api/admin/users/[userId]/roles
 * Assign a role to a user
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireServerPermission('users.update')

    const { id: userId } = await params
    const body = await req.json()
    const { roleId } = body

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if role exists
    const roleResult = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1)

    if (roleResult.length === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Check if user already has this role
    const existingUserRole = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .limit(1)

    if (existingUserRole.length > 0) {
      return NextResponse.json(
        { error: 'User already has this role' },
        { status: 409 }
      )
    }

    // Assign role to user
    await db.insert(userRoles).values({
      userId,
      roleId,
    })

    return NextResponse.json({
      message: 'Role assigned successfully',
    })
  } catch (error) {
    console.error('Error assigning role:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to assign role',
      },
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
 * DELETE /api/admin/users/[userId]/roles
 * Remove a role from a user
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireServerPermission('users.update')

    const { id: userId } = await params
    const { searchParams } = new URL(req.url)
    const roleId = searchParams.get('roleId')

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      )
    }

    // Check if user has this role
    const existingUserRole = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .limit(1)

    if (existingUserRole.length === 0) {
      return NextResponse.json(
        { error: 'User does not have this role' },
        { status: 404 }
      )
    }

    // Remove role from user
    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))

    return NextResponse.json({
      message: 'Role removed successfully',
    })
  } catch (error) {
    console.error('Error removing role:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to remove role',
      },
      {
        status:
          error instanceof Error && error.message.includes('Permission')
            ? 403
            : 500,
      }
    )
  }
}
