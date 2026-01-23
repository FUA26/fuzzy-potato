# Phase 2: UI Architecture

## Objective

Establish a modern, accessible, and themeable Design System using Tailwind CSS and Shadcn UI.

## Tech Stack

- **Styling**: Tailwind CSS v4 (already installed).
- **Component Library**: Shadcn UI (Radix Primitives).
- **Icons**: Lucide React.
- **Theming**: `next-themes` (Dark/Light mode).
- **Fonts**: `next/font/google` (Inter or Outfit).

## Requirements

### 1. Design System Setup

- **Shadcn UI Initialization**:
  - Style: Default
  - Base Color: Slate (Neutral)
  - CSS Variables: `yes`
- **Tailwind Config**:
  - Ensure `tailwindcss-animate` plugin is added.
  - Define custom color tokens if needed beyond Shadcn defaults.
- **Fonts**:
  - Configure `Inter` (sans) as the default variable font in `layout.tsx`.

### 2. Core Components to Install

Initially install widely used components to seed the library:

- Button, Input, Label (Forms)
- Card (Layout)
- Dropdown Menu, Dialog, Sheet (Overlays)
- Toast (Notifications)
- Avatar, Badge, Skeleton (Display)

### 3. Utility Functions

- **`lib/utils.ts`**:
  - Implement `cn(...)` using `clsx` and `tailwind-merge` to safely combine Tailwind classes.

## Implementation Details

### Initialization Command

```bash
npx shadcn@latest init
```

### Dependency Installation

```bash
pnpm add lucide-react next-themes class-variance-authority clsx tailwind-merge tailwindcss-animate
```

### Theme Provider

Create `components/theme-provider.tsx` wrapping `next-themes` to enable seamless dark mode switching without hydration mismatch.

```tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```
