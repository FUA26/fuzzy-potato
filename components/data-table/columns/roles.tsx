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

export interface Role {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

interface GetRolesColumnsParams {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onCopy: (id: string) => void
}

export function getRolesColumns({
  onEdit,
  onDelete,
  onCopy,
}: GetRolesColumnsParams): ColumnDef<Role>[] {
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
      accessorKey: 'isSystem',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="System Role" />
      ),
      cell: ({ row }) => {
        const isSystem = row.getValue('isSystem')
        return (
          <Badge variant={isSystem ? 'default' : 'secondary'}>
            {isSystem ? 'System' : 'Custom'}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        const value = row.getValue(columnId) as boolean
        const filterArray = filterValue as string[]

        if (!filterArray || filterArray.length === 0) return true

        const stringValue = value ? 'true' : 'false'
        return filterArray.includes(stringValue)
      },
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
        const role = row.original

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
              <DropdownMenuItem onClick={() => onCopy(role.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!role.isSystem && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(role)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(role)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              {role.isSystem && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <Edit className="mr-2 h-4 w-4" />
                  System roles cannot be modified
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
