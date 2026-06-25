"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const topics = [
  { value: "all", label: "All", icon: "🌐" },
  { value: "housing", label: "Housing", icon: "🏠" },
  { value: "transportation", label: "Transport", icon: "🚌" },
  { value: "food", label: "Food", icon: "🍕" },
  { value: "academics", label: "Academics", icon: "📚" },
  { value: "social_life", label: "Social", icon: "🎉" },
]

interface Tip {
  id: string
  topic: string
  body: string
  upvotes: number
  downvotes: number
  created_at: string
  users?: { display_name: string; trust_score: number } | null
}

export default function TipsPage() {
  const [activeTopic, setActiveTopic] = useState("all")
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [newTip, setNewTip] = useState("")
  const [newTopic, setNewTopic] = useState("housing")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchTips() }, [activeTopic])

  const fetchTips = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeTopic !== "all") params.set("topic", activeTopic)
    try {
      const res = await fetch(`/api/tips?${params}`)
      const data = await res.json()
      if (data.data) setTips(data.data)
    } catch {}
    setLoading(false)
  }

  const handleSubmitTip = async () => {
    if (newTip.length < 20) return
    setSubmitting(true)
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_id: user.id, topic: newTopic, body: newTip }),
      })
      if (res.ok) {
        setNewTip("")
        fetchTips()
      }
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Knowledge Graph</h1>
        <p className="text-muted-foreground">Tips from outgoing students to help you settle in</p>
      </div>

      {/* Topic Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {topics.map((topic) => (
          <button
            key={topic.value}
            onClick={() => setActiveTopic(topic.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
              activeTopic === topic.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {topic.icon} {topic.label}
          </button>
        ))}
      </div>

      {/* Tips */}
      {loading ? (
        <div className="py-8 text-center text-muted-foreground animate-pulse">Loading tips...</div>
      ) : tips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">💡</p>
            <p className="text-muted-foreground">No tips yet for this topic.</p>
            <p className="text-sm text-muted-foreground">Be the first to share advice!</p>
          </CardContent>
        </Card>
      ) : (
      <div className="space-y-3">
        {tips.map((tip) => (
          <Card key={tip.id} className="transition-shadow hover:shadow-sm">
            <CardContent className="py-4">
              <div className="flex gap-3">
                {/* Vote */}
                <div className="flex flex-col items-center gap-0.5 text-sm">
                  <button className="hover:text-primary transition-colors">▲</button>
                  <span className="font-bold text-primary">{tip.upvotes - tip.downvotes}</span>
                  <button className="hover:text-destructive transition-colors">▼</button>
                </div>
                {/* Content */}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{tip.body}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">
                      {topics.find((t) => t.value === tip.topic)?.icon} {tip.topic}
                    </Badge>
                    <span>by {tip.users?.display_name || "Anonymous"}</span>
                    <span>· {new Date(tip.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Submit Tip */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Share a Tip</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              {topics.filter(t => t.value !== "all").map((topic) => (
                <button
                  key={topic.value}
                  onClick={() => setNewTopic(topic.value)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    newTopic === topic.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {topic.icon}
                </button>
              ))}
            </div>
            <textarea
              value={newTip}
              onChange={(e) => setNewTip(e.target.value)}
              placeholder="Share advice for incoming students (20-500 characters)..."
              rows={3}
              maxLength={500}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{newTip.length}/500</span>
              <Button
                size="sm"
                className="gradient-primary border-0 text-white"
                disabled={newTip.length < 20 || submitting}
                onClick={handleSubmitTip}
              >
                {submitting ? "Submitting..." : "Submit Tip"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
