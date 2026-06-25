"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ChatSession {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  created_at: string
  listings?: { id: string; title: string; price: number } | null
}

export default function ChatListPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    if (!user.id) { setLoading(false); return }

    fetch(`/api/chat/sessions?user_id=${user.id}`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to load conversations")
        return r.json()
      })
      .then(data => { if (data.data) setSessions(data.data) })
      .catch((err) => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted" />
                  <div className="h-3 w-1/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-medium text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">Please check your connection and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Your conversations with buyers and sellers</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-muted-foreground">No conversations yet.</p>
            <p className="text-sm text-muted-foreground">Contact a seller from the marketplace to start chatting.</p>
            <Link href="/marketplace" className="inline-block mt-4">
              <Badge variant="default" className="cursor-pointer">Browse Marketplace →</Badge>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <Link key={session.id} href={`/chat/${session.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 mb-2">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      💬
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {session.listings?.title || "Chat"}
                      </p>
                      <p className="text-sm text-primary font-medium">
                        ${session.listings?.price || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Started {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
