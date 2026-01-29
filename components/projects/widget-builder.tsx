'use client'

import { useState } from 'react'
import { Save, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface LogicStep {
  rating_group: number[]
  title: string
  tags: string[]
  placeholder: string
  collect_email: boolean
  cta_redirect?: string
}

interface WidgetConfig {
  theme?: {
    color_primary?: string
    position?: 'bottom_left' | 'bottom_right' | 'top_left' | 'top_right'
    trigger_label?: string
  }
  logic?: LogicStep[]
}

interface WidgetBuilderProps {
  projectId: string
}

export function WidgetBuilder({ projectId }: WidgetBuilderProps) {
  const [config, setConfig] = useState<WidgetConfig>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load existing config
  useEffect(() => {
    fetch(`/api/dashboard/projects/${projectId}`)
      .then((res) => res.json())
      .then((res) => {
        setConfig(res.data?.widgetConfig || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  // Update config
  const updateConfig = (updates: Partial<WidgetConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  // Update logic step
  const updateLogicStep = (index: number, updates: Partial<LogicStep>) => {
    const logic = [...(config.logic || [])]
    logic[index] = { ...logic[index], ...updates }
    updateConfig({ logic })
  }

  // Add tag to logic step
  const addTag = (stepIndex: number, tag: string) => {
    if (!tag.trim()) return
    const logic = [...(config.logic || [])]
    const tags = logic[stepIndex].tags || []
    if (!tags.includes(tag.trim())) {
      logic[stepIndex] = {
        ...logic[stepIndex],
        tags: [...tags, tag.trim()],
      }
      updateConfig({ logic })
    }
  }

  // Remove tag from logic step
  const removeTag = (stepIndex: number, tag: string) => {
    const logic = [...(config.logic || [])]
    logic[stepIndex] = {
      ...logic[stepIndex],
      tags: logic[stepIndex].tags?.filter((t) => t !== tag) || [],
    }
    updateConfig({ logic })
  }

  // Save config
  const saveConfig = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/dashboard/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetConfig: config }),
      })
      if (res.ok) {
        toast.success('Widget configuration saved!')
      } else {
        toast.error('Failed to save configuration')
      }
    } catch {
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">Loading...</div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Configuration</h3>
          <Button size="sm" onClick={saveConfig} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
          </TabsList>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={config.theme?.color_primary || '#000000'}
                  onChange={(e) =>
                    updateConfig({
                      theme: { ...config.theme, color_primary: e.target.value },
                    })
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={config.theme?.color_primary || '#000000'}
                  onChange={(e) =>
                    updateConfig({
                      theme: { ...config.theme, color_primary: e.target.value },
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Widget Position</Label>
              <Select
                value={config.theme?.position || 'bottom_right'}
                onValueChange={(
                  value:
                    | 'bottom_left'
                    | 'bottom_right'
                    | 'top_left'
                    | 'top_right'
                ) =>
                  updateConfig({
                    theme: { ...config.theme, position: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom_left">Bottom Left</SelectItem>
                  <SelectItem value="bottom_right">Bottom Right</SelectItem>
                  <SelectItem value="top_left">Top Left</SelectItem>
                  <SelectItem value="top_right">Top Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trigger Label</Label>
              <Input
                value={config.theme?.trigger_label || 'Feedback'}
                onChange={(e) =>
                  updateConfig({
                    theme: { ...config.theme, trigger_label: e.target.value },
                  })
                }
                placeholder="Feedback"
              />
            </div>
          </TabsContent>

          {/* Logic Tab */}
          <TabsContent value="logic" className="space-y-4">
            {config.logic?.map((step, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {step.rating_group[0] === 1
                      ? 'Negative'
                      : step.rating_group[0] === 3
                        ? 'Neutral'
                        : 'Positive'}
                  </h4>
                  <Badge variant="outline">
                    Rating: {step.rating_group.join(', ')}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={step.title}
                    onChange={(e) =>
                      updateLogicStep(index, { title: e.target.value })
                    }
                    placeholder="Enter title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Placeholder</Label>
                  <Input
                    value={step.placeholder}
                    onChange={(e) =>
                      updateLogicStep(index, { placeholder: e.target.value })
                    }
                    placeholder="Enter placeholder..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {step.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          className="ml-1 hover:text-destructive"
                          onClick={() => removeTag(index, tag)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag and press Enter..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag(index, (e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget
                          .previousElementSibling as HTMLInputElement
                        addTag(index, input.value)
                        input.value = ''
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`email-${index}`}
                    checked={step.collect_email}
                    onCheckedChange={(checked) =>
                      updateLogicStep(index, { collect_email: !!checked })
                    }
                  />
                  <Label htmlFor={`email-${index}`}>Collect Email</Label>
                </div>

                {step.rating_group[0] >= 4 && (
                  <div className="space-y-2">
                    <Label>CTA Redirect URL (Optional)</Label>
                    <Input
                      value={step.cta_redirect || ''}
                      onChange={(e) =>
                        updateLogicStep(index, { cta_redirect: e.target.value })
                      }
                      placeholder="https://google.com/maps/..."
                    />
                  </div>
                )}
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                No logic steps configured yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <h3 className="font-semibold">Live Preview</h3>
        <div className="border rounded-lg p-6 bg-muted/30">
          <WidgetPreview config={config} />
        </div>
      </div>
    </div>
  )
}

// Preview Component
function WidgetPreview({ config }: { config: WidgetConfig }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  // Derive current step from selectedRating and config.logic
  const currentStep =
    selectedRating !== null && config.logic
      ? config.logic.find((l) => l.rating_group.includes(selectedRating)) ||
        null
      : null

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      {/* Trigger Button */}
      <div
        className="px-4 py-2 rounded-full text-white font-medium cursor-pointer shadow-lg"
        style={{
          backgroundColor: config.theme?.color_primary || '#000000',
        }}
      >
        {config.theme?.trigger_label || 'Feedback'}
      </div>

      {/* Widget Modal */}
      <div className="mt-4 bg-white dark:bg-slate-900 rounded-lg shadow-xl border p-4 w-full max-w-sm">
        {!selectedRating ? (
          <div className="text-center">
            <h4 className="font-medium mb-3">Rate your experience</h4>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  className="w-10 h-10 rounded-full border-2 border-yellow-400 text-yellow-400 font-bold hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  onClick={() => setSelectedRating(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ) : currentStep ? (
          <div className="text-center">
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <span
                  key={r}
                  className={`w-8 h-8 rounded-full border-2 text-sm flex items-center justify-center ${
                    r <= selectedRating
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-gray-300 text-gray-300'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
            <h4 className="font-medium mb-2">{currentStep.title}</h4>
            <textarea
              className="w-full border rounded-md p-2 text-sm min-h-[60px] mb-2"
              placeholder={currentStep.placeholder}
            />
            {currentStep.tags && currentStep.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center mb-2">
                {currentStep.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {currentStep.collect_email && (
              <input
                type="email"
                className="w-full border rounded-md p-2 text-sm mb-2"
                placeholder="Your email (optional)"
              />
            )}
            <button
              className="w-full py-2 rounded text-white font-medium text-sm"
              style={{
                backgroundColor: config.theme?.color_primary || '#000000',
              }}
            >
              Send Feedback
            </button>
            <button
              className="w-full py-2 text-sm text-muted-foreground mt-1"
              onClick={() => setSelectedRating(null)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Thanks for rating!
            </p>
            <button
              className="w-full py-2 rounded text-white font-medium text-sm"
              style={{
                backgroundColor: config.theme?.color_primary || '#000000',
              }}
              onClick={() => setSelectedRating(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>

      <button
        className="mt-4 text-sm text-muted-foreground underline"
        onClick={() => setSelectedRating(null)}
      >
        Reset Preview
      </button>
    </div>
  )
}
