# Phase 5: SEO, Metadata & Security

## Objective

Ensure the application is discoverable by search engines and secure against common web vulnerabilities.

## Tech Stack

- **SEO**: Next.js Metadata API, `next-sitemap`.
- **Security**: Next.js Middleware, Headers.

## Requirements

### 1. Metadata Strategy

- **Global Metadata (`layout.tsx`)**:
  - Title Template: `%s | Project Name`.
  - Description: Generic default.
  - OpenGraph / Twitter Cards: Default images/text.
- **Dynamic Metadata**:
  - Implement `generateMetadata` in dynamic pages (e.g., `/blog/[slug]`).
- **Files**:
  - `sitemap.ts`: Generate XML sitemap.
  - `robots.ts`: Robot rules.
  - `manifest.ts`: PWA manifest (optional but good).

### 2. Security Configuration

- **Middleware**:
  - Implement Rate Limiting (using `upstash/ratelimit` or simplified in-memory for simpler apps).
  - Secure Headers injection if not done in `next.config.js`.
- **Headers**:
  - `Content-Security-Policy`: Restrict sources (script-src, style-src).
  - `X-Frame-Options`: DENY or SAMEORIGIN.
  - `X-Content-Type-Options`: nosniff.
  - `Referrer-Policy`: strict-origin-when-cross-origin.

## Implementation Details

### Default Metadata (`app/layout.tsx`)

```tsx
export const metadata: Metadata = {
  title: {
    default: 'Acme Corp',
    template: '%s | Acme Corp',
  },
  description: 'The best boilerplate.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://acme.com',
    siteName: 'Acme Corp',
  },
}
```

### Security Headers (`next.config.js`)

```javascript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
]
// Apply in headers() config
```
