'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const pathname = usePathname()

  // Helper function to check if a URL is active
  const isUrlActive = (url: string) => {
    if (url === '#') return false
    // Exact match or starts with the URL (for nested routes)
    return pathname === url || pathname.startsWith(url + '/')
  }

  // Check if any sub-item is active
  const hasActiveSubItem = (subItems?: { title: string; url: string }[]) => {
    if (!subItems) return false
    return subItems.some((subItem) => isUrlActive(subItem.url))
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          const isItemActive = isUrlActive(item.url)
          const isSubActive = hasActiveSubItem(item.items)
          const shouldBeOpen = isSubActive || item.isActive

          // Menu without sub-items - just a direct link
          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isItemActive}
                  size="default"
                  className="h-11 py-2.5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-primary/5"
                >
                  <Link href={item.url} className="gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Menu with sub-items
          // When collapsed: show DropdownMenu on icon click
          // When expanded: show Collapsible submenu
          if (isCollapsed) {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isSubActive}
                      size="default"
                      className="h-11 py-2.5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-primary/5"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-semibold">
                        {item.title}
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="min-w-[180px]"
                  >
                    <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items?.map((subItem) => {
                      const isSubItemActive = isUrlActive(subItem.url)
                      return (
                        <DropdownMenuItem
                          key={subItem.title}
                          asChild
                          className={
                            isSubItemActive
                              ? 'bg-accent text-accent-foreground'
                              : ''
                          }
                        >
                          <Link href={subItem.url} className="cursor-pointer">
                            {subItem.title}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          }

          // Expanded state with Collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldBeOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="w-full h-11 py-2.5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-primary/5"
                    isActive={isSubActive}
                    size="default"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{item.title}</span>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubItemActive = isUrlActive(subItem.url)
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubItemActive}
                            className="h-10 py-2 data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-primary/5"
                          >
                            <Link href={subItem.url}>
                              <span className="text-xs font-semibold">
                                {subItem.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
