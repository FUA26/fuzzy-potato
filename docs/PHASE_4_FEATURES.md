# Phase 4: Feature Implementation (Forms & Tables)

## Objective
Standardize data handling for Forms and Tables to ensure consistency, accessibility, and type safety.

## Tech Stack
- **Forms**: React Hook Form + Zod (Validation).
- **Tables**: TanStack Table v8.
- **UI Integration**: Shadcn Form & Table components.

## Requirements

### 1. Form Handling
- **Pattern**:
  - Define Zod schema first.
  - Infer Type from Zod schema.
  - Use `useForm<Type>` hook with `zodResolver`.
  - Use Shadcn `Form` wrapper components (`FormField`, `FormItem`, etc.) for accessible error handling and labels.

### 2. Data Tables
- **Pattern**:
  - Server-side Pagination/Sorting/Filtering support (don't rely solely on client-side for large datasets).
  - Use Shadcn `Table` primitives (`TableHeader`, `TableRow`) for styling.
  - Create a reusable `DataTable<TData, TValue>` component that accepts columns and data.

## Implementation Details

### Dependencies
```bash
pnpm add react-hook-form @hookform/resolvers zod @tanstack/react-table
```

### Code Example: Form Pattern

```tsx
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

// Usage
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { username: "" },
})

function onSubmit(values: z.infer<typeof formSchema>) {
  // Do something with values
}
```

### Code Example: Data Table
Implement `components/ui/data-table.tsx` based on the official Shadcn guide, adding support for:
- Sorting (Column Header component).
- Pagination (Footer component).
- Column Visibility (Dropdown).
