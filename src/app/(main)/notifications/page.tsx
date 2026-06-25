"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  category: string
  title: string
  body: string
  link: string | null
  is_read: boolean
  created_at: string
}

const categoryIcons: Record<string, string> = {
  match: "🔗",
  deal: "🤝",
  message: "💬",
  system: "📢",
  wellness: "💚",
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    if (!user.id) { router.push("/login"); return }
    setUserId(user.id)
    fetchNotifications(user.id)
  }, [])

  const fetchNotifications = async (uid: string) => {
    try {
      const res = await fetch(`/api/notifications?user_id=${uid}`)
      const data = await res.json()
      if (data.data) setNotifications(data.data)
    } catch {
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, mark_all: true }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const handleClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, notification_id: notif.id }),
      })
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
    }
    if (notif.link) router.push(notif.link)
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Loading notifications...</div>
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>Mark all read</Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <Button size="sm" variant="ghost" className="ml-2" onClick={() => { setError(""); fetchNotifications(userId) }}>Retry</Button>
        </div>
      )}

      {notifications.length === 0 && !error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-lg text-muted-foreground">No notifications yet.</p>
            <p className="text-sm text-muted-foreground">You&apos;ll be notified about matches, deals, and messages.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`cursor-pointer transition-all hover:shadow-sm ${
                !notif.is_read ? "border-primary/20 bg-primary/[0.02]" : ""
              }`}
            >
              <CardContent className="py-3.5 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
                    {categoryIcons[notif.category] || "📢"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!notif.is_read ? "font-semibold" : "font-medium"}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" aria-label="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
