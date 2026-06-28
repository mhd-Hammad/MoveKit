"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LocationVerifyModal } from "@/components/shared/location-verify-modal"

interface UserData {
  id: string
  display_name: string
  first_name: string
  email: string
  trust_score: number
  email_verified: boolean
  location_verified: boolean
  document_verified: boolean
  role_type: string
  university_name: string
  university_city: string
  university_country: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("movekit_user")
    if (!stored) { router.push("/login"); return }
    const parsed = JSON.parse(stored)
    setUser(parsed)
    // Refresh from API
    fetch(`/api/profile?user_id=${parsed.id}`)
      .then(r => r.json())
      .then(data => { if (data.id) setUser(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  if (loading && !user) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Loading...</div>
  }

  if (!user) return null

  const verificationSteps = [
    { done: user.email_verified, label: "Email", icon: "✉️" },
    { done: !!user.university_name, label: "University", icon: "🎓" },
    { done: user.location_verified, label: "Location", icon: "📍" },
    { done: user.document_verified, label: "Document", icon: "📄" },
  ]
  const completedSteps = verificationSteps.filter(s => s.done).length
  const progressPct = Math.round((completedSteps / verificationSteps.length) * 100)

  const isIncoming = user.role_type === "incoming"

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {user.first_name ? `Hey, ${user.first_name}` : `Hey there`} 👋
          </h1>
          <p className="text-muted-foreground">
            {isIncoming
              ? `Preparing to move to ${user.university_name || "your university"}`
              : `Wrapping up at ${user.university_name || "your university"}`}
          </p>
        </div>
        <Badge variant={isIncoming ? "default" : "secondary"} className="h-7">
          {isIncoming ? "🎒 Incoming" : "🎓 Outgoing"}
        </Badge>
      </div>

      {/* Profile Completion — routes to profile page */}
      {progressPct < 100 && (
        <Link href="/profile">
          <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm">Complete Your Profile</p>
                <span className="text-sm font-bold text-primary">{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/60 dark:bg-white/10 overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {/* Timeline steps */}
              <div className="relative flex items-center justify-between">
                {verificationSteps.map((step, i) => (
                  <div key={step.label} className="flex flex-col items-center relative z-10">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                      step.done 
                        ? "bg-primary border-primary text-white" 
                        : "bg-background border-muted-foreground/30 text-muted-foreground"
                    }`}>
                      {step.done ? "✓" : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1 ${step.done ? "text-primary font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
                {/* Connecting line */}
                <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-muted-foreground/20 -z-0" />
                <div
                  className="absolute top-3.5 left-4 h-0.5 bg-primary -z-0 transition-all duration-500"
                  style={{ width: `${Math.max(0, ((completedSteps - 1) / (verificationSteps.length - 1)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Tap to complete remaining steps →
              </p>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="py-5">
            <p className="text-3xl font-bold text-primary">{user.trust_score}<span className="text-base text-muted-foreground font-normal">/100</span></p>
            <p className="text-[11px] text-muted-foreground mt-1">Trust Score</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-5">
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-[11px] text-muted-foreground mt-1">Deals Done</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-5">
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-[11px] text-muted-foreground mt-1">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions — Different for Incoming vs Outgoing */}
      <div>
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {isIncoming ? (
            <>
              <Link href="/blueprint">
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group">
                  <CardContent className="py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-xl group-hover:scale-110 transition-transform">🤖</div>
                    <div>
                      <p className="font-medium text-sm">Generate AI Blueprint</p>
                      <p className="text-xs text-muted-foreground">Get your personalized packing list</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/marketplace">
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group">
                  <CardContent className="py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-xl group-hover:scale-110 transition-transform">🛍️</div>
                    <div>
                      <p className="font-medium text-sm">Browse Marketplace</p>
                      <p className="text-xs text-muted-foreground">Find items from outgoing students</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/matching">
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group">
                  <CardContent className="py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 text-xl group-hover:scale-110 transition-transform">🔗</div>
                    <div>
                      <p className="font-medium text-sm">View Matches</p>
                      <p className="text-xs text-muted-foreground">Items matched to your blueprint</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tips">
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group">
                  <CardContent className="py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-xl group-hover:scale-110 transition-transform">💡</div>
                    <div>
                      <p className="font-medium text-sm">Campus Tips</p>
                      <p className="text-xs text-muted-foreground">Advice from outgoing students</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          ) : (
            <>
              <Link href="/marketplace/create">
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group">
                  <CardContent className="py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-xl group-hover:scale-110 transition-transform">📦</div>
                    <div>
                      <p className="font-medium text-sm">List an Item</p>
                      <p className="text-xs text-muted-foreground">Sell to incoming students</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/marketplace/exit-flow">
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group">
                  <CardContent className="py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-xl group-hover:scale-110 transition-transform">🚀</div>
                    <div>
                      <p className="font-medium text-sm">Exit Flow</p>
                      <p className="text-xs text-muted-foreground">Bulk-list items as bundles</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tips">
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group">
                  <CardContent className="py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-xl group-hover:scale-110 transition-transform">💡</div>
                    <div>
                      <p className="font-medium text-sm">Share Tips</p>
                      <p className="text-xs text-muted-foreground">Help incoming students settle in</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/deals">
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group">
                  <CardContent className="py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-xl group-hover:scale-110 transition-transform">🤝</div>
                    <div>
                      <p className="font-medium text-sm">My Deals</p>
                      <p className="text-xs text-muted-foreground">Track your transactions</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity / Help */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
                {isIncoming ? "📋" : "📊"}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isIncoming ? "Get started with your blueprint" : "Start listing your items"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isIncoming
                    ? "AI will create a personalized checklist for your move"
                    : "Outgoing students can bulk-list items in the Exit Flow"}
                </p>
              </div>
            </div>
            <Link href={isIncoming ? "/blueprint" : "/marketplace/create"}>
              <Button size="sm" className="gradient-primary border-0 text-white">Go →</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Location Verification Modal */}
      <LocationVerifyModal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onVerified={() => {
          setUser(prev => prev ? { ...prev, location_verified: true } : prev)
        }}
      />
    </div>
  )
}
