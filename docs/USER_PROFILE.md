# User Profile & Account Management Documentation

## Overview

Complete user profile and account management system with secure password change, profile updates, and a polished user interface.

## Features

- ✅ **Profile Management** - Update name, username, and profile picture
- ✅ **Password Change** - Secure password change with validation
- ✅ **Account Menu** - Quick access to all account features
- ✅ **Notifications** - Notification menu in header
- ✅ **Authentication** - Protected routes with JWT
- ✅ **Form Validation** - Real-time validation with error messages
- ✅ **Loading States** - Smooth user experience during operations
- ✅ **Success/Error Feedback** - Toast notifications

## User Menu Structure

### Header User Menu (`components/dashboard/layout/header-user.tsx`)

The user menu provides quick access to:

```
┌─────────────────────────┐
│ John Doe                │
│ john@example.com         │
│ @johndoe                │
├─────────────────────────┤
│ 👤 Profile              │
│ ⚙️  Settings            │
├─────────────────────────┤
│ 🛡️  Security            │
│ 🔑 Change Password      │
├─────────────────────────┤
│ 🚪 Log out              │
└─────────────────────────┘
```

## Pages

### 1. Profile Page (`/profile`)

**Location:** `app/(backoffice)/profile/page.tsx`

**Features:**

- Update name, username, and profile picture
- Email displayed as read-only
- Account information (ID, join date)
- Real-time form validation
- Success feedback

**Form Fields:**

- **Name** - Full name (min 2 characters)
- **Username** - Unique username (3-30 chars, alphanumeric + underscore)
- **Email** - Read-only, displayed for info
- **Profile Picture** - URL-based image upload

### 2. Change Password Page (`/change-password`)

**Location:** `app/(backoffice)/change-password/page.tsx`

**Features:**

- Verify current password
- Set new password with validation
- Password visibility toggles
- Password requirements checklist
- Success confirmation state

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- Cannot be same as current password

## API Endpoints

### GET /api/user/profile

Get current user profile.

**Authentication:** Required (JWT cookie)

