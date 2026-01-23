'use client'

import * as React from 'react'
import { Controller, useFormState } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const Form = Controller

function FormField({ ...props }: React.ComponentProps<typeof Controller>) {
  return <Controller {...props} />
}

function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-2', className)} {...props} />
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return <Label className={className} {...props} />
}

function FormControl({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}

function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}

function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { errors } = useFormState()
  const message = errors[props.id as string]
    ? String(errors[props.id as string]?.message)
    : children

  if (!message) {
    return null
  }

  return (
    <p
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {message}
    </p>
  )
}

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
