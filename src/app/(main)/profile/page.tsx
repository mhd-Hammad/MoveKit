"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  display_name: string
  university_domain: string
  email_verified: boolean
  document_verified: boolean
  location_verified: boolean
  trust_score: number
  campus_id: string | null
  created_at: string
  completed_deals: number
  badge_count: number
  campuses?: { name: string; university_domains?: { university_name: string } } | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [trustBreakdown, setTrustBreakdown] = useState<{
    identity_trust: number; location_trust: number; behavior_trust: number; interaction_trust: number
  } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("movekit_user")
    if (!stored) {
      setLoading(false)
      return
    }
    const parsed = JSON.parse(stored)
    
    // Fetch full profile from API — validates the user still exists
    fetch(`/api/profile?user_id=${parsed.id}`)
      .then(r => {
        if (!r.ok) throw new Error("User not found")
        return r.json()
      })
      .then(data => {
        if (data.id) {
          setUser(data)
          setNewName(data.display_name)
        } else {
          // User was deleted from DB — clear local storage
          localStorage.removeItem("movekit_user")
        }
      })
      .catch(() => {
        // User doesn't exist anymore — clear stale data
        localStorage.removeItem("movekit_user")
      })
      .finally(() => setLoading(false))

    // Fetch trust breakdown
    fetch(`/api/trust/${parsed.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.breakdown) setTrustBreakdown(data.breakdown)
      })
      .catch(() => {})
  }, [])

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, display_name: newName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser({ ...user, display_name: data.display_name })
        localStorage.setItem("movekit_user", JSON.stringify({ ...user, display_name: data.display_name }))
        setEditing(false)
      }
    } catch {}
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!user) return
    const res = await fetch(`/api/profile?user_id=${user.id}&confirm=true`, { method: "DELETE" })
    if (res.ok) {
      localStorage.removeItem("movekit_user")
      router.push("/")
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading profile...</div>
  }

  if (!user) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
        <Link href="/login"><Button>Log In</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile Card */}
      <Card className="border-0 shadow-lg shadow-black/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-white">
              {user.display_name[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={50}
                    className="h-9"
                  />
                  <Button size="sm" onClick={handleSaveName} disabled={saving}>
                    {saving ? "..." : "Save"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setNewName(user.display_name) }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{user.display_name}</h2>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="text-xs">✏️ Edit</Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.campuses?.university_domains?.university_name && (
                <p className="text-sm text-primary mt-0.5">
                  🎓 {user.campuses.university_domains.university_name}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {user.email_verified && <Badge variant="default">✓ Email</Badge>}
                {user.location_verified ? (
                  <Badge variant="default">✓ Location</Badge>
                ) : (
                  <Badge variant="outline">⏳ Location</Badge>
                )}
                {user.document_verified ? (
                  <Badge variant="default">✓ Document</Badge>
                ) : (
                  <Badge variant="outline">⏳ Document</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trust Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-3xl font-bold text-primary">{user.trust_score}</span>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: "Identity", value: trustBreakdown?.identity_trust ?? 20, max: 30 },
                { label: "Location", value: trustBreakdown?.location_trust ?? 0, max: 10 },
                { label: "Behavior", value: trustBreakdown?.behavior_trust ?? 0, max: 50 },
                { label: "Interaction", value: trustBreakdown?.interaction_trust ?? 0, max: 20 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value} / {item.max}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-primary">{user.completed_deals}</p>
            <p className="text-xs text-muted-foreground">Deals Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-primary">{user.badge_count}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-primary">{user.trust_score}</p>
            <p className="text-xs text-muted-foreground">Trust Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          {!user.location_verified && (
            <Link href="/verify-location" className="block">
              <Button variant="outline" className="w-full justify-start">
                📍 Verify Your Location (+10 trust)
              </Button>
            </Link>
          )}
          <Button variant="outline" className="w-full justify-start" disabled>
            📄 Upload Document for Badge (Coming Soon)
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => setDeleteConfirm(true)}
          >
            🗑️ Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="font-semibold text-destructive mb-2">⚠️ Are you sure?</p>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently anonymize your account. Your deals will be preserved but your personal data will be erased.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                Yes, Delete My Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
