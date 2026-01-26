# Authentication System Documentation

## Overview

Complete authentication system for Super App Naiera with secure password management, email services, and rate limiting.

## Features

- ✅ User registration with email validation
- ✅ Login with email or username
- ✅ Secure password hashing with bcrypt (cost factor: 12)
- ✅ JWT-based authentication
- ✅ Forgot password with email reset link
- ✅ Reset password with token validation
- ✅ Rate limiting on all auth endpoints
- ✅ Welcome email after registration
- ✅ HTTP-only cookies for token storage
- ✅ Token expiration (1 hour for reset, 7 days for auth)

## API Endpoints

### 1. Register

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "username": "johndoe"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Username Requirements (optional):**
- 3-30 characters
- Only letters, numbers, and underscores

**Response (201 Created):**
```json
{
  "message": "Pendaftaran berhasil. Selamat datang di Super App Naiera!",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "createdAt": "2024-01-26T10:00:00.000Z"
  }
}
```

**Rate Limiting:**
- 3 requests per hour per email

---

### 2. Login

**POST** `/api/auth/login`

Authenticate with email/username and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "image": null,
    "createdAt": "2024-01-26T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies:**
- `auth_token` - HTTP-only, secure, 7 days expiration

**Rate Limiting:**
- 5 attempts per 15 minutes per email
- Returns `remainingAttempts` count on failure

**Error Response (401):**
```json
{
  "error": "Email atau password salah",
  "remainingAttempts": 4
}
```

---

### 3. Logout

**POST** `/api/auth/logout`

Clear authentication token.

**Response (200 OK):**
```json
{
  "message": "Logout berhasil",
  "success": true
}
```

---

### 4. Get Current User

**GET** `/api/auth/me`

Get currently authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

Or use HTTP-only cookie.

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "image": null,
    "createdAt": "2024-01-26T10:00:00.000Z"
  }
}
```

---

### 5. Forgot Password

**POST** `/api/auth/forgot-password`

Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Jika email terdaftar, link reset password akan dikirim ke email Anda."
}
```

**Development Mode:**
In development, the response includes:
```json
{
  "message": "...",
  "devToken": "uuid-token",
  "devResetUrl": "http://localhost:3000/reset-password?token=..."
}
```

**Rate Limiting:**
- 3 requests per 15 minutes per email

**Security:**
- Always returns success message (doesn't reveal if email exists)
- Reset link expires in 1 hour
- Generates cryptographically secure token using `crypto.randomUUID()`

---

### 6. Reset Password

**POST** `/api/auth/reset-password`

Reset password using valid reset token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123"
}
```

**Password Requirements:**
- Same as registration (8+ chars, uppercase, lowercase, number)
- Cannot be the same as old password

**Response (200 OK):**
```json
{
  "message": "Password berhasil direset. Silakan login dengan password baru.",
  "success": true
}
```

**Rate Limiting:**
- 5 attempts per 15 minutes per token

**Error Responses:**

| Status | Error |
|--------|-------|
| 400 | "Token reset tidak valid" |
| 400 | "Link reset tidak valid atau sudah kadaluarsa. Silakan minta link baru." |
| 400 | "Password baru tidak boleh sama dengan password lama." |
| 429 | "Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit." |

---

## Security Features

### Password Security
- **Hashing:** bcrypt with cost factor 12
- **Validation:** Strong password requirements enforced
- **No plain text:** Passwords never stored or logged

### Token Security
- **JWT Tokens:** Signed with HS256 algorithm
- **Secret Key:** Configurable via `JWT_SECRET` env variable
- **Expiration:**
  - Auth tokens: 7 days
  - Reset tokens: 1 hour

### Rate Limiting
- **In-memory** (development)
- **Configurable** limits per endpoint
- **Recommended:** Use Redis or similar in production

### Email Service
- **Development:** Logs to console with full HTML preview
- **Production:** Ready for integration with email providers
- **Templates:** Beautiful HTML email templates

### Cookie Security
- **HTTP-only:** Prevents XSS attacks
- **Secure flag:** Enabled in production
- **SameSite:** 'lax' for CSRF protection
- **Max-age:** 7 days

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255) NOT NULL,
  image TEXT,
  email_verified TIMESTAMP,
  email_verified_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-secret-key-use-openssl-rand-base64-32"

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate JWT secret:
```bash
openssl rand -base64 32
```

## Client-Side Usage

### Registration

```tsx
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123',
    name: 'John Doe',
    username: 'johndoe'
  })
})

