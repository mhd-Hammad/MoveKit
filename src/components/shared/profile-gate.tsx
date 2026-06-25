"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface UserProfile {
  id: string
  email_verified: boolean
  profile_completed: boolean
  location_verified: boolean
  first_name: string
  university_name: string
  role_type: string
}

interface ProfileStep {
  label: string
  done: boolean
  href?: string
  required: boolean
}

/**
 * ProfileGate wraps page content and blocks actions if profile is incomplete.
 * - mode="view": User can see content but action buttons are disabled
 * - mode="block": Shows completion banner instead of content
 */
export function ProfileGate({
  children,
  mode = "view",
  requireLocation = false,
}: {
  children: React.ReactNode
  mode?: "view" | "block"
  requireLocation?: boolean
}) {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("movekit_user")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      // Refresh from API
      if (parsed.id) {
        fetch(`/api/profile?user_id=${parsed.id}`)
          .then(r => r.json())
          .then(data => {
            if (data.id) {
              setUser(data)
              localStorage.setItem("movekit_user", JSON.stringify(data))
            }
          })
          .catch(() => {})
      }
    }
    setLoading(false)
  }, [])

  if (loading) return null

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-4xl mb-3">🔐</p>
          <p className="text-lg font-medium">Sign in required</p>
          <p className="text-sm text-muted-foreground mb-4">You need to sign in to access this feature.</p>
          <Link href="/login"><Button>Sign In</Button></Link>
        </CardContent>
      </Card>
    )
  }

  const steps: ProfileStep[] = [
    { label: "Email verified", done: !!user.email_verified, required: true },
    { label: "Profile completed", done: !!user.profile_completed, href: "/register", required: true },
    { label: "Location verified", done: !!user.location_verified, href: "/verify-location", required: requireLocation },
  ]

  const requiredSteps = steps.filter(s => s.required)
  const completedSteps = requiredSteps.filter(s => s.done)
  const isComplete = completedSteps.length === requiredSteps.length
  const progress = Math.round((completedSteps.length / requiredSteps.length) * 100)

  if (isComplete) {
    return <>{children}</>
  }

  if (mode === "block") {
    return <ProfileCompletionBanner steps={steps} progress={progress} />
  }

  // mode === "view" — show content with overlay banner
  return (
    <div className="space-y-4">
      <ProfileCompletionBanner steps={steps} progress={progress} compact />
      <div className="opacity-60 pointer-events-none select-none">
        {children}
      </div>
    </div>
  )
}

function ProfileCompletionBanner({
  steps,
  progress,
  compact = false,
}: {
  steps: ProfileStep[]
  progress: number
  compact?: boolean
}) {
  return (
    <Card className={`border-primary/20 ${compact ? "" : "my-8"}`}>
      <CardContent className={compact ? "py-4" : "py-8"}>
        <div className={compact ? "" : "text-center max-w-md mx-auto"}>
          {!compact && <p className="text-3xl mb-3">🚀</p>}
          <h3 className={`font-semibold ${compact ? "text-sm" : "text-lg"}`}>
            Complete your profile to unlock all features
          </h3>
          {!compact && (
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              You can browse the platform, but creating listings, chatting, and making deals requires a complete profile.
            </p>
          )}

          {/* Progress bar */}
          <div className="mt-3 mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Profile completion</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className={`space-y-2 ${compact ? "mt-2" : "mt-4"}`}>
            {steps.filter(s => s.required).map((step) => (
              <div key={step.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={step.done ? "text-emerald-600" : "text-muted-foreground"}>
                    {step.done ? "✅" : "⬜"}
                  </span>
                  <span className={step.done ? "text-muted-foreground line-through" : ""}>{step.label}</span>
                </div>
                {!step.done && step.href && (
                  <Link href={step.href}>
                    <Button size="sm" variant="outline" className="text-xs h-7">Complete →</Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Hook to check if the current user can perform actions.
 * Returns { canAct, user, reason }
 */
export function useProfileGate() {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("movekit_user")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const canAct = !!(user?.email_verified && user?.profile_completed)
  const reason = !user
    ? "Sign in required"
    : !user.email_verified
    ? "Email verification required"
    : !user.profile_completed
    ? "Complete your profile first"
    : null

  return { canAct, user, reason }
}
