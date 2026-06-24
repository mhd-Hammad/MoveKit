"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: string
    email: string
    display_name: string
    trust_score: number
    trust_breakdown?: { identity_trust: number; location_trust: number; behavior_trust: number; interaction_trust: number }
    is_new_user?: boolean
  } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("movekit_user")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      // Fetch latest trust data from API
      if (parsed.id) {
        fetch(`/api/trust/${parsed.id}`)
          .then(r => r.json())
          .then(data => {
            if (data.total !== undefined) {
              setUser((prev: typeof parsed) => prev ? { ...prev, trust_score: data.total, trust_breakdown: data.breakdown, is_new_user: data.is_new_user } : prev)
            }
          })
          .catch(() => {})
      }
    }
  }, [])

  if (!user) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile Card */}
      <Card className="border-0 shadow-lg shadow-black/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-white">
              {user.display_name[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.display_name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="default">✓ Email Verified</Badge>
                <Badge variant="outline">Trust: {user.trust_score}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trust Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <span className="text-3xl font-bold text-primary">{user.trust_score}</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Identity Trust</span>
                <span className="font-medium">{user.trust_breakdown?.identity_trust ?? 20} pts</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, ((user.trust_breakdown?.identity_trust ?? 20) / 30) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location Trust</span>
                <span className="font-medium">{user.trust_breakdown?.location_trust ?? 0} pts</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, ((user.trust_breakdown?.location_trust ?? 0) / 10) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Behavior Trust</span>
                <span className="font-medium">{user.trust_breakdown?.behavior_trust ?? 0} pts</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, ((user.trust_breakdown?.behavior_trust ?? 0) / 50) * 100)}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deal Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center text-muted-foreground">
            <p className="text-3xl mb-2">🏅</p>
            <p className="text-sm">Complete your first deal to earn a badge!</p>
            <p className="text-xs mt-1">Badges show verified transaction history to other users.</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Button variant="outline" className="w-full justify-start">
            📍 Verify Location
          </Button>
          <Button variant="outline" className="w-full justify-start">
            📄 Upload Document for Badge
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
            🗑️ Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
