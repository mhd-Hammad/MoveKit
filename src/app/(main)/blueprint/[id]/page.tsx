"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface BlueprintItem {
  id: string
  category: string
  name: string
  description: string | null
  is_obtained: boolean
}

interface Blueprint {
  id: string
  housing_type: string
  budget_min: number
  budget_max: number
  arrival_date: string
  climate_info: { avg_high: number; avg_low: number; precipitation_mm: number; season: string } | null
  cultural_norms: string[] | null
  is_finalized: boolean
  blueprint_items: BlueprintItem[]
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  climate_kit: { label: "Climate Kit", icon: "🌡️" },
  housing_essentials: { label: "Housing Essentials", icon: "🏠" },
  electronics_adapters: { label: "Electronics & Adapters", icon: "🔌" },
  kitchen_essentials: { label: "Kitchen Essentials", icon: "🍳" },
  local_setup_tasks: { label: "Local Setup Tasks", icon: "📝" },
}

export default function BlueprintDetailPage() {
  const params = useParams()
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/blueprint/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then(data => setBlueprint(data))
      .catch(() => setError("Blueprint not found"))
      .finally(() => setLoading(false))
  }, [params.id])

  const toggleItem = (itemId: string) => {
    if (!blueprint) return
    setBlueprint({
      ...blueprint,
      blueprint_items: blueprint.blueprint_items.map(item =>
        item.id === itemId ? { ...item, is_obtained: !item.is_obtained } : item
      ),
    })
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Loading blueprint...</div>
  }

  if (error || !blueprint) {
    return (
      <div className="py-12 text-center">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-muted-foreground">{error || "Blueprint not found"}</p>
        <Link href="/blueprint"><Button className="mt-4">Generate New Blueprint</Button></Link>
      </div>
    )
  }

  // Group items by category
  const grouped = blueprint.blueprint_items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, BlueprintItem[]>)

  const totalItems = blueprint.blueprint_items.length
  const obtainedItems = blueprint.blueprint_items.filter(i => i.is_obtained).length
  const progress = totalItems > 0 ? Math.round((obtainedItems / totalItems) * 100) : 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Blueprint</h1>
          <p className="text-muted-foreground">
            {blueprint.housing_type.replace("_", " ")} · Arriving {new Date(blueprint.arrival_date).toLocaleDateString()}
          </p>
        </div>
        <Link href="/blueprint/timeline">
          <Button variant="outline" size="sm">📅 Timeline</Button>
        </Link>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Progress</p>
            <p className="text-sm text-muted-foreground">{obtainedItems}/{totalItems} items</p>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemax={100}
              aria-label={`Blueprint progress: ${progress}%`}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{progress}% complete</p>
        </CardContent>
      </Card>

      {/* Climate Info */}
      {blueprint.climate_info && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3 font-semibold">🌡️ Climate Info</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <p className="text-lg font-bold text-red-600">{blueprint.climate_info.avg_high}°C</p>
                <p className="text-xs text-muted-foreground">Avg High</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-lg font-bold text-blue-600">{blueprint.climate_info.avg_low}°C</p>
                <p className="text-xs text-muted-foreground">Avg Low</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cultural Norms */}
      {blueprint.cultural_norms && blueprint.cultural_norms.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3 font-semibold">🌍 Cultural Norms</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {blueprint.cultural_norms.map((norm, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{norm}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Checklist by Category */}
      {Object.entries(grouped).map(([category, items]) => {
        const catInfo = categoryLabels[category] || { label: category, icon: "📦" }
        const catObtained = items.filter(i => i.is_obtained).length
        return (
          <Card key={category}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{catInfo.icon} {catInfo.label}</h3>
                <Badge variant="secondary">{catObtained}/{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      item.is_obtained ? "bg-emerald-50/50 border-emerald-200" : "hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.is_obtained}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                      aria-label={`Mark ${item.name} as ${item.is_obtained ? "needed" : "obtained"}`}
                    />
                    <div>
                      <p className={`font-medium text-sm ${item.is_obtained ? "line-through text-muted-foreground" : ""}`}>
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/matching" className="flex-1">
          <Button variant="outline" className="w-full">🔗 Find Matching Listings</Button>
        </Link>
        <Link href="/marketplace" className="flex-1">
          <Button variant="outline" className="w-full">🛍️ Browse Marketplace</Button>
        </Link>
      </div>
    </div>
  )
}
