'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      router.push('/login?registered=true')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
          Buat Akun Baru
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Daftar untuk mengakses layanan digital Kabupaten Naiera
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Nama Lengkap
          </label>
          <div className="relative">
            <User
              size={18}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              id="name"
              placeholder="Masukkan nama lengkap"
              className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-input bg-card py-3 pr-4 pl-11 text-sm transition-all placeholder:text-muted-foreground focus:ring-2 focus:outline-none"
              {...form.register('name')}
            />
          </div>
          {form.formState.errors.name && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Username Input */}
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Username
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <input
              type="text"
              id="username"
              placeholder="Masukkan username"
              className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-input bg-card py-3 pr-4 pl-11 text-sm transition-all placeholder:text-muted-foreground focus:ring-2 focus:outline-none"
              {...form.register('username')}
            />
          </div>
          {form.formState.errors.username && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="email"
              id="email"
              placeholder="Masukkan email"
              className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-input bg-card py-3 pr-4 pl-11 text-sm transition-all placeholder:text-muted-foreground focus:ring-2 focus:outline-none"
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Masukkan password"
              className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-input bg-card py-3 pr-12 pl-11 text-sm transition-all placeholder:text-muted-foreground focus:ring-2 focus:outline-none"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-muted-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Konfirmasi Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Konfirmasi password"
              className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-input bg-card py-3 pr-12 pl-11 text-sm transition-all placeholder:text-muted-foreground focus:ring-2 focus:outline-none"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-muted-foreground"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 shadow-primary/25 hover:shadow-primary/40 h-12 w-full rounded-lg text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
        </Button>
      </form>

      {/* Login Link */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <Link
          href="/login"
          className="group text-primary hover:text-primary/80 inline-flex items-center gap-1 font-semibold transition-colors"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-1"
          />
          Masuk
        </Link>
      </p>
    </>
  )
}
