'use client'

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Shield,
  Key,
  type LucideIcon,
} from 'lucide-react'
import * as React from 'react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
}

export function NavMain({
  items,
  className,
}: {
  items: NavItem[]
  className?: string
}) {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                tooltip={item.title}
              >
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export const defaultNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: 'Projects',
    url: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    title: 'Team',
    url: '/dashboard/team',
    icon: Users,
  },
  {
    title: 'Roles',
    url: '/dashboard/roles',
    icon: Shield,
  },
  {
    title: 'Permissions',
    url: '/dashboard/permissions',
    icon: Key,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
]
