'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, X } from 'lucide-react'

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
import { Input } from '@/components/ui/input'
import { DataTable, type User } from '@/components/data-table'
import { getUsersColumns } from '@/components/data-table/columns/users'
import {
  ActionBar,
  ActionBarSelection,
  ActionBarSeparator,
  ActionBarGroup,
  ActionBarItem,
  ActionBarClose,
} from '@/components/ui/action-bar'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const updateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .optional(),
})

type UserFormValues = z.infer<typeof userSchema>
type UpdateUserFormValues = z.infer<typeof updateUserSchema>

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const mountedRef = useRef(true)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      name: '',
      username: '',
      password: '',
    },
  })

  const updateForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: '',
      name: '',
      username: '',
    },
  })

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const result = await response.json()

      if (mountedRef.current) {
        setData(result.users)
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error('Error fetching users:', error)
        toast.error('Failed to load users')
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Initial fetch and cleanup
  useEffect(() => {
    mountedRef.current = true
    fetchUsers()

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle edit
  const handleEdit = useCallback(
    async (user: User) => {
      setEditingUser(user)
      updateForm.reset({
        email: user.email,
        name: user.name || '',
        username: user.username || '',
      })
      setIsEditDialogOpen(true)
    },
    [updateForm]
  )

  // Handle reset password
  const handleResetPassword = useCallback(async (user: User) => {
    try {
      // Generate a reset token (this would normally be done by API)
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`

      // TODO: Send email with reset link
      console.log('=== RESET PASSWORD LINK ===')
      console.log(`User: ${user.name || user.email}`)
      console.log(`Email: ${user.email}`)
      console.log(`Reset Link: ${resetLink}`)
      console.log('========================')

      toast.success(
        `Reset password link generated for ${user.email}. Check console for link.`
      )
    } catch (error) {
      console.error('Error generating reset link:', error)
      toast.error('Failed to generate reset password link')
    }
  }, [])

  // Handle delete
  const handleDelete = useCallback(
    async (user: User) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete user "${user.name || user.email}"?`
      )
      if (!confirmed) return

      try {
        const response = await fetch(`/api/admin/users/${user.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete user')
        }

        toast.success('User deleted successfully')
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete user'
        )
      }
    },
    [fetchUsers]
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
      .then(() => toast.success('User ID copied to clipboard'))
      .catch(() => toast.error('Failed to copy user ID'))
  }, [])

  // Create columns
  const columns = getUsersColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onCopy: handleCopy,
    onResetPassword: handleResetPassword,
  })

  // Handle submit
  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }

      toast.success('User created successfully')
      setIsDialogOpen(false)
      form.reset()
      fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to create user'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle update
  const onUpdate = async (values: UpdateUserFormValues) => {
    if (!editingUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      toast.success('User updated successfully')
      setIsEditDialogOpen(false)
      setEditingUser(null)
      updateForm.reset()
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update user'
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
      setEditingUser(null)
      updateForm.reset()
    }
  }

  // Handle bulk delete
  const handleBulkDelete = useCallback(
    async (selectedRows: User[]) => {
      if (selectedRows.length === 0) return

      const confirmed = window.confirm(
        `Are you sure you want to delete ${selectedRows.length} user(s)?`
      )
      if (!confirmed) return

      try {
        await Promise.all(
          selectedRows.map((user) =>
            fetch(`/api/admin/users/${user.id}`, {
              method: 'DELETE',
            })
          )
        )

        toast.success(`${selectedRows.length} user(s) deleted successfully`)
        fetchUsers()
      } catch (error) {
        console.error('Error deleting users:', error)
        toast.error('Failed to delete users')
      }
    },
    [fetchUsers]
  )

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {data.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            All registered users
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {data.filter((u) => u.emailVerified).length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Users with verified email
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unverified Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {data.filter((u) => !u.emailVerified).length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Users awaiting verification
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
          <CardDescription>
            Manage user accounts and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Total: {data.length} user{data.length !== 1 ? 's' : ''}
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={handleCreateDialogOpenChange}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account
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
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormDescription>
                            The full name of the user
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The email address for login
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional username for the user
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Initial password for the user (min. 6 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create User'}
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
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>Update user information</DialogDescription>
                </DialogHeader>
                <Form {...updateForm}>
                  <form
                    onSubmit={updateForm.handleSubmit(onUpdate)}
                    className="space-y-4"
                  >
                    <FormField
                      control={updateForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
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
                          setEditingUser(null)
                          updateForm.reset()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update User'}
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
            toolbarPlaceholder="Filter users..."
            isLoading={isLoading}
            facetedFilters={[
              {
                columnId: 'emailVerified',
                title: 'Status',
                options: [
                  { label: 'Verified', value: 'true' },
                  { label: 'Unverified', value: 'false' },
                ],
              },
            ]}
            renderActionBar={(table) => {
              const selectedRows = table.getFilteredSelectedRowModel().rows

              return (
                <ActionBar
                  open={selectedRows.length > 0}
                  onOpenChange={(open) => {
                    if (!open) {
                      table.toggleAllRowsSelected(false)
                    }
                  }}
                >
                  <ActionBarSelection>
                    {selectedRows.length} selected
                  </ActionBarSelection>
                  <ActionBarSeparator />
                  <ActionBarGroup>
                    <ActionBarItem
                      onSelect={() =>
                        handleBulkDelete(
                          selectedRows.map((row) => row.original)
                        )
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </ActionBarItem>
                  </ActionBarGroup>
                  <ActionBarClose>
                    <X className="h-4 w-4" />
                  </ActionBarClose>
                </ActionBar>
              )
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
