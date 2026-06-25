"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UserData {
  id: string
  display_name: string
  email: string
  trust_score: number
  email_verified: boolean
  location_verified: boolean
  document_verified: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("movekit_user")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      // Refresh from API
      fetch(`/api/profile?user_id=${parsed.id}`)
        .then(r => r.json())
        .then(data => { if (data.id) setUser(data) })
        .catch(() => {})
    }
  }, [])

  if (!user) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-muted-foreground">Please log in to access your dashboard.</p>
        <Link href="/login"><Button>Log In</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.display_name} 👋</h1>
        <p className="text-muted-foreground">
          Here&apos;s your relocation overview.
        </p>
      </div>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification Status</CardTitle>
          <CardDescription>Complete all steps to unlock full platform access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {user.email_verified ? (
              <Badge variant="default">✓ Email Verified</Badge>
            ) : (
              <Badge variant="outline">⏳ Email Not Verified</Badge>
            )}
            {user.location_verified ? (
              <Badge variant="default">✓ Location Verified</Badge>
            ) : (
              <Badge variant="outline">⏳ Location Not Verified</Badge>
            )}
            {user.document_verified ? (
              <Badge variant="default">✓ Document Badge</Badge>
            ) : (
              <Badge variant="outline">⏳ No Document Badge</Badge>
            )}
          </div>
          {!user.location_verified && (
            <div className="mt-4">
              <Link href="/verify-location">
                <Button size="sm" variant="outline">📍 Verify Location (+10 trust)</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>🤖</span> AI Blueprint
            </CardTitle>
            <CardDescription>
              Generate your personalized survival kit for relocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/blueprint">
              <Button className="w-full gradient-primary border-0 text-white">Create Blueprint</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>🛍️</span> Marketplace
            </CardTitle>
            <CardDescription>
              Browse items from outgoing students near your campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/marketplace">
              <Button variant="outline" className="w-full">Browse Listings</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>🔗</span> Matches
            </CardTitle>
            <CardDescription>
              See items matched to your blueprint checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/matching">
              <Button variant="outline" className="w-full">View Matches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Trust Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Trust Score</CardTitle>
          <CardDescription>
            Build trust by completing deals, verifying identity, and being responsive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {user.trust_score}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Email verified: <span className="font-medium text-foreground">+20 pts</span></p>
              <p>Location: <span className="font-medium text-foreground">{user.location_verified ? "+10 pts" : "Not yet"}</span></p>
              <p>Deals completed: <span className="font-medium text-foreground">0</span></p>
              <Link href="/profile" className="inline-block mt-1 text-primary text-xs hover:underline">
                View full breakdown →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/chat">
          <Card className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="py-4 text-center">
              <p className="text-xl mb-1">💬</p>
              <p className="text-xs font-medium">Messages</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/deals">
          <Card className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="py-4 text-center">
              <p className="text-xl mb-1">🤝</p>
              <p className="text-xs font-medium">Deals</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tips">
          <Card className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="py-4 text-center">
              <p className="text-xl mb-1">💡</p>
              <p className="text-xs font-medium">Tips</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile">
          <Card className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="py-4 text-center">
              <p className="text-xl mb-1">👤</p>
              <p className="text-xs font-medium">Profile</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
