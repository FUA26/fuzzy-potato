# Data Table Component Documentation

## Overview

Comprehensive, reusable data table component built with **TanStack Table** and **Shadcn UI**. Provides sorting, filtering, pagination, column visibility, and row selection out of the box.

## Features

- ✅ **Sorting** - Click column headers to sort asc/desc
- ✅ **Filtering** - Real-time search/filter
- ✅ **Pagination** - Customizable rows per page (10, 20, 30, 40, 50)
- ✅ **Column Visibility** - Show/hide columns dynamically
- ✅ **Row Selection** - Multi-select rows with checkboxes
- ✅ **Loading States** - Built-in loading spinner
- ✅ **Responsive** - Works on mobile and desktop
- ✅ **TypeScript** - Fully typed
- ✅ **Accessible** - ARIA labels and keyboard navigation

## Component Structure

```
components/data-table/
├── index.ts                      # Main exports
├── table.tsx                     # DataTable component
├── column-header.tsx             # Sortable column header
├── toolbar.tsx                   # Search & view options
├── pagination.tsx                # Pagination controls
├── view-options.tsx              # Column visibility dropdown
└── columns/
    ├── roles.tsx                 # Roles table columns
    └── permissions.tsx           # Permissions table columns
```

## Quick Start

### Basic Usage

```tsx
import { DataTable } from '@/components/data-table'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
]

function MyPage() {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData().then(setData).finally(() => setIsLoading(false))
  }, [])

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
    />
  )
}
```

### With Custom Filter

```tsx
<DataTable
  columns={columns}
  data={data}
  filterKey="email"          // Filter by email column
  toolbarPlaceholder="Search users..."
  isLoading={isLoading}
/>
```

## Advanced Usage

### Custom Columns with Actions

```tsx
import { getRolesColumns } from '@/components/data-table/columns/roles'

const columns = getRolesColumns({
  onEdit: (role) => {
    console.log('Edit role:', role)
    // Open edit dialog
  },
  onDelete: async (role) => {
    console.log('Delete role:', role)
    // Call delete API
  },
  onCopy: (id) => {
    navigator.clipboard.writeText(id)
    toast.success('ID copied!')
  },
})

<DataTable columns={columns} data={roles} />
```

### Custom Column Definitions

```tsx
const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(row.original)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
```

## API Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | **Required** | Column definitions |
| `data` | `TData[]` | **Required** | Table data |
| `filterKey` | `string` | `'name'` | Column to filter/search |
| `toolbarPlaceholder` | `string` | `'Filter...'` | Search input placeholder |
| `isLoading` | `boolean` | `false` | Show loading state |

### DataTableColumnHeader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `column` | `Column<TData, TValue>` | **Required** | TanStack column instance |
| `title` | `string` | **Required** | Column title |
| `className` | `string` | `undefined` | Additional CSS classes |

### DataTablePagination Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `table` | `Table<TData>` | **Required** | TanStack table instance |

### DataTableToolbar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `table` | `Table<TData>` | **Required** | TanStack table instance |
| `filterKey` | `string` | `'name'` | Column to filter |
| `placeholder` | `string` | `'Filter...'` | Search placeholder |

### DataTableViewOptions Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `table` | `Table<TData>` | **Required** | TanStack table instance |

## Examples

### Roles Table

```tsx
import { DataTable, type Role } from '@/components/data-table'
import { getRolesColumns } from '@/components/data-table/columns/roles'

export default function RolesPage() {
  const [data, setData] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleEdit = (role: Role) => {
    // Open edit dialog
  }

  const handleDelete = async (role: Role) => {
    await fetch(`/api/admin/roles/${role.id}`, { method: 'DELETE' })
    // Refresh data
  }

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success('Copied!')
  }

  const columns = getRolesColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onCopy: handleCopy,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles Management</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          filterKey="name"
          toolbarPlaceholder="Filter roles..."
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}
```

