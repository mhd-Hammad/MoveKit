"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  sender_id: string
  content: string
  message_type: string
  has_contact_warning: boolean
  created_at: string
}

interface Session {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  is_restricted: boolean
}

export default function ChatSessionPage() {
  const params = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [session, setSession] = useState<Session | null>(null)
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    if (!user.id) { router.push("/login"); return }
    setUserId(user.id)
    fetchMessages()

    // Poll every 3 seconds
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [params.sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/sessions/${params.sessionId}/messages`)
      const data = await res.json()
      if (data.data) {
        setMessages(data.data)
        setLoading(false)
      }
    } catch {
      setError("Failed to load messages")
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/chat/sessions/${params.sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: userId,
          content: message.trim(),
          message_type: "text",
        }),
      })
      if (res.ok) {
        setMessage("")
        fetchMessages()
      }
    } catch {
      setError("Failed to send message")
    }
    setSending(false)
  }

  const handleProposeDeal = () => {
    if (!session) return
    router.push(`/marketplace/${session.listing_id}`)
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Loading chat...</div>
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col h-[calc(100vh-8rem)]">
      {/* Header with listing context */}
      <div className="flex items-center gap-3 border-b pb-4 mb-4">
        <Link href="/chat" className="text-muted-foreground hover:text-foreground" aria-label="Back to chats">←</Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
          💬
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Chat Session</p>
          <p className="text-xs text-muted-foreground">
            Messages are stored in-app for your safety
          </p>
        </div>
        <Badge variant="secondary">In Context</Badge>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
          <Button size="sm" variant="ghost" className="ml-2" onClick={() => { setError(""); fetchMessages() }}>
            Retry
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-3xl mb-2">👋</p>
            <p className="text-sm">Start the conversation! Ask about the item, negotiate the price, or schedule a meetup.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[75%]">
              <div
                className={`rounded-2xl px-4 py-2.5 ${
                  msg.sender_id === userId
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.has_contact_warning && (
                <div className="mt-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] text-amber-800">
                  ⚠️ Sharing contact info outside the app bypasses trust protections
                </div>
              )}
              <p className={`text-[10px] mt-1 ${msg.sender_id === userId ? "text-right" : ""} text-muted-foreground`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <Card className="mb-3">
        <CardContent className="py-2 px-3 flex gap-2 overflow-x-auto">
          <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={handleProposeDeal}>
            🤝 Propose Deal
          </Button>
          <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => setMessage("Can we meet at ")}>
            📍 Schedule Meetup
          </Button>
          <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => setMessage("Is this still available?")}>
            ❓ Ask Availability
          </Button>
        </CardContent>
      </Card>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="h-11"
          maxLength={2000}
          aria-label="Type a message"
          disabled={sending}
        />
        <Button
          type="submit"
          className="h-11 px-6 gradient-primary border-0 text-white"
          disabled={!message.trim() || sending}
          aria-label={sending ? "Sending message" : "Send message"}
        >
          {sending ? "..." : "Send"}
        </Button>
      </form>
    </div>
  )
}
