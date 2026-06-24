"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockSessions = [
  {
    id: "1",
    other_user: "Sarah M.",
    trust_score: 50,
    listing_title: "Complete Kitchen Starter Bundle",
    listing_price: 60,
    last_message: "Sure, I can meet tomorrow at the campus library!",
    time: "2 min ago",
    unread: 2,
  },
  {
    id: "2",
    other_user: "Tom W.",
    trust_score: 30,
    listing_title: "Universal Power Adapter",
    listing_price: 15,
    last_message: "Is the adapter still available?",
    time: "1 hr ago",
    unread: 0,
  },
  {
    id: "3",
    other_user: "James R.",
    trust_score: 28,
    listing_title: "Winter Jacket + Boots (Size M)",
    listing_price: 80,
    last_message: "Deal confirmed! See you at 3pm.",
    time: "Yesterday",
    unread: 0,
  },
]

export default function ChatListPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Your conversations with buyers and sellers</p>
      </div>

      {mockSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-muted-foreground">No conversations yet.</p>
            <p className="text-sm text-muted-foreground">Contact a seller from the marketplace to start chatting.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {mockSessions.map((session) => (
            <Card key={session.id} className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {session.other_user[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.other_user}</p>
                        <span className="text-xs text-muted-foreground">⭐ {session.trust_score}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{session.time}</span>
                    </div>
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {session.listing_title} · ${session.listing_price}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {session.last_message}
                    </p>
                  </div>
                  {session.unread > 0 && (
                    <Badge className="shrink-0">{session.unread}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
