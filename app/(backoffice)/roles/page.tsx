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
  FormField,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { DataTable, type Role } from '@/components/data-table'
import { getRolesColumns } from '@/components/data-table/columns/roles'

const roleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
})

type RoleFormValues = z.infer<typeof roleSchema>

export default function RolesPage() {
  const [data, setData] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/roles')
      if (!response.ok) throw new Error('Failed to fetch roles')
      const result = await response.json()
      setData(result.roles)
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Failed to load roles')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Handle edit
  const handleEdit = useCallback(
    (role: Role) => {
      setEditingRole(role)
      form.reset({
        name: role.name,
        description: role.description || '',
      })
      setIsEditDialogOpen(true)
    },
    [form]
  )

  // Handle delete
  const handleDelete = useCallback(
    async (role: Role) => {
      if (role.isSystem) {
        toast.error('Cannot delete system roles')
        return
      }

      try {
        const response = await fetch(`/api/admin/roles/${role.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete role')
        }

        toast.success('Role deleted successfully')
        fetchRoles()
      } catch (error) {
        console.error('Error deleting role:', error)
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete role'
        )
      }
    },
    [fetchRoles]
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
      .then(() => toast.success('Role ID copied to clipboard'))
      .catch(() => toast.error('Failed to copy role ID'))
  }, [])

  // Create columns
  const columns = getRolesColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onCopy: handleCopy,
  })

  // Handle submit
  const onSubmit = async (values: RoleFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create role')
      }

      toast.success('Role created successfully')
      setIsDialogOpen(false)
      form.reset()
      fetchRoles()
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to create role'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle update
  const onUpdate = async (values: RoleFormValues) => {
    if (!editingRole) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      toast.success('Role updated successfully')
      setIsEditDialogOpen(false)
      setEditingRole(null)
      form.reset()
      fetchRoles()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update role'
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
      setEditingRole(null)
      form.reset()
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Roles Management</CardTitle>
          <CardDescription>
            Manage user roles and their permissions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Total: {data.length} role{data.length !== 1 ? 's' : ''}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Create a new role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Editor" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of the role (e.g., Admin, Editor)
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
                              placeholder="Describe what this role can do..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Role'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Role</DialogTitle>
                  <DialogDescription>Update role information</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onUpdate)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Editor" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of the role (e.g., Admin, Editor)
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
                              placeholder="Describe what this role can do..."
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
                          setEditingRole(null)
                          form.reset()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Role'}
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
            toolbarPlaceholder="Filter roles..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
