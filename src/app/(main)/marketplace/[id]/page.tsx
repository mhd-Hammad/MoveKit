"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// For now using mock data — will be dynamic when DB has listings
const mockListing = {
  id: "1",
  title: "IKEA Desk Lamp + USB Hub",
  description: "Great condition IKEA desk lamp with integrated USB hub. Used for one semester, works perfectly. Warm white light with adjustable brightness. USB hub has 4 ports (USB-A). Includes original box and instructions.",
  price: 25,
  category: "Electronics",
  condition: "like_new",
  photos: ["🖥️"],
  seller: {
    display_name: "Alex K.",
    trust_score: 35,
    email_verified: true,
    location_verified: true,
    completed_deals: 3,
  },
  campus: "MIT Main Campus",
  created_at: "2026-06-20",
}

export default function ListingDetailPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <Link href="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        ← Back to Marketplace
      </Link>

      {/* Photo */}
      <Card className="overflow-hidden">
        <div className="flex h-64 items-center justify-center bg-muted text-7xl">
          {mockListing.photos[0]}
        </div>
      </Card>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{mockListing.category}</Badge>
              <Badge variant="outline">{mockListing.condition.replace("_", " ")}</Badge>
            </div>
            <h1 className="text-2xl font-bold">{mockListing.title}</h1>
            <p className="mt-1 text-3xl font-bold text-primary">${mockListing.price}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mockListing.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Condition</p>
                  <p className="font-medium capitalize">{mockListing.condition.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{mockListing.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{mockListing.campus}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Listed</p>
                  <p className="font-medium">{mockListing.created_at}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seller Card */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Seller</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {mockListing.seller.display_name[0]}
                </div>
                <div>
                  <p className="font-medium">{mockListing.seller.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    ⭐ Trust Score: {mockListing.seller.trust_score}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mockListing.seller.email_verified && (
                  <Badge variant="secondary" className="text-xs">✓ Email</Badge>
                )}
                {mockListing.seller.location_verified && (
                  <Badge variant="secondary" className="text-xs">✓ Location</Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {mockListing.seller.completed_deals} deals
                </Badge>
              </div>
              <Button className="w-full gradient-primary border-0 text-white">
                💬 Contact Seller
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button variant="outline" className="w-full mb-2">
                🤝 Propose Deal
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Lock in the price and items for a secure transaction
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
