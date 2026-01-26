import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Calendar, Mail, User as UserIcon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Use session user data
  // Note: Session user might not have all fields if they are not included in the session callback
  // For now we use what's available in the session.
  // If we need more data like createdAt, we might need to fetch from DB here or update session callback.
  // Assuming createdAt is not critical for now or we just don't show it if not available.
  const user = session.user

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Stats Cards */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            $1,250.00
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          +20.1% from last month
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Projects</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            12
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          +3 new this week
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Team Members</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            8
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          +2 this month
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Now</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            5
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          +1 since last hour
        </CardContent>
      </Card>

      {/* Welcome Section */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-xl">
            Welcome back, {user.name || user.email?.split('@')[0] || 'User'}!
          </CardTitle>
          <CardDescription>
            Here&apos;s an overview of your account and recent activity
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Name</span>
              </div>
              <p className="text-lg">{user.name || 'Not set'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-lg">{user.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Session ID</span>
              </div>
              <p className="truncate text-lg" title={user.id}>
                {user.id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/dashboard/settings"
              className="rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <h3 className="font-semibold">Profile Settings</h3>
              <p className="text-sm text-muted-foreground">
                Update your profile information and preferences
              </p>
            </a>
            <a
              href="/dashboard/projects"
              className="rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <h3 className="font-semibold">My Projects</h3>
              <p className="text-sm text-muted-foreground">
                View and manage your active projects
              </p>
            </a>
            <a
              href="/dashboard/team"
              className="rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <h3 className="font-semibold">Team</h3>
              <p className="text-sm text-muted-foreground">
                Manage team members and permissions
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
