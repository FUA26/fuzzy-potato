# Product Requirements Document: User-Role Integration & RBAC Menu Access

## 1. Overview

This document outlines the architecture and requirements for integrating Users and Roles to implement a Role-Based Access Control (RBAC) system. The primary goal is to control access to application menus and features based on the roles assigned to a logged-in user.

## 2. Data Schema Design

The system utilizes a relational schema with `drizzle-orm` to manage Users, Roles, and Permissions.

### 2.1 Core Entities

1.  **Users** (`users`)
    - Represents the authenticated actors in the system.
    - **Key Fields**: `id`, `name`, `email`, `password`, `image`.

2.  **Roles** (`roles`)
    - Represents a grouping of permissions (e.g., "Administrator", "Editor", "Viewer").
    - **Key Fields**:
      - `id`: Unique identifier.
      - `name`: Display name (unique).
      - `isSystem`: Boolean flag. System roles cannot be deleted.

3.  **Permissions** (`permissions`)
    - Represents granular access rights.
    - **Key Fields**:
      - `id`: Unique identifier.
      - `slug`: Unique string identifier used in code (e.g., `users.read`, `settings.manage`).
      - `resource`: The entity being accessed (e.g., `users`).
      - `action`: The operation performed (e.g., `read`, `create`).

4.  **User Roles** (`user_roles`)
    - Many-to-Many relationship table connecting Users to Roles.
    - **Fields**: `userId`, `roleId`.

5.  **Role Permissions** (`role_permissions`)
    - Many-to-Many relationship table connecting Roles to Permissions.
    - **Fields**: `roleId`, `permissionId`.

## 3. RBAC Logic & Menu Access

### 3.1 Authorization Flow

1.  **Login**: User logs in. System retrieves user details.
2.  **Session/Context**: Upon authentication, the system must load the user's assigned roles and the aggregated list of permissions associated with those roles.
3.  **Check**: Access control checks are performed against this aggregated list of permissions (or role names).

### 3.2 Menu Visibility Control

To make the sidebar/menu dynamic based on RBAC:

1.  **Menu Configuration**:
    - Menu items (navigation links) must be defined with an optional `requiredPermission` property.

    ```typescript
    // Example Menu Structure
    const navigation = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        // No permission required (public to all auth users)
      },
      {
        title: 'Users',
        href: '/users',
        icon: UsersIcon,
        requiredPermission: 'users.read', // Only users with this permission see this
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: SettingsIcon,
        requiredPermission: 'settings.manage',
      },
    ]
    ```

2.  **Rendering Logic**:
    - The `AppSidebar` or equivalent navigation component will filter the list of menu items.
    - **Condition**: `if (!item.requiredPermission || userHasPermission(item.requiredPermission)) { render(item) }`

### 3.3 Page & API Protection

- **Page Interaction**: Even if a user knows the URL, the Page component (server-side in Next.js) must verify permissions before rendering sensitive content.
- **API Endpoints**: API routes (e.g., `POST /api/users`) must verify permissions (e.g., `users.create`) before processing the request.

## 4. Implementation Requirements

### 4.1 Backend (Next.js Server Actions / API)

- [ ] Implement a helper function `getUserPermissions(userId)` that joins `user_roles`, `roles`, and `role_permissions` to return a flat array of permission slugs.
- [ ] Create a `checkPermission(permissionSlug)` utility for server components and API routes.

### 4.2 Frontend

- [ ] Update the `Sidebar` component to accept a user's permissions.
- [ ] Filter navigation items based on the user's permissions.
- [ ] Create a `<Protect permission="some.permission">` wrapper component to conditionally render UI elements (like "Delete" buttons) based on access.

## 5. Default Roles & Permissions Strategy

### 5.1 System Roles

- **Super Admin**: Has all permissions (`*`).
- **User**: Basic access, typically read-only for public resources or managing own profile.

### 5.2 Naming Convention

- **Permissions**: `resource.action` (e.g., `roles.create`, `dashboard.view`).

## 6. Future Considerations

- **Cached Permissions**: To improve performance, permission lists should be cached in the session token (if using JWT) or a quick key-value store, rather than querying the DB on every single UI element render.
