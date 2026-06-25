"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  sender_id: string
  content: string
  message_type: string
  has_contact_warning: boolean
  created_at: string
}

export default function ChatSessionPage() {
  const params = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    if (user.id) setUserId(user.id)
  }, [])

  useEffect(() => {
    if (!params.sessionId) return
    fetchMessages()
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [params.sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/sessions/${params.sessionId}/messages`)
      const data = await res.json()
      if (data.data) setMessages(data.data)
    } catch {}
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !userId) return

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
        await fetchMessages()
      }
    } catch {}
    setSending(false)
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 mb-4">
        <Link href="/chat" className="text-muted-foreground hover:text-foreground">←</Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">💬</div>
        <div className="flex-1">
          <p className="font-medium">Chat Session</p>
          <p className="text-xs text-muted-foreground">{messages.length} messages</p>
        </div>
        <Badge variant="secondary">Active</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-3xl mb-2">👋</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.sender_id === userId
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              }`}
            >
              {msg.has_contact_warning && (
                <p className="text-[10px] text-amber-300 mb-1">⚠️ Contact info detected — sharing outside the app bypasses trust protections</p>
              )}
              <p className="text-sm">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.sender_id === userId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="h-11"
          maxLength={2000}
          disabled={sending}
        />
        <Button type="submit" className="h-11 px-6 gradient-primary border-0 text-white" disabled={!message.trim() || sending}>
          {sending ? "..." : "Send"}
        </Button>
      </form>
    </div>
  )
}
