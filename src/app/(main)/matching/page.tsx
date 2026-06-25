"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface MatchResult {
  listing: {
    id: string
    title: string
    price: number
    category: string
    condition: string
    users?: { trust_score: number; display_name?: string } | null
  }
  score: number
  breakdown: {
    distance_score: number
    price_score: number
    trust_score: number
    completeness_score: number
  }
}

export default function MatchingPage() {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [weights, setWeights] = useState({
    distance: 25,
    price: 25,
    trust: 30,
    completeness: 20,
  })

  const total = weights.distance + weights.price + weights.trust + weights.completeness

  const fetchMatches = async () => {
    setLoading(true)
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    const params = new URLSearchParams({
      w_distance: (weights.distance / 100).toString(),
      w_price: (weights.price / 100).toString(),
      w_trust: (weights.trust / 100).toString(),
      w_completeness: (weights.completeness / 100).toString(),
    })
    if (user.id) params.set("user_id", user.id)

    try {
      const res = await fetch(`/api/matching?${params}`)
      const data = await res.json()
      if (data.data) setMatches(data.data)
    } catch {
      console.error("Failed to fetch matches")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMatches() }, [])

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Matched Listings</h1>
        <p className="text-muted-foreground">
          Items matched to your survival blueprint, ranked by our algorithm.
        </p>
      </div>

      {/* Weight Adjusters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adjust Priorities</CardTitle>
          <CardDescription>
            Customize how matches are ranked.{" "}
            <span className={total === 100 ? "text-green-600" : "text-destructive"}>
              Total: {total}%{total !== 100 && " (must equal 100%)"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: "distance" as const, label: "Distance", icon: "📍" },
              { key: "price" as const, label: "Price", icon: "💰" },
              { key: "trust" as const, label: "Trust Score", icon: "🛡️" },
              { key: "completeness" as const, label: "Blueprint Match", icon: "✅" },
            ].map((w) => (
              <div key={w.key} className="flex items-center gap-3">
                <span className="w-6 text-center">{w.icon}</span>
                <span className="w-32 text-sm">{w.label}</span>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={weights[w.key]}
                  onChange={(e) => handleWeightChange(w.key, Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right text-sm font-medium">{weights[w.key]}%</span>
              </div>
            ))}
          </div>
          <Button onClick={fetchMatches} size="sm" className="mt-4" disabled={total !== 100}>
            Re-rank Matches
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="py-8 text-center text-muted-foreground animate-pulse">
          Loading matches...
        </div>
      )}

      {/* No matches */}
      {!loading && matches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg text-muted-foreground">No matches found yet.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create a blueprint first, then listings near your campus will be matched.
            </p>
            <Link href="/blueprint">
              <Button>Create Blueprint</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Match Results */}
      {!loading && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map((match, i) => (
            <Link key={match.listing.id} href={`/marketplace/${match.listing.id}`}>
              <Card className="transition-shadow hover:shadow-md mb-4">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                        <h3 className="font-semibold">{match.listing.title}</h3>
                      </div>
                      <p className="text-xl font-bold text-primary">${match.listing.price}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="secondary">{match.listing.category}</Badge>
                        <Badge variant="outline">{match.listing.condition?.replace("_", " ")}</Badge>
                        {match.listing.users && (
                          <Badge variant="outline">⭐ {match.listing.users.trust_score}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(match.score * 100)}%
                      </div>
                      <p className="text-xs text-muted-foreground">match</p>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="mt-4 grid grid-cols-4 gap-2 rounded-lg bg-muted p-3 text-xs">
                    <div className="text-center">
                      <p className="font-medium">{Math.round(match.breakdown.distance_score * 100)}%</p>
                      <p className="text-muted-foreground">Distance</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{Math.round(match.breakdown.price_score * 100)}%</p>
                      <p className="text-muted-foreground">Price</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{Math.round(match.breakdown.trust_score * 100)}%</p>
                      <p className="text-muted-foreground">Trust</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{Math.round(match.breakdown.completeness_score * 100)}%</p>
                      <p className="text-muted-foreground">Match</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
