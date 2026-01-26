'use client'

import * as React from 'react'
import {
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
    },
    {
      title: 'Task Management',
      url: '#',
      icon: ListTodo,
      items: [
        {
          title: 'All Tasks',
          url: '/tasks',
        },
        {
          title: 'My Tasks',
          url: '/tasks/my',
        },
        {
          title: 'Kanban Board',
          url: '/tasks/kanban',
        },
      ],
    },
    {
      title: 'Projects',
      url: '#',
      icon: Briefcase,
      items: [
        {
          title: 'All Projects',
          url: '/projects',
        },
        {
          title: 'Active Projects',
          url: '/projects/active',
        },
      ],
    },
    {
      title: 'User Management',
      url: '#',
      icon: Users,
      items: [
        {
          title: 'Users',
          url: '/users',
        },
        {
          title: 'Roles',
          url: '/roles',
        },
        {
          title: 'Permissions',
          url: '/permissions',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/settings',
        },
        {
          title: 'Security',
          url: '/settings/security',
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

export function AppSidebar({ ..._props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="bg-background border-r border-border"
      {..._props}
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
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
