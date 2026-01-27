'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit, MoreHorizontal, Trash2, Copy } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../column-header'

export interface Permission {
  id: string
  name: string
  slug: string
  description: string | null
  resource: string
  action: string
  createdAt: Date
  updatedAt: Date
}

interface GetPermissionsColumnsParams {
  onEdit: (permission: Permission) => void
  onDelete: (permission: Permission) => void
  onCopy: (id: string) => void
}

export function getPermissionsColumns({
  onEdit,
  onDelete,
  onCopy,
}: GetPermissionsColumnsParams): ColumnDef<Permission>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => {
        const slug = row.getValue('slug') as string
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{slug}</code>
        )
      },
    },
    {
      accessorKey: 'resource',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Resource" />
      ),
      cell: ({ row }) => {
        const resource = row.getValue('resource') as string
        return (
          <Badge variant="outline" className="capitalize">
            {resource}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        const value = row.getValue(columnId) as string
        const filterArray = filterValue as string[]
        if (!filterArray || filterArray.length === 0) return true
        return filterArray.includes(value)
      },
    },
    {
      accessorKey: 'action',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: ({ row }) => {
        const action = row.getValue('action') as string

        // Color mapping for actions
        const actionColors: Record<string, string> = {
          create:
            'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300',
          read: 'bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-300',
          update:
            'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300',
          delete: 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-300',
          manage:
            'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300',
        }

        return (
          <Badge
            variant="outline"
            className={`capitalize ${actionColors[action] || ''}`}
          >
            {action}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        const value = row.getValue(columnId) as string
        const filterArray = filterValue as string[]
        if (!filterArray || filterArray.length === 0) return true
        return filterArray.includes(value)
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.getValue('description') || (
            <span className="text-muted-foreground">No description</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return <div className="text-sm">{date.toLocaleDateString()}</div>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const permission = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onCopy(permission.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(permission)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(permission)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
