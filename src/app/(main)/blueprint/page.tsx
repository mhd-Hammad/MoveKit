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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    // TODO: Call POST /api/blueprint/generate
    await new Promise((r) => setTimeout(r, 2000))
    setIsGenerating(false)
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
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-3 font-semibold">What you&apos;ll get:</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Badge variant="secondary">🌡️</Badge> Climate kit based on your arrival month
            </p>
            <p className="flex items-center gap-2">
              <Badge variant="secondary">🏠</Badge> Housing essentials for your accommodation type
            </p>
            <p className="flex items-center gap-2">
              <Badge variant="secondary">🔌</Badge> Electronics and adapters for your country
            </p>
            <p className="flex items-center gap-2">
              <Badge variant="secondary">🍳</Badge> Kitchen essentials checklist
            </p>
            <p className="flex items-center gap-2">
              <Badge variant="secondary">📝</Badge> Local setup tasks (bank, SIM, transport)
            </p>
            <p className="flex items-center gap-2">
              <Badge variant="secondary">🌍</Badge> Cultural norms and tips
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
