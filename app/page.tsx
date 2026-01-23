import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Banner } from '@/components/banner'
import { Header } from '@/components/header'
import {
  Rocket,
  Zap,
  Shield,
  Database,
  Palette,
  Code2,
  GitBranch,
  CheckCircle2,
} from 'lucide-react'

const features = [
  {
    icon: Rocket,
    title: 'Next.js 16',
    description:
      'Built with the latest Next.js featuring App Router and React Server Components',
  },
  {
    icon: Palette,
    title: 'Modern UI',
    description:
      'Shadcn UI components with Tailwind CSS v4 for beautiful, accessible interfaces',
  },
  {
    icon: Database,
    title: 'Database Ready',
    description:
      'Drizzle ORM with PostgreSQL planned for robust data management',
  },
  {
    icon: Zap,
    title: 'Developer Experience',
    description:
      'TypeScript strict mode, ESLint, Prettier, and Husky for code quality',
  },
  {
    icon: Shield,
    title: 'Security First',
    description:
      'Best practices for Server Actions, authentication, and CSP headers',
  },
  {
    icon: GitBranch,
    title: 'Conventional Commits',
    description:
      'Automated commitlint and pre-commit hooks for consistent git history',
  },
]

const techStack = [
  'Next.js 16',
  'TypeScript',
  'Tailwind CSS v4',
  'Shadcn UI',
  'Drizzle ORM',
  'PostgreSQL',
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Banner />
      <Header />
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-6 py-24 text-center md:py-32">
        <Badge variant="outline" className="px-4 py-1.5">
          v1.0.0 - Phase 2 Complete
        </Badge>
        <h1 className="text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Bandanaiera
        </h1>
        <p className="max-w-[42rem] text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          A modern Next.js 16 fullstack boilerplate with App Router, TypeScript,
          Tailwind CSS v4, and Shadcn UI. Start building your next project with
          confidence.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <a href="#features">Explore Features</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </Button>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="font-normal">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container space-y-12 py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="text-balance font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl">
            Everything You Need
          </h2>
          <p className="max-w-[42rem] text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            A complete foundation for your next web application, with best
            practices baked in.
          </p>
        </div>

        <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 lg:max-w-[64rem] lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="relative overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container flex flex-col items-center gap-6 py-24 text-center">
        <div className="mx-auto max-w-[58rem] space-y-4">
          <h2 className="text-balance font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl">
            Ready to Build?
          </h2>
          <p className="max-w-[42rem] text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Get started with Bandanaiera and accelerate your development
            process.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code2 className="mr-2 h-4 w-4" />
              Get Started
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#features">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              View Features
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container border-t py-8 text-center text-sm text-muted-foreground">
        <p>
          Built with{' '}
          <span className="font-semibold text-foreground">Next.js 16</span> and{' '}
          <span className="font-semibold text-foreground">Shadcn UI</span>
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} Bandanaiera. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
