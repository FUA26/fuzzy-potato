'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, type Permission } from '@/components/data-table'
import { getPermissionsColumns } from '@/components/data-table/columns/permissions'

const permissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(
      /^[a-z0-9.-]+$/,
      'Slug can only contain lowercase letters, numbers, dots, and hyphens'
    ),
  description: z.string().optional(),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
})

type PermissionFormValues = z.infer<typeof permissionSchema>

const resources = ['users', 'posts', 'roles', 'permissions', 'settings']
const actions = ['create', 'read', 'update', 'delete', 'manage']

export default function PermissionsPage() {
  const [data, setData] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  )

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      resource: '',
      action: '',
    },
  })

  // Fetch permissions
  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/permissions')
      if (!response.ok) throw new Error('Failed to fetch permissions')
      const result = await response.json()
      setData(result.permissions)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  // Handle edit
  const handleEdit = useCallback(
    (permission: Permission) => {
      setEditingPermission(permission)
      form.reset({
        name: permission.name,
        slug: permission.slug,
        description: permission.description || '',
        resource: permission.resource,
        action: permission.action,
      })
      setIsEditDialogOpen(true)
    },
    [form]
  )

  // Handle delete
  const handleDelete = useCallback(
    async (permission: Permission) => {
      try {
        const response = await fetch(
          `/api/admin/permissions/${permission.id}`,
          {
            method: 'DELETE',
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete permission')
        }

        toast.success('Permission deleted successfully')
        fetchPermissions()
      } catch (error) {
        console.error('Error deleting permission:', error)
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete permission'
        )
      }
    },
    [fetchPermissions]
  )

  // Handle copy
  const handleCopy = useCallback((id: string) => {
    const copyToClipboard = (text: string) => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
      }

      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        textArea.remove()
        return Promise.resolve()
      } catch (error) {
        textArea.remove()
        return Promise.reject(error)
      }
    }

    copyToClipboard(id)
      .then(() => toast.success('Permission ID copied to clipboard'))
      .catch(() => toast.error('Failed to copy permission ID'))
  }, [])

  // Auto-generate slug based on resource and action
  const handleResourceOrActionChange = () => {
    const resource = form.getValues('resource')
    const action = form.getValues('action')
    if (resource && action) {
      form.setValue('slug', `${resource}.${action}`)
    }
  }

  // Create columns
  const columns = getPermissionsColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onCopy: handleCopy,
  })

  // Handle submit
  const onSubmit = async (values: PermissionFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create permission')
      }

      toast.success('Permission created successfully')
      setIsDialogOpen(false)
      form.reset()
      fetchPermissions()
    } catch (error) {
      console.error('Error creating permission:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to create permission'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle update
  const onUpdate = async (values: PermissionFormValues) => {
    if (!editingPermission) return

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/admin/permissions/${editingPermission.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update permission')
      }

      toast.success('Permission updated successfully')
      setIsEditDialogOpen(false)
      setEditingPermission(null)
      form.reset()
      fetchPermissions()
    } catch (error) {
      console.error('Error updating permission:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update permission'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle dialog close
  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) form.reset()
  }

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) {
      setEditingPermission(null)
      form.reset()
    }
  }

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Permissions</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {data.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {data.filter((p) => p.resource === 'users').length} for users
            resource
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most Common Resource</CardDescription>
            <CardTitle className="text-2xl font-semibold capitalize">
              {data.length > 0
                ? Object.entries(
                    data.reduce(
                      (acc, p) => {
                        acc[p.resource] = (acc[p.resource] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>
                    )
                  ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                : 'N/A'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {data.length > 0
              ? `${
                  Object.entries(
                    data.reduce(
                      (acc, p) => {
                        acc[p.resource] = (acc[p.resource] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>
                    )
                  ).sort((a, b) => b[1] - a[1])[0]?.[1] || 0
                } permissions`
              : 'No permissions'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Action Distribution</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {
                data.filter((p) =>
                  ['create', 'update', 'delete'].includes(p.action)
                ).length
              }
              :{data.filter((p) => p.action === 'read').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Write vs Read permissions
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions Management</CardTitle>
          <CardDescription>
            Manage permissions for different resources and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Total: {data.length} permission{data.length !== 1 ? 's' : ''}
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={handleCreateDialogOpenChange}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Permission
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Permission</DialogTitle>
                  <DialogDescription>
                    Create a new permission for specific resource and action
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="resource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resource</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                                handleResourceOrActionChange()
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select resource" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {resources.map((resource) => (
                                  <SelectItem key={resource} value={resource}>
                                    {resource}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                                handleResourceOrActionChange()
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {actions.map((action) => (
                                  <SelectItem key={action} value={action}>
                                    {action}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Create Users"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Display name for the permission
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., users.create"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Unique identifier (auto-generated from resource and
                            action)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what this permission allows..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Permission'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
              open={isEditDialogOpen}
              onOpenChange={handleEditDialogOpenChange}
            >
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Permission</DialogTitle>
                  <DialogDescription>
                    Update permission details
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onUpdate)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="resource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resource</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                                handleResourceOrActionChange()
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select resource" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {resources.map((resource) => (
                                  <SelectItem key={resource} value={resource}>
                                    {resource}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                                handleResourceOrActionChange()
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {actions.map((action) => (
                                  <SelectItem key={action} value={action}>
                                    {action}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Create Users"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Display name for the permission
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., users.create"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Unique identifier (auto-generated from resource and
                            action)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what this permission allows..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditDialogOpen(false)
                          setEditingPermission(null)
                          form.reset()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Permission'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <DataTable
            columns={columns}
            data={data}
            filterKey="name"
            toolbarPlaceholder="Filter permissions..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