const data = await response.json()
if (response.ok) {
  console.log('Registration successful!', data.user)
}
```

### Login

```tsx
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123'
  })
})

const data = await response.json()
if (response.ok) {
  // Token is automatically set in HTTP-only cookie
  console.log('Login successful!', data.user)
  router.push('/dashboard')
}
```

### Protected API Calls

```tsx
// Cookie is automatically sent with credentials: 'include'
const response = await fetch('/api/auth/me', {
  credentials: 'include'
})

// Or with Bearer token
const response = await fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Logout

```tsx
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
})

if (response.ok) {
  router.push('/login')
}
```

### Forgot Password

```tsx
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
})

const data = await response.json()
// Show success message even if email doesn't exist
```

### Reset Password

```tsx
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: searchParams.get('token'),
    password: 'NewSecurePass123'
  })
})

const data = await response.json()
if (data.success) {
  router.push('/login')
}
```

## Server-Side Usage

### Protecting API Routes

```typescript
// app/api/protected/route.ts
import { withAuth } from '@/lib/auth'

export const POST = withAuth(async (request, user) => {
  // user is guaranteed to be authenticated
  return NextResponse.json({
    message: `Hello ${user.name}!`,
    userId: user.userId
  })
})
```

### Getting Auth User in Server Components

```typescript
// app/dashboard/page.tsx
import { getAuthUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome {user.name}</div>
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message in Indonesian"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Development vs Production

### Development Mode
- Email logged to console
- Reset tokens returned in response
- Verbose error messages
- In-memory rate limiting

### Production Mode
- Send real emails (configure email service)
- No tokens in response
- Generic error messages
- Use Redis for rate limiting (recommended)

## Email Service Integration

To enable real email sending in production, update `lib/email/index.ts`:

### Using Resend

```bash
npm install resend
```

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'noreply@yourapp.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}
```

### Using SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await sgMail.send({
      to: options.to,
      from: 'noreply@yourapp.com',
      subject: options.subject,
      html: options.html,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}
```

## Testing

### Manual Testing Flow

1. **Register:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123123","name":"Test User"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123123"}' \
     -c cookies.txt
   ```

3. **Get Current User:**
   ```bash
   curl http://localhost:3000/api/auth/me \
     -b cookies.txt
   ```

4. **Forgot Password:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

5. **Reset Password:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"TOKEN_FROM_EMAIL","password":"NewTest123"}'
   ```

## Best Practices

1. **Always use HTTPS** in production
2. **Never expose JWT_SECRET** in client code
3. **Implement proper rate limiting** with Redis in production
4. **Log authentication events** for security monitoring
5. **Use strong passwords** and enforce complexity
6. **Rotate JWT secrets** periodically
7. **Set secure cookie flags** in production
8. **Validate all input** on both client and server
9. **Don't reveal user existence** in error messages
10. **Implement account lockout** after failed attempts

## Troubleshooting

### "Invalid credentials" but password is correct
- Check password hash in database
- Verify bcrypt cost factor matches
- Ensure password validation rules are consistent

### Rate limiting too aggressive
- Adjust limits in API routes
- Implement Redis for distributed rate limiting
- Add IP-based rate limiting in addition to email-based

### Email not sending in production
- Verify email service API keys
- Check email service credentials
- Ensure `NODE_ENV=production`
- Review email service logs

### Token not persisting
- Check cookie settings (domain, secure, sameSite)
- Verify `credentials: 'include'` in fetch calls
- Ensure cookies are enabled in browser

## Future Enhancements

- [ ] Email verification after registration
- [ ] Two-factor authentication (2FA)
- [ ] OAuth providers (Google, Facebook, etc.)
- [ ] Password history (prevent reuse)
- [ ] Account lockout after N failed attempts
- [ ] Session management (multiple devices)
- [ ] Remember me functionality
- [ ] Password strength meter
- [ ] Biometric authentication (WebAuthn)
- [ ] Admin role management
