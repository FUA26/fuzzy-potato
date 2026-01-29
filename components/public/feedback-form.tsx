'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

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
    position?: string
    trigger_label?: string
  }
  logic?: LogicStep[]
}

interface FeedbackFormProps {
  projectId: string
  config: WidgetConfig
}

export function FeedbackForm({ projectId, config }: FeedbackFormProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const currentStep = config.logic?.find((l) =>
    selectedRating !== null ? l.rating_group.includes(selectedRating) : false
  )

  const primaryColor = config.theme?.color_primary || '#000000'

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedRating === null) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/v1/widget/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          rating: selectedRating,
          answers: {
            comment: comment.trim() || undefined,
            email: email.trim() || undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
          },
          meta: {
            url: window.location.href,
            user_agent: navigator.userAgent,
          },
        }),
      })

      if (res.ok) {
        setSubmitted(true)

        // Handle CTA redirect if configured
        if (currentStep?.cta_redirect) {
          setTimeout(() => {
            window.location.href = currentStep.cta_redirect!
          }, 2000)
        }
      } else {
        alert('Failed to submit feedback. Please try again.')
      }
    } catch {
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedRating(null)
    setComment('')
    setEmail('')
    setSelectedTags([])
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Thank you for your feedback!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We appreciate you taking the time to share your thoughts with us.
        </p>
        {currentStep?.cta_redirect && (
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
            Redirecting...
          </p>
        )}
        <Button variant="outline" onClick={resetForm}>
          Submit Another Feedback
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-6"
    >
      {/* Rating Selection */}
      <div>
        <Label className="text-base font-medium text-center block mb-4">
          How would you rate your experience?
        </Label>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 text-lg font-bold transition-all ${
                selectedRating === rating
                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 scale-110'
                  : 'border-slate-300 dark:border-slate-600 text-slate-400 hover:border-yellow-400 hover:text-yellow-500'
              }`}
              onClick={() => setSelectedRating(rating)}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content based on Rating */}
      {selectedRating !== null && currentStep && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Title */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              {currentStep.title}
            </h3>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Your feedback</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={currentStep.placeholder}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Tags */}
          {currentStep.tags && currentStep.tags.length > 0 && (
            <div>
              <Label className="mb-2 block">
                What describes your experience?
              </Label>
              <div className="flex flex-wrap gap-2">
                {currentStep.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedTags.includes(tag)
                        ? primaryColor
                        : undefined,
                      borderColor: selectedTags.includes(tag)
                        ? primaryColor
                        : undefined,
                    }}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Email */}
          {currentStep.collect_email && (
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>

          {/* Cancel */}
          <button
            type="button"
            className="w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            onClick={() => setSelectedRating(null)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Default message for no logic configured */}
      {selectedRating !== null && !currentStep && (
        <div className="space-y-4 animate-in fade-in">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Please add a comment to help us improve.
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts with us..."
              rows={3}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? 'Sending...' : 'Submit Feedback'}
          </Button>
        </div>
      )}
    </form>
  )
}
