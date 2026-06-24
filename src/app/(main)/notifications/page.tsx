"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const mockNotifications = [
  {
    id: "1",
    category: "match",
    title: "New Match Found",
    body: "A kitchen bundle matching your blueprint is available for $60.",
    link: "/matching",
    is_read: false,
    time: "5 min ago",
  },
  {
    id: "2",
    category: "deal",
    title: "Deal Accepted",
    body: "Sarah M. accepted your deal for the Kitchen Bundle.",
    link: "/deals",
    is_read: false,
    time: "1 hr ago",
  },
  {
    id: "3",
    category: "message",
    title: "New Message",
    body: "Tom W. sent you a message about the Power Adapter.",
    link: "/chat",
    is_read: true,
    time: "3 hrs ago",
  },
  {
    id: "4",
    category: "system",
    title: "Welcome to MoveKit!",
    body: "Your email has been verified. Start by generating your survival blueprint.",
    link: "/blueprint",
    is_read: true,
    time: "1 day ago",
  },
  {
    id: "5",
    category: "wellness",
    title: "How are you settling in?",
    body: "It's been a week since your arrival. Let us know how you're doing.",
    link: null,
    is_read: true,
    time: "3 days ago",
  },
]

const categoryIcons: Record<string, string> = {
  match: "🔗",
  deal: "🤝",
  message: "💬",
  system: "📢",
  wellness: "💚",
}

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on matches, deals, and messages</p>
        </div>
        <Button variant="ghost" size="sm">Mark all read</Button>
      </div>

      <div className="space-y-2">
        {mockNotifications.map((notif) => (
          <Card
            key={notif.id}
            className={`cursor-pointer transition-all hover:shadow-sm ${
              !notif.is_read ? "border-primary/20 bg-primary/[0.02]" : ""
            }`}
          >
            <CardContent className="py-3.5 px-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
                  {categoryIcons[notif.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!notif.is_read ? "font-semibold" : "font-medium"}`}>
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{notif.time}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preferences */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Notification Preferences</h3>
          <div className="space-y-3">
            {[
              { key: "matches", label: "Match alerts", desc: "When new listings match your blueprint" },
              { key: "messages", label: "Messages", desc: "New chat messages" },
              { key: "deals", label: "Deal updates", desc: "Proposals, confirmations, expirations" },
              { key: "wellness", label: "Wellness check-ins", desc: "Settling-in wellness pulses" },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{pref.label}</p>
                  <p className="text-xs text-muted-foreground">{pref.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
