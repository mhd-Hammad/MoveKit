"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const housingOptions = [
  { value: "dormitory", label: "Dormitory", icon: "🏢" },
  { value: "shared_apartment", label: "Shared Apartment", icon: "🏠" },
  { value: "studio_apartment", label: "Studio Apartment", icon: "🏡" },
  { value: "homestay", label: "Homestay", icon: "👨‍👩‍👧" },
]

export default function BlueprintPage() {
  const [housing, setHousing] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [arrivalDate, setArrivalDate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [blueprint, setBlueprint] = useState<{
    categories: { category: string; items: { name: string; description?: string }[] }[]
    climate_info?: { avg_high: number; avg_low: number; precipitation_mm: number; season: string } | null
    cultural_norms?: string[] | null
    fallback?: boolean
  } | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    try {
      const res = await fetch("/api/blueprint/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university_campus_id: null,
          housing_type: housing,
          budget_min: Number(budgetMin),
          budget_max: Number(budgetMax),
          arrival_date: arrivalDate,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setBlueprint(data)
      }
    } catch (err) {
      console.error("Blueprint generation failed:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Survival Blueprint</h1>
        <p className="text-muted-foreground">
          Tell us about your relocation and our AI will generate a personalized packing list and task plan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Your Blueprint</CardTitle>
          <CardDescription>
            Powered by AI — tailored to your destination&apos;s climate, culture, and your housing type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Housing Type */}
            <div>
              <label className="mb-2 block text-sm font-medium">Housing Type</label>
              <div className="grid grid-cols-2 gap-3">
                {housingOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setHousing(option.value)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                      housing === option.value
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <span className="text-lg">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="mb-2 block text-sm font-medium">Budget Range (USD)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  min={0}
                  max={50000}
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  min={0}
                  max={50000}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </div>
            </div>

            {/* Arrival Date */}
            <div>
              <label className="mb-2 block text-sm font-medium">Arrival Date</label>
              <Input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Generate Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!housing || !budgetMin || !budgetMax || !arrivalDate || isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Generating with AI...
                </span>
              ) : (
                "Generate My Blueprint"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info */}
      {!blueprint && (
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-3 font-semibold">What you&apos;ll get:</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🌡️</Badge> Climate kit based on your arrival month
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🏠</Badge> Housing essentials for your accommodation type
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🔌</Badge> Electronics and adapters for your country
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🍳</Badge> Kitchen essentials checklist
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">📝</Badge> Local setup tasks (bank, SIM, transport)
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🌍</Badge> Cultural norms and tips
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Blueprint Results */}
      {blueprint && (
        <div className="space-y-4">
          {blueprint.fallback && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              ⚠️ AI was unavailable — showing a template blueprint. You can still customize it.
            </div>
          )}

          {blueprint.climate_info && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 font-semibold flex items-center gap-2">🌡️ Climate Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-red-50 p-3 text-center">
                    <p className="text-lg font-bold text-red-600">{blueprint.climate_info.avg_high}°C</p>
                    <p className="text-xs text-muted-foreground">Avg High</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 text-center">
                    <p className="text-lg font-bold text-blue-600">{blueprint.climate_info.avg_low}°C</p>
                    <p className="text-xs text-muted-foreground">Avg Low</p>
                  </div>
                  <div className="rounded-lg bg-cyan-50 p-3 text-center">
                    <p className="text-lg font-bold text-cyan-600">{blueprint.climate_info.precipitation_mm}mm</p>
                    <p className="text-xs text-muted-foreground">Precipitation</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3 text-center">
                    <p className="text-sm font-medium text-amber-700">{blueprint.climate_info.season}</p>
                    <p className="text-xs text-muted-foreground">Season</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {blueprint.cultural_norms && blueprint.cultural_norms.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 font-semibold flex items-center gap-2">🌍 Cultural Norms</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {blueprint.cultural_norms.map((norm, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{norm}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {blueprint.categories.map((cat) => (
            <Card key={cat.category}>
              <CardContent className="pt-6">
                <h3 className="mb-3 font-semibold capitalize">
                  {cat.category.replace(/_/g, " ")}
                </h3>
                <div className="space-y-2">
                  {cat.items.map((item, i) => (
                    <label key={i} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
