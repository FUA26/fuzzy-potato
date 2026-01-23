import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Bandanaiera',
    template: '%s | Bandanaiera',
  },
  description:
    'A modern Next.js fullstack boilerplate with authentication, database, and RBAC built-in',
  keywords: [
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Drizzle ORM',
    'Boilerplate',
  ],
  authors: [{ name: 'Bandanaiera' }],
  creator: 'Bandanaiera',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Bandanaiera',
    description:
      'A modern Next.js fullstack boilerplate with authentication, database, and RBAC built-in',
    siteName: 'Bandanaiera',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Bandanaiera',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bandanaiera',
    description:
      'A modern Next.js fullstack boilerplate with authentication, database, and RBAC built-in',
    images: ['/og.png'],
    creator: '@bandanaiera',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
