"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const mockListings = [
  {
    id: "1",
    title: "IKEA Desk Lamp + USB Hub",
    price: 25,
    category: "Electronics",
    condition: "like_new",
    seller: "Alex K.",
    trust_score: 35,
    campus: "MIT Campus",
    photo: "🖥️",
  },
  {
    id: "2",
    title: "Complete Kitchen Starter Bundle",
    price: 60,
    category: "Kitchen",
    condition: "good",
    seller: "Sarah M.",
    trust_score: 50,
    campus: "MIT Campus",
    photo: "🍳",
  },
  {
    id: "3",
    title: "Winter Jacket + Boots (Size M)",
    price: 80,
    category: "Clothing",
    condition: "good",
    seller: "James R.",
    trust_score: 28,
    campus: "MIT Campus",
    photo: "🧥",
  },
  {
    id: "4",
    title: "Bedding Set (Queen) - Like New",
    price: 45,
    category: "Housing",
    condition: "like_new",
    seller: "Priya D.",
    trust_score: 42,
    campus: "MIT Campus",
    photo: "🛏️",
  },
  {
    id: "5",
    title: "Universal Power Adapter (UK/EU/US)",
    price: 15,
    category: "Electronics",
    condition: "new",
    seller: "Tom W.",
    trust_score: 30,
    campus: "MIT Campus",
    photo: "🔌",
  },
  {
    id: "6",
    title: "Bicycle (Hybrid, good condition)",
    price: 120,
    category: "Transport",
    condition: "fair",
    seller: "Chen L.",
    trust_score: 55,
    campus: "MIT Campus",
    photo: "🚲",
  },
]

const conditions: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("")

  const filtered = mockListings.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Items from verified outgoing students near your campus
          </p>
        </div>
        <Link href="/marketplace/create">
          <Button>+ List Item</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="sm">Filter</Button>
        <Link href="/marketplace/map">
          <Button variant="outline" size="sm">📍 Map View</Button>
        </Link>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((listing) => (
          <Link key={listing.id} href={`/marketplace/${listing.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-muted text-4xl">
                  {listing.photo}
                </div>
                <h3 className="mb-1 font-medium leading-tight">{listing.title}</h3>
                <p className="mb-2 text-xl font-bold text-primary">${listing.price}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{listing.category}</Badge>
                  <Badge variant="outline">{conditions[listing.condition]}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{listing.seller} · ⭐ {listing.trust_score}</span>
                  <span>📍 {listing.campus}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg">No listings match your search.</p>
          <p className="text-sm">Try a different query or browse all items.</p>
        </div>
      )}
    </div>
  )
}
