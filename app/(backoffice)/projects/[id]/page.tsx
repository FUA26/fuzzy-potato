import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectIdPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/projects/${id}/overview`)
}
