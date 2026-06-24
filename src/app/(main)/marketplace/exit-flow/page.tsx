"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface BundleItem {
  id: string
  name: string
  category: string
}

interface Bundle {
  id: string
  title: string
  items: BundleItem[]
  price: string
}

const suggestedBundles = [
  { title: "Kitchen Bundle", categories: ["Kitchen"], icon: "🍳" },
  { title: "Electronics Bundle", categories: ["Electronics"], icon: "🔌" },
  { title: "Furniture Bundle", categories: ["Furniture"], icon: "🪑" },
  { title: "Bedroom Bundle", categories: ["Bedding", "Decor"], icon: "🛏️" },
]

export default function ExitFlowPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [currentBundle, setCurrentBundle] = useState<Bundle>({
    id: "1",
    title: "",
    items: [],
    price: "",
  })
  const [newItem, setNewItem] = useState("")
  const [step, setStep] = useState<"create" | "review">("create")

  const addItem = () => {
    if (!newItem.trim()) return
    setCurrentBundle({
      ...currentBundle,
      items: [...currentBundle.items, { id: Date.now().toString(), name: newItem, category: "Other" }],
    })
    setNewItem("")
  }

  const addBundle = () => {
    if (!currentBundle.title || currentBundle.items.length < 2 || !currentBundle.price) return
    setBundles([...bundles, { ...currentBundle, id: Date.now().toString() }])
    setCurrentBundle({ id: "", title: "", items: [], price: "" })
  }

  const startFromSuggestion = (suggestion: typeof suggestedBundles[0]) => {
    setCurrentBundle({
      ...currentBundle,
      title: suggestion.title,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exit Flow</h1>
        <p className="text-muted-foreground">
          Graduating? Bulk-list your belongings as bundles before you leave.
        </p>
      </div>

      {step === "create" && (
        <>
          {/* Suggested Bundles */}
          {currentBundle.title === "" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Start</CardTitle>
                <CardDescription>Start with a suggested bundle or create your own</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {suggestedBundles.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      onClick={() => startFromSuggestion(suggestion)}
                      className="rounded-lg border p-4 text-left transition-colors hover:bg-muted hover:border-primary/20"
                    >
                      <span className="text-2xl">{suggestion.icon}</span>
                      <p className="mt-2 text-sm font-medium">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.categories.join(", ")}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Bundle Builder */}
          <Card className="border-0 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle className="text-lg">
                {bundles.length > 0 ? `Bundle #${bundles.length + 1}` : "Create Bundle"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Bundle Title</label>
                <Input
                  value={currentBundle.title}
                  onChange={(e) => setCurrentBundle({ ...currentBundle, title: e.target.value })}
                  placeholder="e.g., Kitchen Essentials Bundle"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Items (min 2)</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add an item..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
                  />
                  <Button type="button" onClick={addItem} variant="outline">Add</Button>
                </div>
                {currentBundle.items.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {currentBundle.items.map((item) => (
                      <Badge key={item.id} variant="secondary" className="gap-1">
                        {item.name}
                        <button
                          onClick={() =>
                            setCurrentBundle({
                              ...currentBundle,
                              items: currentBundle.items.filter((i) => i.id !== item.id),
                            })
                          }
                          className="ml-0.5 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Bundle Price (USD)</label>
                <Input
                  type="number"
                  value={currentBundle.price}
                  onChange={(e) => setCurrentBundle({ ...currentBundle, price: e.target.value })}
                  placeholder="0.00"
                  min={0.01}
                />
              </div>

              <Button
                onClick={addBundle}
                className="w-full"
                disabled={!currentBundle.title || currentBundle.items.length < 2 || !currentBundle.price}
              >
                Add Bundle ({currentBundle.items.length} items)
              </Button>
            </CardContent>
          </Card>

          {/* Created Bundles */}
          {bundles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Bundles Ready ({bundles.length})</h3>
              {bundles.map((bundle) => (
                <Card key={bundle.id}>
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bundle.title}</p>
                      <p className="text-xs text-muted-foreground">{bundle.items.length} items</p>
                    </div>
                    <p className="font-bold text-primary">${bundle.price}</p>
                  </CardContent>
                </Card>
              ))}
              <Button
                onClick={() => setStep("review")}
                className="w-full gradient-primary border-0 text-white"
              >
                Review & Publish All ({bundles.length} bundles)
              </Button>
            </div>
          )}
        </>
      )}

      {step === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Publish</CardTitle>
            <CardDescription>
              All {bundles.length} bundles will be published simultaneously.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="rounded-lg border p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">{bundle.title}</p>
                  <p className="font-bold text-primary">${bundle.price}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {bundle.items.map((item) => (
                    <Badge key={item.id} variant="outline" className="text-xs">{item.name}</Badge>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("create")} className="flex-1">
                ← Back to Edit
              </Button>
              <Button className="flex-1 gradient-primary border-0 text-white">
                Publish All Bundles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
