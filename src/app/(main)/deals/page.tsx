"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const mockDeals = [
  {
    id: "1",
    listing_title: "Complete Kitchen Starter Bundle",
    price: 55,
    status: "active",
    role: "buyer",
    other_party: "Sarah M.",
    buyer_confirmed: false,
    seller_confirmed: false,
    created_at: "2026-06-23",
  },
  {
    id: "2",
    listing_title: "Universal Power Adapter",
    price: 15,
    status: "completed",
    role: "buyer",
    other_party: "Tom W.",
    buyer_confirmed: true,
    seller_confirmed: true,
    created_at: "2026-06-20",
  },
  {
    id: "3",
    listing_title: "IKEA Desk Lamp + USB Hub",
    price: 25,
    status: "proposed",
    role: "seller",
    other_party: "Priya D.",
    buyer_confirmed: false,
    seller_confirmed: false,
    created_at: "2026-06-24",
  },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  proposed: { label: "Proposed", color: "bg-amber-100 text-amber-800" },
  active: { label: "Active", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-600" },
  disputed: { label: "Disputed", color: "bg-orange-100 text-orange-800" },
}

export default function DealsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Deals</h1>
        <p className="text-muted-foreground">Track your transactions</p>
      </div>

      {mockDeals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">🤝</p>
            <p className="text-muted-foreground">No deals yet.</p>
            <p className="text-sm text-muted-foreground">Propose a deal from a listing to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mockDeals.map((deal) => {
            const config = statusConfig[deal.status] || statusConfig.proposed
            return (
              <Card key={deal.id} className="transition-shadow hover:shadow-md">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{deal.listing_title}</h3>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-primary">${deal.price}</p>
                      <p className="text-xs text-muted-foreground">
                        {deal.role === "buyer" ? "Buying from" : "Selling to"} <span className="font-medium">{deal.other_party}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{deal.created_at}</p>
                    </div>
                  </div>

                  {/* Confirmation Progress */}
                  {deal.status === "active" && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium mb-2">Confirmation Status</p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={deal.buyer_confirmed ? "text-emerald-600" : "text-muted-foreground"}>
                            {deal.buyer_confirmed ? "✅" : "⏳"}
                          </span>
                          Buyer
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={deal.seller_confirmed ? "text-emerald-600" : "text-muted-foreground"}>
                            {deal.seller_confirmed ? "✅" : "⏳"}
                          </span>
                          Seller
                        </div>
                      </div>
                      <Button size="sm" className="mt-3 gradient-primary border-0 text-white">
                        Confirm Exchange ✓
                      </Button>
                    </div>
                  )}

                  {deal.status === "proposed" && deal.role === "seller" && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="gradient-primary border-0 text-white">Accept</Button>
                      <Button size="sm" variant="outline">Reject</Button>
                    </div>
                  )}

                  {deal.status === "completed" && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="default">🏅 Deal Badge Earned</Badge>
                      <span className="text-xs text-emerald-600">+5 trust</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
