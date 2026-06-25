"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ChatSession {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  is_restricted: boolean
  created_at: string
  listings?: { id: string; title: string; price: number } | null
}

export default function ChatListPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    if (!user.id) { router.push("/login"); return }
    setUserId(user.id)
    fetchSessions(user.id)
  }, [])

  const fetchSessions = async (uid: string) => {
    try {
      const res = await fetch(`/api/chat/sessions?user_id=${uid}`)
      const data = await res.json()
      if (data.data) setSessions(data.data)
    } catch {
      setError("Failed to load chats")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Loading chats...</div>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Your conversations about listings</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <Button size="sm" variant="ghost" className="ml-2" onClick={() => { setError(""); fetchSessions(userId) }}>
            Retry
          </Button>
        </div>
      )}

      {sessions.length === 0 && !error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-lg text-muted-foreground">No conversations yet.</p>
            <p className="text-sm text-muted-foreground mb-4">Contact a seller from the marketplace to start chatting.</p>
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <Link key={session.id} href={`/chat/${session.id}`} aria-label={`Chat about ${session.listings?.title || "listing"}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 mb-2">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      💬
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {session.listings?.title || "Listing"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.listings?.price ? `$${session.listings.price}` : ""} · {session.is_restricted ? "Deal active" : "Open chat"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                      {session.is_restricted && (
                        <span className="text-[10px] text-blue-600 font-medium">🔒 Deal Mode</span>
                      )}
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
