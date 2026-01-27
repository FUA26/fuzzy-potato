'use client'

import * as React from 'react'
import {
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  LayoutDashboard,
  ListTodo,
  Users,
  Briefcase,
  Database,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavSecondary } from './nav-secondary'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true,
      requiredPermission: 'dashboard.view',
    },
    {
      title: 'Task Management',
      url: '#',
      icon: ListTodo,
      requiredPermission: 'tasks.read',
      items: [
        {
          title: 'All Tasks',
          url: '/tasks',
          requiredPermission: 'tasks.read',
        },
        {
          title: 'My Tasks',
          url: '/tasks/my',
          requiredPermission: 'tasks.read',
        },
        {
          title: 'Kanban Board',
          url: '/tasks/kanban',
          requiredPermission: 'tasks.read',
        },
      ],
    },
    {
      title: 'Projects',
      url: '#',
      icon: Briefcase,
      requiredPermission: 'projects.read',
      items: [
        {
          title: 'All Projects',
          url: '/projects',
          requiredPermission: 'projects.read',
        },
        {
          title: 'Active Projects',
          url: '/projects/active',
          requiredPermission: 'projects.read',
        },
      ],
    },
    {
      title: 'User Management',
      url: '#',
      icon: Users,
      requiredPermission: 'users.read',
      items: [
        {
          title: 'Users',
          url: '/users',
          requiredPermission: 'users.read',
        },
        {
          title: 'Roles',
          url: '/roles',
          requiredPermission: 'roles.read',
        },
        {
          title: 'Permissions',
          url: '/permissions',
          requiredPermission: 'permissions.read',
        },
      ],
    },
    {
      title: 'Resources',
      url: '/resources',
      icon: Database,
      requiredPermission: 'resources.read',
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      requiredPermission: 'settings.manage',
      items: [
        {
          title: 'General',
          url: '/settings',
          requiredPermission: 'settings.manage',
        },
        {
          title: 'Security',
          url: '/settings/security',
          requiredPermission: 'settings.security',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
  ],
  projects: [
    {
      name: 'Website Redesign',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Mobile App Launch',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Internal Tools',
      url: '#',
      icon: Map,
    },
  ],
}

export function AppSidebar({
  userPermissions = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & { userPermissions?: string[] }) {
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="bg-background border-r border-border"
      {...props}
    >
      <SidebarHeader className="bg-background px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-14 data-[active=true]:bg-primary/5"
            >
              <a href="/dashboard" className="gap-3">
                <div className="rounded-lg p-1.5">
                  <img
                    src="/images/logo.png"
                    alt="Bandanaiera Logo"
                    className="h-9 w-9 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-base font-bold">
                    Task Manager
                  </span>
                  <span className="truncate text-xs font-medium opacity-80">
                    Enterprise
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <NavMain items={data.navMain} userPermissions={userPermissions} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
