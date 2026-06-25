"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Listing {
  id: string
  title: string
  price: number
  category: string
  condition: string
  photos: string[]
  created_at: string
  users?: { display_name: string; trust_score: number } | null
}

const conditions: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("")
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async (query?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query && query.length >= 2) params.set("query", query)
      
      const res = await fetch(`/api/listings?${params}`)
      const data = await res.json()
      if (data.data) setListings(data.data)
    } catch {
      console.error("Failed to fetch listings")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.length >= 2 || value.length === 0) {
      fetchListings(value)
    }
  }

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
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/marketplace/map">
          <Button variant="outline" size="sm">📍 Map View</Button>
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-12 text-center text-muted-foreground">
          <p className="animate-pulse">Loading listings...</p>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && listings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/marketplace/${listing.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-muted text-4xl">
                    {listing.category === "Electronics" ? "🖥️" :
                     listing.category === "Kitchen" ? "🍳" :
                     listing.category === "Clothing" ? "🧥" :
                     listing.category === "Furniture" ? "🪑" :
                     listing.category === "Transport" ? "🚲" :
                     listing.category === "Books" ? "📚" :
                     listing.category === "Bedding" ? "🛏️" : "📦"}
                  </div>
                  <h3 className="mb-1 font-medium leading-tight">{listing.title}</h3>
                  <p className="mb-2 text-xl font-bold text-primary">${listing.price}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{listing.category}</Badge>
                    <Badge variant="outline">{conditions[listing.condition] || listing.condition}</Badge>
                  </div>
                  {listing.users && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      {listing.users.display_name} · ⭐ {listing.users.trust_score}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="text-lg text-muted-foreground">No listings yet.</p>
          <p className="text-sm text-muted-foreground mb-4">Be the first to list an item!</p>
          <Link href="/marketplace/create">
            <Button>Create a Listing</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
