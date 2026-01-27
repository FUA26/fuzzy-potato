'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
import { DataTable } from '@/components/data-table'
import {
  getResourcesColumns,
  type Resource,
} from '@/components/data-table/columns/resources'

const resourceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  identifier: z
    .string()
    .min(2, 'Identifier must be at least 2 characters')
    .regex(
      /^[a-z0-9_-]+$/,
      'Identifier can only contain lowercase letters, numbers, dashes, and underscores'
    ),
  description: z.string().optional(),
})

type ResourceFormValues = z.infer<typeof resourceSchema>

export default function ResourcesPage() {
  const [data, setData] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)

  const mountedRef = useRef(true)

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: '',
      identifier: '',
      description: '',
    },
  })

  const fetchResources = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/resources')
      if (!response.ok) throw new Error('Failed to fetch resources')
      const result = await response.json()

      if (mountedRef.current) {
        setData(result.resources)
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error('Error fetching resources:', error)
        toast.error('Failed to load resources')
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetchResources()

    return () => {
      mountedRef.current = false
    }
  }, [fetchResources])

  const handleEdit = useCallback(
    (resource: Resource) => {
      setEditingResource(resource)
      form.reset({
        name: resource.name,
        identifier: resource.identifier,
        description: resource.description || '',
      })
      setIsEditDialogOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (resource: Resource) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete resource "${resource.name}"?`
      )
      if (!confirmed) return

      try {
        const response = await fetch(`/api/admin/resources/${resource.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete resource')
        }

        toast.success('Resource deleted successfully')
        fetchResources()
      } catch (error) {
        console.error('Error deleting resource:', error)
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete resource'
        )
      }
    },
    [fetchResources]
  )

  const columns = getResourcesColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  const onSubmit = async (values: ResourceFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create resource')
      }

      toast.success('Resource created successfully')
      setIsDialogOpen(false)
      form.reset()
      fetchResources()
    } catch (error) {
      console.error('Error creating resource:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to create resource'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const onUpdate = async (values: ResourceFormValues) => {
    if (!editingResource) return

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/admin/resources/${editingResource.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update resource')
      }

      toast.success('Resource updated successfully')
      setIsEditDialogOpen(false)
      setEditingResource(null)
      form.reset()
      fetchResources()
    } catch (error) {
      console.error('Error updating resource:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update resource'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) form.reset()
  }

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) {
      setEditingResource(null)
      form.reset()
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resource Management</CardTitle>
          <CardDescription>
            Manage the resources available in the system for permission control.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Total: {data.length} resource{data.length !== 1 ? 's' : ''}
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={handleCreateDialogOpenChange}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Resource</DialogTitle>
                  <DialogDescription>
                    Define a new system resource for RBAC
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
                            <Input placeholder="e.g., Products" {...field} />
                          </FormControl>
                          <FormDescription>
                            Display name for the resource
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Identifier</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., products" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique system identifier (used in code and
                            permissions)
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
                              placeholder="Describe what this resource represents..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Resource'}
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
                  <DialogTitle>Edit Resource</DialogTitle>
                  <DialogDescription>update resource details</DialogDescription>
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
                            <Input placeholder="e.g., Products" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Identifier</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., products" {...field} />
                          </FormControl>
                          <FormDescription>
                            Changing this may affect existing code references!
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
                              placeholder="Describe what this resource represents..."
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
                          setEditingResource(null)
                          form.reset()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Resource'}
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
            toolbarPlaceholder="Filter resources..."
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