**Response (200 OK):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "image": "https://example.com/photo.jpg",
    "createdAt": "2024-01-26T10:00:00.000Z"
  }
}
```

### PUT /api/user/profile

Update user profile.

**Authentication:** Required (JWT cookie)

**Request Body:**

```json
{
  "name": "John Updated",
  "username": "johnupdated",
  "image": "https://example.com/new-photo.jpg"
}
```

**Response (200 OK):**

```json
{
  "message": "Profile berhasil diupdate",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Updated",
    "username": "johnupdated",
    "image": "https://example.com/new-photo.jpg",
    "createdAt": "2024-01-26T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Error                             |
| ------ | --------------------------------- |
| 400    | "Username sudah digunakan"        |
| 400    | "Username harus 3-30 karakter..." |
| 401    | "Unauthorized"                    |
| 404    | "User not found"                  |
| 500    | "Terjadi kesalahan server"        |

### POST /api/user/change-password

Change user password.

**Authentication:** Required (JWT cookie)

**Request Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

**Response (200 OK):**

```json
{
  "message": "Password berhasil diubah"
}
```

**Error Responses:**

| Status | Error                                                 |
| ------ | ----------------------------------------------------- |
| 400    | "Password saat ini salah"                             |
| 400    | "Password baru harus minimal 8 karakter"              |
| 400    | "Password baru tidak boleh sama dengan password lama" |
| 401    | "Unauthorized"                                        |
| 500    | "Terjadi kesalahan server"                            |

## Usage Examples

### Update Profile

```tsx
const response = await fetch('/api/user/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'John Doe',
    username: 'johndoe',
    image: 'https://example.com/photo.jpg',
  }),
})

const data = await response.json()
console.log(data.message) // "Profile berhasil diupdate"
```

### Change Password

```tsx
const response = await fetch('/api/user/change-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    currentPassword: 'OldPass123',
    newPassword: 'NewPass456',
  }),
})

const data = await response.json()
console.log(data.message) // "Password berhasil diubah"
```

## Component Usage

### HeaderUser Component

```tsx
import { HeaderUser } from '@/components/dashboard/layout/header-user'

;<HeaderUser
  user={{
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatar.jpg',
    username: 'johndoe',
  }}
/>
```

### Profile Page

```tsx
import ProfilePage from './page'

// Automatically fetches and displays profile
export default ProfilePage
```

## Navigation Structure

```
/(backoffice)
├── dashboard/          # Main dashboard
├── profile/            # Profile management ✨ NEW
├── change-password/    # Change password ✨ NEW
├── roles/              # Roles management
├── permissions/        # Permissions management
└── users/              # Users management
```

## Security Features

### Password Change

- ✅ Must verify current password
- ✅ Strong password requirements
- ✅ Cannot reuse current password
- ✅ Secure hashing with bcrypt (cost 12)
- ✅ Rate limiting ready (can be added)

### Profile Updates

- ✅ JWT authentication required
- ✅ Username uniqueness validation
- ✅ Form validation with Zod
- ✅ Sanitized inputs
- ✅ Email is read-only (prevents account takeover)

### Authentication

- ✅ JWT token in HTTP-only cookie
- ✅ Token validation on every request
- ✅ Auto-redirect to login if unauthorized
- ✅ Server-side rendering support

## Form Validation Schemas

### Profile Schema

```typescript
const profileSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  username: z
    .string()
    .min(3, 'Username harus minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, dan underscore')
    .optional(),
  image: z.string().url('URL tidak valid').optional().or(z.literal('')),
})
```

### Password Schema

```typescript
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword)
  .refine((data) => data.currentPassword !== data.newPassword)
```

## UI Components Used

- **Card** - Container for profile sections
- **Form** - Form wrapper with validation
- **Input** - Text inputs with labels
- **Button** - Action buttons
- **Avatar** - Profile picture display
- **Dialog** - Image upload modal
- **Separator** - Visual divider
- **Badge** - Notification badge
- **DropdownMenu** - User menu

## Best Practices

### Updating Profile

```tsx
// ✅ Do: Use the profile page
router.push('/profile')

// ❌ Don't: Directly call API from client component without error handling
fetch('/api/user/profile', { method: 'PUT', body: ... })
```

### Password Change

```tsx
// ✅ Do: Require current password verification
const { verifyPassword } = await import('@/lib/auth')
const isValid = await verifyPassword(current, hashed)

// ❌ Don't: Allow password change without verification
```

### Form Validation

```tsx
// ✅ Do: Validate on client and server
const schema = z.object({ ... })
const form = useForm({ resolver: zodResolver(schema) })

// ❌ Don't: Only validate on client or only on server
```

## Testing

### Manual Testing Flow

1. **Update Profile:**

   ```bash
   # Go to profile page
   http://localhost:3000/profile

   # Update name and save
   # Should see success toast
   ```

2. **Change Password:**

   ```bash
   # Go to change-password page
   http://localhost:3000/change-password

   # Enter current password
   # Enter new password
   # Confirm new password
   # Submit
   # Should see success screen
   ```

3. **Test Validation:**
   - Try username with spaces (should fail)
   - Try short password (should fail)
   - Try password without numbers (should fail)
   - Try mismatched passwords (should fail)

## Future Enhancements

- [ ] Email change with verification
- [ ] Two-factor authentication (2FA)
- [ ] Account deletion
- [ ] Download personal data
- [ ] Profile activity log
- [ ] Session management (view active sessions)
- [ ] OAuth connections
- [ ] Profile picture upload (not just URL)
- [ ] API key management
- [ ] Notification preferences

## Troubleshooting

### "Unauthorized" Error

- Check JWT token is in cookie
- Verify token is not expired
- Ensure credentials: 'include' in fetch

### Profile Not Loading

- Check /api/user/profile endpoint
- Verify user is authenticated
- Check browser console for errors

### Password Change Fails

- Verify current password is correct
- Check password meets requirements
- Ensure new password ≠ current password
