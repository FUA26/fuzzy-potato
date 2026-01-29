'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface InstallData {
  script_snippet: string
  public_link: string
  qr_code_url: string
  project_id: string
  project_name: string
}

interface InstallationContentProps {
  projectId: string
}

export function InstallationContent({ projectId }: InstallationContentProps) {
  const [data, setData] = useState<InstallData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/dashboard/projects/${projectId}/install`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
    toast.success('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">Loading...</div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load installation data
      </div>
    )
  }

  return (
    <Tabs defaultValue="script" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="script">Script Embed</TabsTrigger>
        <TabsTrigger value="link">Public Link</TabsTrigger>
        <TabsTrigger value="qr">QR Code</TabsTrigger>
      </TabsList>

      {/* Script Embed */}
      <TabsContent value="script">
        <Card>
          <CardHeader>
            <CardTitle>Embed on Your Website</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add this script to your website&apos;s HTML, ideally before the
              closing{' '}
              <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag.
            </p>

            <div className="space-y-2">
              <Label>Script Snippet</Label>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{data.script_snippet}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(data.script_snippet, 'script')}
                >
                  {copied === 'script' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Project ID</Label>
              <div className="flex gap-2">
                <Input value={data.project_id} readOnly />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(data.project_id, 'project-id')}
                >
                  {copied === 'project-id' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Public Link */}
      <TabsContent value="link">
        <Card>
          <CardHeader>
            <CardTitle>Public Feedback Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this link to collect feedback directly without embedding on
              your website.
            </p>

            <div className="space-y-2">
              <Label>Public Link</Label>
              <div className="flex gap-2">
                <Input value={data.public_link} readOnly />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(data.public_link, 'link')}
                >
                  {copied === 'link' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={data.public_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Share Channels</h4>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  asChild
                >
                  <a
                    href={`https://wa.me/?text=Give%20us%20feedback%3A%20${encodeURIComponent(data.public_link)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Share on WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  asChild
                >
                  <a
                    href={`mailto:?subject=Feedback&body=Give%20us%20feedback%3A%20${encodeURIComponent(data.public_link)}`}
                  >
                    Share via Email
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* QR Code */}
      <TabsContent value="qr">
        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code to open your feedback page. Perfect for print
              materials or in-person collection.
            </p>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.qr_code_url}
                  alt="Feedback QR Code"
                  className="w-64 h-64"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = data.qr_code_url
                  link.download = `feedback-qr-${data.project_id}.png`
                  link.click()
                }}
              >
                Download QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
