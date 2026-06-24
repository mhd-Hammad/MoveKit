"use client"

import { useState } from "react"
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

const mockTips = [
  {
    id: "1",
    author: "Alex K.",
    topic: "transportation",
    body: "Get a monthly transit pass on day one — it's way cheaper than buying individual tickets. The student discount is about 40% off at most cities.",
    upvotes: 12,
    downvotes: 1,
    created_at: "3 days ago",
  },
  {
    id: "2",
    author: "Sarah M.",
    topic: "food",
    body: "The farmers market every Saturday has fresh produce for half the supermarket price. Also check if your campus has a food bank — no shame in it during your first month!",
    upvotes: 8,
    downvotes: 0,
    created_at: "1 week ago",
  },
  {
    id: "3",
    author: "James R.",
    topic: "housing",
    body: "Don't sign a lease without seeing the apartment in person or via video call. Some listings are scams. Use your university housing office as a resource — they often have verified listings.",
    upvotes: 15,
    downvotes: 2,
    created_at: "2 weeks ago",
  },
  {
    id: "4",
    author: "Priya D.",
    topic: "academics",
    body: "Go to office hours in the first week — even if you don't have questions. Professors remember faces and it helps later when you need recommendation letters.",
    upvotes: 20,
    downvotes: 0,
    created_at: "2 weeks ago",
  },
  {
    id: "5",
    author: "Chen L.",
    topic: "social_life",
    body: "Join at least two clubs in your first month. One related to your studies and one completely different. Best way to make friends outside your program.",
    upvotes: 9,
    downvotes: 1,
    created_at: "3 weeks ago",
  },
]

export default function TipsPage() {
  const [activeTopic, setActiveTopic] = useState("all")
  const [newTip, setNewTip] = useState("")
  const [newTopic, setNewTopic] = useState("housing")

  const filtered = activeTopic === "all"
    ? mockTips
    : mockTips.filter((t) => t.topic === activeTopic)

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
      <div className="space-y-3">
        {filtered.map((tip) => (
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
                    <span>by {tip.author}</span>
                    <span>· {tip.created_at}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                disabled={newTip.length < 20}
              >
                Submit Tip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