### Permissions Table

```tsx
import { DataTable, type Permission } from '@/components/data-table'
import { getPermissionsColumns } from '@/components/data-table/columns/permissions'

export default function PermissionsPage() {
  const [data, setData] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const columns = getPermissionsColumns({
    onEdit: (permission) => console.log('Edit', permission),
    onDelete: (permission) => console.log('Delete', permission),
    onCopy: (id) => navigator.clipboard.writeText(id),
  })

  return (
    <DataTable
      columns={columns}
      data={data}
      filterKey="name"
      toolbarPlaceholder="Filter permissions..."
      isLoading={isLoading}
    />
  )
}
```

### Custom Users Table

```tsx
import { DataTable } from '@/components/data-table'
import { DataTableColumnHeader } from '@/components/data-table'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createdAt: Date
}

const columns: ColumnDef<User>[] = [
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('role')}</Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      )
    },
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])

  return <DataTable columns={columns} data={users} />
}
```

## Customization

### Change Rows Per Page

Edit `table.tsx`:

```tsx
initialState: {
  pagination: {
    pageSize: 20, // Change default from 10 to 20
  },
},
```

Or in `pagination.tsx`:

```tsx
{[10, 20, 30, 40, 50, 100].map((pageSize) => ( // Add 100
  <SelectItem key={pageSize} value={`${pageSize}`}>
    {pageSize}
  </SelectItem>
))}
```

### Custom Loading State

```tsx
<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
/>
```

The table shows a spinner when `isLoading` is true.

### Empty State

The table automatically shows "No results found" when data is empty.

### Styling Columns

```tsx
{
  accessorKey: 'amount',
  header: 'Amount',
  cell: ({ row }) => (
    <div className="text-right font-mono">
      ${row.getValue('amount').toFixed(2)}
    </div>
  ),
},
```

## Best Practices

1. **Define columns outside component** - Prevent re-renders
   ```tsx
   // ✅ Good
   const columns = getColumns({ onEdit, onDelete })

   // ❌ Bad
   const columns = [{ header: 'Name', cell: () => ... }]
   ```

2. **Use useCallback for handlers** - Prevent infinite loops
   ```tsx
   const handleEdit = useCallback((role) => {
     // ...
   }, [])
   ```

3. **Type your data** - Use TypeScript interfaces
   ```tsx
   interface Role {
     id: string
     name: string
     isSystem: boolean
   }
   ```

4. **Server-side pagination** - For large datasets
   ```tsx
   const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

   useEffect(() => {
     fetch(`/api/users?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`)
       .then(res => res.json())
       .then(setData)
   }, [pagination])
   ```

## Troubleshooting

### Columns not re-rendering

Make sure to memoize columns:

```tsx
const columns = React.useMemo(
  () => getColumns({ onEdit, onDelete }),
  [onEdit, onDelete]
)
```

### Filter not working

Ensure `filterKey` matches an `accessorKey` in your columns:

```tsx
const columns = [
  { accessorKey: 'name', ... }, // filterKey="name" ✅
  { accessorKey: 'email', ... }, // filterKey="email" ✅
]
```

### Typescript errors

Import types from data-table:

```tsx
import { type Role } from '@/components/data-table'
```

## Dependencies

- `@tanstack/react-table` - Table state & logic
- Shadcn UI components - Button, Input, Select, Dropdown, etc.

## Files Using DataTable

- `app/(backoffice)/roles/page.tsx` - Roles management
- `app/(backoffice)/permissions/page.tsx` - Permissions management

## Future Enhancements

- [ ] Server-side sorting/pagination
- [ ] Export to CSV/Excel
- [ ] Column resizing
- [ ] Multi-column sorting
- [ ] Advanced filters (date range, select, etc.)
- [ ] Virtual scrolling for large datasets
- [ ] Row expansion/sub-tables
- [ ] Drag-and-drop row reordering
