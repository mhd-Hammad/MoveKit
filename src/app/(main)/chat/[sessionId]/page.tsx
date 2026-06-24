"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  sender: "me" | "them"
  content: string
  time: string
  has_contact_warning?: boolean
}

const mockMessages: Message[] = [
  { id: "1", sender: "me", content: "Hi! I'm interested in the kitchen bundle. Is everything still available?", time: "10:30 AM" },
  { id: "2", sender: "them", content: "Hey! Yes, everything is available. It includes pots, pans, utensils, and a chopping board.", time: "10:32 AM" },
  { id: "3", sender: "me", content: "Great! Would you take $50 for it?", time: "10:35 AM" },
  { id: "4", sender: "them", content: "I can do $55 since the pans are basically brand new.", time: "10:37 AM" },
  { id: "5", sender: "me", content: "Deal! Can we meet tomorrow?", time: "10:38 AM" },
  { id: "6", sender: "them", content: "Sure, I can meet tomorrow at the campus library!", time: "10:40 AM" },
]

export default function ChatSessionPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>(mockMessages)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "me",
      content: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages([...messages, newMsg])
    setMessage("")
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 mb-4">
        <Link href="/chat" className="text-muted-foreground hover:text-foreground">←</Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">S</div>
        <div className="flex-1">
          <p className="font-medium">Sarah M.</p>
          <p className="text-xs text-muted-foreground">Complete Kitchen Starter Bundle · $60</p>
        </div>
        <Badge variant="secondary">⭐ 50</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.sender === "me"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <Card className="mb-3">
        <CardContent className="py-2 px-3 flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">🤝 Propose Deal</Button>
          <Button variant="outline" size="sm" className="text-xs">📍 Schedule Meetup</Button>
          <Button variant="outline" size="sm" className="text-xs">📸 Send Photo</Button>
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
        />
        <Button type="submit" className="h-11 px-6 gradient-primary border-0 text-white" disabled={!message.trim()}>
          Send
        </Button>
      </form>
    </div>
  )
}
