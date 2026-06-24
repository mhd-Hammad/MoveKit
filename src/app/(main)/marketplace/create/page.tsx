"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const categories = [
  "Electronics", "Furniture", "Kitchen", "Clothing", "Books",
  "Transport", "Bedding", "Decor", "Sports", "Other",
]

const conditions = [
  { value: "new", label: "New", desc: "Never used, tags still on" },
  { value: "like_new", label: "Like New", desc: "Used once or twice, perfect condition" },
  { value: "good", label: "Good", desc: "Regular use, works perfectly" },
  { value: "fair", label: "Fair", desc: "Shows wear, still functional" },
]

export default function CreateListingPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // TODO: Call POST /api/listings when wired up
    await new Promise((r) => setTimeout(r, 1500))
    setIsSubmitting(false)
    router.push("/marketplace")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">List an Item</h1>
        <p className="text-muted-foreground">
          Sell items to incoming students who need them.
        </p>
      </div>

      <Card className="border-0 shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Be descriptive — better listings get matched faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">Title</label>
              <Input
                placeholder="e.g., IKEA Desk Lamp + USB Hub"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                className="h-11"
              />
              <p className="mt-1 text-xs text-muted-foreground">{title.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">Description</label>
              <textarea
                placeholder="Describe the item, its condition, what's included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                required
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">{description.length}/2000</p>
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-medium">Price (USD)</label>
              <Input
                type="number"
                placeholder="0.00"
                min={0.01}
                max={999999.99}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                      category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="mb-2 block text-sm font-medium">Condition</label>
              <div className="grid grid-cols-2 gap-3">
                {conditions.map((cond) => (
                  <button
                    key={cond.value}
                    type="button"
                    onClick={() => setCondition(cond.value)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      condition === cond.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-medium">{cond.label}</p>
                    <p className="text-xs text-muted-foreground">{cond.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Photos placeholder */}
            <div>
              <label className="mb-2 block text-sm font-medium">Photos</label>
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                <div className="text-center text-sm text-muted-foreground">
                  <p className="text-2xl mb-1">📷</p>
                  <p>Photo upload coming soon</p>
                  <p className="text-xs">1-10 photos, JPEG/PNG, max 5MB each</p>
                </div>
              </div>
            </div>

            {/* Preview */}
            {title && price && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <p className="font-medium">{title}</p>
                <p className="text-lg font-bold text-primary">${price}</p>
                <div className="flex gap-1.5 mt-1">
                  {category && <Badge variant="secondary">{category}</Badge>}
                  {condition && <Badge variant="outline">{conditions.find(c => c.value === condition)?.label}</Badge>}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 gradient-primary border-0 text-white"
              disabled={!title || !description || !price || !category || !condition || isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
