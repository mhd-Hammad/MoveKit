"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface WeightSlider {
  key: string
  label: string
  icon: string
  value: number
}

const mockMatches = [
  {
    id: "1",
    title: "Complete Kitchen Starter Bundle",
    price: 60,
    seller: "Sarah M.",
    trust_score: 50,
    distance_km: 1.2,
    score: 0.87,
    breakdown: { distance: 0.95, price: 0.85, trust: 0.83, completeness: 1.0 },
    matchedItems: ["Kitchen Essentials"],
  },
  {
    id: "2",
    title: "Universal Power Adapter (UK/EU/US)",
    price: 15,
    seller: "Tom W.",
    trust_score: 30,
    distance_km: 2.5,
    score: 0.72,
    breakdown: { distance: 0.90, price: 0.97, trust: 0.50, completeness: 0.5 },
    matchedItems: ["Electronics & Adapters"],
  },
  {
    id: "3",
    title: "Winter Jacket + Boots (Size M)",
    price: 80,
    seller: "James R.",
    trust_score: 28,
    distance_km: 3.1,
    score: 0.65,
    breakdown: { distance: 0.88, price: 0.60, trust: 0.47, completeness: 1.0 },
    matchedItems: ["Climate Kit"],
  },
]

export default function MatchingPage() {
  const [weights, setWeights] = useState<WeightSlider[]>([
    { key: "distance", label: "Distance", icon: "📍", value: 25 },
    { key: "price", label: "Price", icon: "💰", value: 25 },
    { key: "trust", label: "Trust Score", icon: "🛡️", value: 30 },
    { key: "completeness", label: "Blueprint Match", icon: "✅", value: 20 },
  ])

  const handleWeightChange = (key: string, newValue: number) => {
    setWeights((prev) =>
      prev.map((w) => (w.key === key ? { ...w, value: newValue } : w))
    )
  }

  const total = weights.reduce((sum, w) => sum + w.value, 0)

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
            {weights.map((w) => (
              <div key={w.key} className="flex items-center gap-3">
                <span className="w-6 text-center">{w.icon}</span>
                <span className="w-32 text-sm">{w.label}</span>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={w.value}
                  onChange={(e) => handleWeightChange(w.key, Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right text-sm font-medium">{w.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Match Results */}
      <div className="space-y-4">
        {mockMatches.map((match, i) => (
          <Card key={match.id} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                    <h3 className="font-semibold">{match.title}</h3>
                  </div>
                  <p className="text-xl font-bold text-primary">${match.price}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {match.matchedItems.map((item) => (
                      <Badge key={item} variant="default">{item}</Badge>
                    ))}
                    <Badge variant="outline">📍 {match.distance_km}km</Badge>
                    <Badge variant="outline">⭐ {match.trust_score}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Seller: {match.seller}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(match.score * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">match</p>
                  <Button size="sm" className="mt-2">Contact</Button>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="mt-4 grid grid-cols-4 gap-2 rounded-lg bg-muted p-3 text-xs">
                <div className="text-center">
                  <p className="font-medium">{Math.round(match.breakdown.distance * 100)}%</p>
                  <p className="text-muted-foreground">Distance</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">{Math.round(match.breakdown.price * 100)}%</p>
                  <p className="text-muted-foreground">Price</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">{Math.round(match.breakdown.trust * 100)}%</p>
                  <p className="text-muted-foreground">Trust</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">{Math.round(match.breakdown.completeness * 100)}%</p>
                  <p className="text-muted-foreground">Match</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
