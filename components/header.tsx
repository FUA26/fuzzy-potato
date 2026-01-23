'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '#features' },
  { name: 'Documentation', href: 'https://nextjs.org/docs' },
  { name: 'GitHub', href: 'https://github.com' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="container flex items-center justify-between px-4 py-4"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-2 -m-1.5 p-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">
                B
              </span>
            </div>
            <span className="text-xl font-bold">Bandanaiera</span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={
                item.href.startsWith('http') ? 'noopener noreferrer' : undefined
              }
              className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
            </Link>
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 -m-1.5 p-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-lg font-bold text-primary-foreground">
                    B
                  </span>
                </div>
                <span className="text-xl font-bold">Bandanaiera</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      target={
                        item.href.startsWith('http') ? '_blank' : undefined
                      }
                      rel={
                        item.href.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="space-y-2 py-6">
                  <div className="flex items-center justify-between px-3">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Button asChild className="w-full">
                    <Link
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
