'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const profileSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  username: z
    .string()
    .min(3, 'Username harus minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username hanya boleh berisi huruf, angka, dan underscore'
    )
    .optional(),
  image: z.string().url('URL tidak valid').optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface UserProfile {
  id: string
  email: string
  name: string | null
  username: string | null
  image: string | null
  createdAt: Date
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      username: '',
      image: '',
    },
  })

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data.user)

      form.reset({
        name: data.user.name || '',
        username: data.user.username || '',
        image: data.user.image || '',
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Gagal memuat profile')
    } finally {
      setIsLoading(false)
    }
  }, [form, router])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Handle save profile
  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const data = await response.json()
      setProfile(data.user)
      toast.success('Profile berhasil diupdate!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(
        error instanceof Error ? error.message : 'Gagal mengupdate profile'
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Handle image update
  const handleImageUpdate = () => {
    const imageUrl = form.getValues('image')
    if (imageUrl) {
      onSubmit({ image: imageUrl })
    }
    setShowImageDialog(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Kelola informasi profil dan data pribadi Anda
        </p>
      </div>

      <Separator />

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
          <CardDescription>
            Foto profil Anda akan ditampilkan di seluruh aplikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={form.watch('image') || undefined} />
              <AvatarFallback className="text-2xl">
                {(profile.name || profile.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageDialog(true)}
              >
                <Camera className="mr-2 h-4 w-4" />
                Ganti Foto
              </Button>
              <p className="text-muted-foreground text-sm">
                Anda bisa menggunakan URL gambar untuk foto profil
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
          <CardDescription>
            Perbarui informasi pribadi Anda yang akan ditampilkan di profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Email (Read-only) */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nama lengkap Anda akan ditampilkan di profil
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            @
                          </span>
                          <Input
                            placeholder="username"
                            className="pl-7"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Username unik untuk akun Anda (3-30 karakter)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input value={profile.email} disabled className="bg-muted" />
                <p className="text-muted-foreground text-sm">
                  Email tidak dapat diubah. Hubungi admin jika perlu mengubah
                  email.
                </p>
              </div>

              {/* Account Info */}
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-medium">Informasi Akun</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Akun:</span>
                    <span className="font-mono">{profile.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Terdaftar sejak:
                    </span>
                    <span>
                      {new Date(profile.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset()
                    toast.info('Perubahan dibatalkan')
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Foto Profil</DialogTitle>
            <DialogDescription>
              Masukkan URL gambar untuk foto profil Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={form.watch('image') || undefined} />
                <AvatarFallback className="text-4xl">
                  {(profile.name || profile.email || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Gambar</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/photo.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Gunakan URL gambar yang valid (JPG, PNG, GIF, WebP)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImageDialog(false)}
            >
              Batal
            </Button>
            <Button onClick={handleImageUpdate}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
