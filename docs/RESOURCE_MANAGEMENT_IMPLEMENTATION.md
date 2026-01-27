# Resource Management Implementation

## Overview

Implementation of the Resource Management feature as specified in `docs/USER_ROLE_RBAC_PRD.md`. This feature provides a standardized way to manage system resources that can be used in permission definitions.

## What Was Implemented

### 1. Database Schema

**New Table: `resources`**

- Location: `db/schema/resources.ts`
- Fields:
  - `id`: UUID (primary key)
  - `name`: Display name (e.g., "User Management")
  - `identifier`: Unique slug (e.g., "users", "posts")
  - `description`: Optional text description
  - `createdAt`, `updatedAt`: Timestamps

### 2. API Endpoints

**Resources CRUD API**

1. **GET `/api/admin/resources`**
   - Get all resources with optional search
   - Supports search by name, identifier, description

2. **POST `/api/admin/resources`**
   - Create a new resource
   - Validates identifier format (lowercase, numbers, dashes, underscores only)
   - Prevents duplicate identifiers

3. **GET `/api/admin/resources/[id]`**
   - Get a single resource by ID

4. **PUT `/api/admin/resources/[id]`**
   - Update an existing resource
   - Validates identifier uniqueness

5. **DELETE `/api/admin/resources/[id]`**
   - Delete a resource
   - **Prevents deletion** if resource is used by any permission

### 3. UI Implementation

**Resources Management Page**

- Location: `app/(backoffice)/resources/page.tsx`
- Features:
  - Data table with all resources
  - Create/Edit resource dialogs
  - Delete protection (shows error if resource is in use)
  - Copy identifier to clipboard
  - Statistics cards (total resources, system resources)
  - Filter and search functionality

**Data Table Columns**

- Location: `components/data-table/columns/resources.tsx`
- Columns: Name, Identifier (with copy button), Description, Created Date, Actions

### 4. Permission Form Updates

**Updated Permissions Page**

- Location: `app/(backoffice)/permissions/page.tsx`
- Changes:
  - **Resource field now uses dropdown** populated from Resources API
  - Displays resource name and identifier in dropdown
  - **Auto-generates slug** from resource + action (e.g., "users.create")
  - Fetches resources dynamically from API

### 5. Database Seed

**Resources Seed Script**

- Location: `db/seed-resources.ts`
- Command: `pnpm db:seed:resources`
- Default Resources:
  - Dashboard
  - Users
  - Roles
  - Permissions
  - Tasks
  - Projects
  - Posts
  - Settings
  - Reports
  - Audit Logs
  - System

## Setup Instructions

### 1. Generate Database Migration

```bash
pnpm db:generate
```

This will create a new migration file for the `resources` table.

### 2. Run Migration

```bash
pnpm db:push
```

Or if you prefer using migrate:

```bash
pnpm db:migrate
```

### 3. Seed Default Resources

```bash
pnpm db:seed:resources
```

This will populate the resources table with default system resources.

### 4. Access the Resources Page

Navigate to `/resources` in your backoffice to manage resources.

## Usage Examples

### Creating a New Resource

1. Go to Resources page in backoffice
2. Click "Add Resource"
3. Fill in the form:
   - **Name**: "User Management"
   - **Identifier**: "users" (must be unique, lowercase only)
   - **Description**: "Manage users and their permissions"
4. Click "Create Resource"

### Creating a Permission with Resource

1. Go to Permissions page
2. Click "Add Permission"
3. **Resource dropdown** now shows all registered resources:
   - User Management (users)
   - Posts (posts)
   - etc.
4. Select resource and action
5. **Slug auto-generates** as `users.create`
6. Edit slug if needed
7. Click "Create Permission"

## Benefits

1. **No More Magic Strings**: Resources are defined in one place
2. **Type Safety**: Resources are validated before use
3. **Better UX**: Dropdown instead of text input
4. **Consistency**: All permissions use standardized resource identifiers
5. **Prevents Errors**: Can't delete resources that are in use
6. **Auto-Generation**: Slugs are auto-generated from resource + action

## API Response Examples

### GET /api/admin/resources

```json
{
  "resources": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "User Management",
      "identifier": "users",
      "description": "Manage users and their permissions",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### POST /api/admin/resources

**Request:**

```json
{
  "name": "Reports",
  "identifier": "reports",
  "description": "System reports and analytics"
}
```

**Response:**

```json
{
  "resource": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Reports",
    "identifier": "reports",
    "description": "System reports and analytics",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

## Technical Details

### Identifier Validation

Resource identifiers must match: `/^[a-z0-9_-]+$/`

Valid examples:

- `users`
- `blog_posts`
- `api-keys`
- `sales_reports`

Invalid examples:

- `Users` (uppercase not allowed)
- `user management` (spaces not allowed)
- `user.management` (dots not allowed)

### Delete Protection

When attempting to delete a resource:

1. API checks if any permission references the resource
2. If yes, returns 400 error with message
3. If no, proceeds with deletion

Example error response:

```json
{
  "error": "Cannot delete resource. It is currently being used by permissions."
}
```

### Slug Auto-Generation

When creating/editing permissions:

1. User selects resource from dropdown (e.g., "users")
2. User selects action from dropdown (e.g., "create")
3. Slug field auto-populates: `users.create`
4. User can still edit the slug if needed

## Future Enhancements

Possible improvements for future iterations:

1. **Resource Groups**: Organize resources into categories
2. **Resource Metadata**: Add additional fields like category, icon, etc.
3. **Resource Dependencies**: Define which resources depend on others
4. **Bulk Import**: Import resources from CSV/JSON
5. **Resource Templates**: Pre-defined templates for common resources
6. **Audit Trail**: Track who created/modified resources

## Migration Notes

If you have existing permissions:

1. Run `pnpm db:seed:resources` to create default resources
2. Existing permissions will continue to work
3. New permissions can use the resource dropdown
4. Consider updating existing permissions to use the new resource system

## Troubleshooting

### Error: "Resource with this identifier already exists"

The identifier must be unique. Try:

- Using a different identifier
- Checking if the resource already exists
- Updating the existing resource instead of creating a new one

### Error: "Cannot delete resource"

This means the resource is being used by permissions. To delete:

1. First, delete all permissions that use this resource
2. Then delete the resource

### Resources dropdown is empty

1. Check if resources are seeded: `pnpm db:seed:resources`
2. Verify API endpoint is working: GET `/api/admin/resources`
3. Check browser console for API errors

## Summary

The Resource Management feature successfully implements the requirements from the PRD:

- ✅ Resources table with proper schema
- ✅ CRUD API endpoints with validation
- ✅ Management UI in backoffice
- ✅ Integration with Permissions form
- ✅ Delete protection for in-use resources
- ✅ Auto-generation of permission slugs
- ✅ Database seed script with default resources

This enhancement makes the RBAC system more maintainable and user-friendly!
