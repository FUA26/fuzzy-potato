'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Badge } from '@/components/ui/badge'

export interface Resource {
  id: string
  name: string
  identifier: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

interface GetResourcesColumnsProps {
  onEdit: (resource: Resource) => void
  onDelete: (resource: Resource) => void
}

export function getResourcesColumns({
  onEdit,
  onDelete,
}: GetResourcesColumnsProps): ColumnDef<Resource>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue('name')}</span>
      },
    },
    {
      accessorKey: 'identifier',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Identifier" />
      ),
      cell: ({ row }) => {
        return (
          <Badge variant="secondary" className="font-mono">
            {row.getValue('identifier')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        return (
          <span className="max-w-[500px] truncate block text-muted-foreground">
            {row.getValue('description') || '-'}
          </span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        return new Date(row.getValue('createdAt')).toLocaleDateString()
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const resource = row.original

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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(resource.id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(resource.identifier)
                }
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Identifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(resource)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(resource)}
                className="text-red-600 focus:text-red-500"
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
