# Color System Documentation

## Overview

This project uses a comprehensive semantic color system based on CSS custom properties and Tailwind CSS v4. All colors are defined in `app/globals.css` and are automatically adapted for both light and dark modes.

## Available Color Tokens

### Base Colors
- **`--background`** - Main page background color
- **`--foreground`** - Primary text color
- **`--card`** - Card/component background
- **`--card-foreground`** - Text on cards
- **`--popover`** - Popover/tooltip background
- **`--popover-foreground`** - Text in popovers

### Semantic Colors

#### Primary
- **`--primary`** - Main brand color (blue-purple in light mode, light gray in dark mode)
- **`--primary-foreground`** - Text color on primary backgrounds

#### Secondary
- **`--secondary`** - Secondary accent color (light gray)
- **`--secondary-foreground`** - Text color on secondary backgrounds

#### Muted
- **`--muted`** - Subdued background color
- **`--muted-foreground`** - Subdued text color

#### Accent
- **`--accent`** - Highlight/accent color
- **`--accent-foreground`** - Text on accent backgrounds

#### Destructive/Error
- **`--destructive`** - Error/danger color (red)
- **`--destructive-foreground`** - Text on destructive backgrounds
- **`--error`** - Alias for destructive
- **`--error-foreground`** - Alias for destructive-foreground

#### Success
- **`--success`** - Success color (green)
- **`--success-foreground`** - Text on success backgrounds

#### Warning
- **`--warning`** - Warning color (amber/orange)
- **`--warning-foreground`** - Text on warning backgrounds

#### Info
- **`--info`** - Informational color (blue)
- **`--info-foreground`** - Text on info backgrounds

### UI Element Colors
- **`--border`** - Border color for inputs and dividers
- **`--input`** - Input field background
- **`--ring`** - Focus ring color

## Usage in Components

### Tailwind Classes

All color tokens are available as Tailwind utility classes:

```tsx
// Background colors
<div className="bg-background">   // Page background
<div className="bg-card">          // Card background
<div className="bg-primary">       // Primary button background
<div className="bg-secondary">     // Secondary background
<div className="bg-accent">        // Accent highlight
<div className="bg-muted">         // Muted background
<div className="bg-success">       // Success state
<div className="bg-warning">       // Warning state
<div className="bg-info">          // Info state
<div className="bg-destructive">   // Error/danger state

// Text colors
<p className="text-foreground">        // Primary text
<p className="text-muted-foreground">  // Secondary text
<p className="text-primary">           // Primary brand text
<p className="text-primary-foreground">// Text on primary bg
<p className="text-destructive">       // Error text
<p className="text-success">           // Success text
<p className="text-warning">           // Warning text
<p className="text-info">              // Info text

// Border colors
<div className="border-border">   // Standard border
<div className="border-input">    // Input border

// With opacity modifiers
<div className="bg-primary/10">     // 10% opacity primary
<div className="text-primary/80">   // 80% opacity text
<div className="border-border/50">  // 50% opacity border
```

### Hover States

Use opacity modifiers for hover states:

```tsx
<Button className="bg-primary hover:bg-primary/90">
  Click me
</Button>

<Link className="text-primary hover:text-primary/80">
  Link text
</Link>
```

## Color Values (Light Mode)

```css
--background: oklch(1 0 0);                    /* White */
--foreground: oklch(0.145 0 0);               /* Near black */
--primary: oklch(0.589 0.158 241.966);        /* Blue-purple */
--secondary: oklch(0.97 0 0);                 /* Light gray */
--success: oklch(0.545 0.176 142.495);        /* Green */
--warning: oklch(0.647 0.178 61.443);         /* Amber */
--info: oklch(0.596 0.158 251.912);           /* Blue */
--error/destructive: oklch(0.577 0.245 27.325); /* Red */
```

## Color Values (Dark Mode)

```css
--background: oklch(0.145 0 0);               /* Dark gray */
--foreground: oklch(0.985 0 0);               /* Off-white */
--primary: oklch(0.922 0 0);                  /* Light gray */
--secondary: oklch(0.269 0 0);                /* Medium gray */
--success: oklch(0.545 0.176 142.495);        /* Green (same) */
--warning: oklch(0.647 0.178 61.443);         /* Amber (same) */
--info: oklch(0.596 0.158 251.912);           /* Blue (same) */
--error/destructive: oklch(0.704 0.191 22.216); /* Red (lighter) */
```

## Guidelines

### ✅ DO
- Use semantic color tokens (`bg-primary`, `text-foreground`)
- Use opacity modifiers for variations (`bg-primary/10`, `text-primary/80`)
- Use `border-input` for form inputs
- Use `text-muted-foreground` for secondary text
- Use `bg-accent` for hover states on interactive elements
- Use `bg-destructive` or `bg-error` for error states
- Use `bg-success` for success states
- Use `bg-warning` for warning states
- Use `bg-info` for informational messages

### ❌ DON'T
- Don't use hard-coded colors like `text-slate-800`, `bg-white`
- Don't use arbitrary values like `bg-[#FF0000]`
- Don't use colors that don't adapt to dark mode

## Examples

### Button
```tsx
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Primary Action
</Button>
```

### Input Field
```tsx
<input
  className="border-input bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
/>
```

### Alert/Notification
```tsx
// Success
<div className="bg-success text-success-foreground">
  Operation successful!
</div>

// Error
<div className="bg-destructive text-destructive-foreground">
  Something went wrong
</div>

// Warning
<div className="bg-warning text-warning-foreground">
  Please review this
</div>

// Info
<div className="bg-info text-info-foreground">
  Did you know?
</div>
```

### Card
```tsx
<Card className="bg-card text-card-foreground border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
</Card>
```

## Migration Notes

All pages in the project have been migrated to use semantic colors:
- ✅ Landing page (`app/page.tsx`)
- ✅ Login page (`app/(auth)/login/page.tsx`)
- ✅ Register page (`app/(auth)/register/page.tsx`)
- ✅ Forgot password page (`app/(auth)/forgot-password/page.tsx`)
- ✅ Reset password page (`app/(auth)/reset-password/page.tsx`)
- ✅ Dashboard page (`app/(backoffice)/dashboard/page.tsx`)
- ✅ Auth layout (`app/(auth)/layout.tsx`)

When creating new components or pages, always use semantic color tokens instead of hard-coded Tailwind colors to ensure consistency and proper dark mode support.
