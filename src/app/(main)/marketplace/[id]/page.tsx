"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ListingDetail {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  status: string
  photos: string[]
  created_at: string
  seller_id: string
  users?: {
    id: string
    display_name: string
    trust_score: number
    email_verified: boolean
    location_verified: boolean
  } | null
}

const conditionLabels: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
}

const categoryIcons: Record<string, string> = {
  Electronics: "🖥️",
  Kitchen: "🍳",
  Clothing: "🧥",
  Furniture: "🪑",
  Transport: "🚲",
  Books: "📚",
  Bedding: "🛏️",
  Decor: "🎨",
  Sports: "⚽",
  Other: "📦",
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [proposing, setProposing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/listings/${params.id}`)
        .then(r => r.json())
        .then(data => { if (data.id) setListing(data) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [params.id])

  const handleContactSeller = async () => {
    if (!listing) return
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    if (!user.id) { router.push("/login"); return }
    if (user.id === listing.seller_id) { alert("This is your own listing"); return }

    // Create or get existing chat session
    const res = await fetch("/api/chat/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyer_id: user.id,
        seller_id: listing.seller_id,
        listing_id: listing.id,
      }),
    })
    const session = await res.json()
    if (session.id) {
      router.push(`/chat/${session.id}`)
    }
  }

  const handleProposeDeal = async () => {
    if (!listing) return
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    if (!user.id) { router.push("/login"); return }
    if (user.id === listing.seller_id) { alert("Cannot buy your own listing"); return }

    if (!confirm(`Propose a deal for "${listing.title}" at $${listing.price}?`)) return

    setProposing(true)
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_id: listing.id,
        buyer_id: user.id,
        price: listing.price,
        items: { title: listing.title },
      }),
    })
    const data = await res.json()
    setProposing(false)

    if (res.ok) {
      alert("Deal proposed! The seller will be notified.")
      router.push("/deals")
    } else {
      alert(data.error || "Failed to propose deal")
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Loading listing...</div>
  }

  if (!listing) {
    return (
      <div className="py-12 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-muted-foreground">Listing not found.</p>
        <Link href="/marketplace"><Button className="mt-4">Back to Marketplace</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        ← Back to Marketplace
      </Link>

      {/* Photo */}
      <Card className="overflow-hidden">
        <div className="flex h-64 items-center justify-center bg-muted text-7xl">
          {categoryIcons[listing.category] || "📦"}
        </div>
      </Card>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{listing.category}</Badge>
              <Badge variant="outline">{conditionLabels[listing.condition] || listing.condition}</Badge>
              <Badge variant={listing.status === "active" ? "default" : "secondary"}>{listing.status}</Badge>
            </div>
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="mt-1 text-3xl font-bold text-primary">${listing.price}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {listing.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Condition</p>
                  <p className="font-medium">{conditionLabels[listing.condition]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{listing.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{listing.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Listed</p>
                  <p className="font-medium">{new Date(listing.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seller Card + Actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Seller</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {listing.users?.display_name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-medium">{listing.users?.display_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    ⭐ Trust: {listing.users?.trust_score || 0}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {listing.users?.email_verified && (
                  <Badge variant="secondary" className="text-xs">✓ Email</Badge>
                )}
                {listing.users?.location_verified && (
                  <Badge variant="secondary" className="text-xs">✓ Location</Badge>
                )}
              </div>
              <Button
                className="w-full gradient-primary border-0 text-white"
                onClick={handleContactSeller}
                disabled={listing.status !== "active"}
              >
                💬 Contact Seller
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                variant="outline"
                className="w-full mb-2"
                onClick={handleProposeDeal}
                disabled={listing.status !== "active" || proposing}
              >
                {proposing ? "Proposing..." : "🤝 Propose Deal"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Lock in the price for a secure transaction
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
