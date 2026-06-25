"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Deal {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  status: string
  locked_price: number
  buyer_confirmed: boolean
  seller_confirmed: boolean
  created_at: string
  listings?: { id: string; title: string; price: number } | null
}

const statusConfig: Record<string, { label: string; color: string }> = {
  proposed: { label: "Proposed", color: "bg-amber-100 text-amber-800" },
  active: { label: "Active", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-600" },
  disputed: { label: "Disputed", color: "bg-orange-100 text-orange-800" },
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")
    if (user.id) {
      setUserId(user.id)
      fetchDeals(user.id)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchDeals = async (uid: string) => {
    try {
      const res = await fetch(`/api/deals?user_id=${uid}`)
      const data = await res.json()
      if (data.data) setDeals(data.data)
    } catch {
      console.error("Failed to fetch deals")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (dealId: string) => {
    const res = await fetch(`/api/deals/${dealId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
    const data = await res.json()
    if (res.ok) {
      alert(data.message)
      fetchDeals(userId)
    } else {
      alert(data.error)
    }
  }

  const handleAccept = async (dealId: string) => {
    const res = await fetch(`/api/deals/${dealId}/accept`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
    const data = await res.json()
    if (res.ok) {
      alert(data.message)
      fetchDeals(userId)
    } else {
      alert(data.error)
    }
  }

  const handleCancel = async (dealId: string) => {
    if (!confirm("Are you sure you want to cancel this deal? This will affect your trust score (-3 points).")) return
    const res = await fetch(`/api/deals/${dealId}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
    const data = await res.json()
    if (res.ok) {
      alert(data.message)
      fetchDeals(userId)
    } else {
      alert(data.error)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Loading deals...</div>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Deals</h1>
        <p className="text-muted-foreground">Track your transactions</p>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-3">🤝</p>
            <p className="text-lg text-muted-foreground">No deals yet.</p>
            <p className="text-sm text-muted-foreground mb-4">Browse the marketplace and propose a deal to get started.</p>
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => {
            const config = statusConfig[deal.status] || statusConfig.proposed
            const isBuyer = deal.buyer_id === userId
            return (
              <Card key={deal.id} className="transition-shadow hover:shadow-md">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{deal.listings?.title || "Listing"}</h3>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-primary">${deal.locked_price}</p>
                      <p className="text-xs text-muted-foreground">
                        {isBuyer ? "You are buying" : "You are selling"} · Created {new Date(deal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Active deal — confirmation */}
                  {deal.status === "active" && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium mb-2">Confirmation Status</p>
                      <div className="flex gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={deal.buyer_confirmed ? "text-emerald-600" : "text-muted-foreground"}>
                            {deal.buyer_confirmed ? "✅" : "⏳"}
                          </span>
                          Buyer {deal.buyer_confirmed ? "confirmed" : "pending"}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={deal.seller_confirmed ? "text-emerald-600" : "text-muted-foreground"}>
                            {deal.seller_confirmed ? "✅" : "⏳"}
                          </span>
                          Seller {deal.seller_confirmed ? "confirmed" : "pending"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {((isBuyer && !deal.buyer_confirmed) || (!isBuyer && !deal.seller_confirmed)) && (
                          <Button size="sm" className="gradient-primary border-0 text-white" onClick={() => handleConfirm(deal.id)}>
                            Confirm Exchange ✓
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleCancel(deal.id)}>
                          Cancel Deal
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Proposed — seller can accept */}
                  {deal.status === "proposed" && !isBuyer && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="gradient-primary border-0 text-white" onClick={() => handleAccept(deal.id)}>
                        Accept Deal
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleCancel(deal.id)}>
                        Reject
                      </Button>
                    </div>
                  )}

                  {deal.status === "proposed" && isBuyer && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      ⏳ Waiting for seller to accept your proposal...
                    </div>
                  )}

                  {deal.status === "completed" && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="default">🏅 Deal Badge Earned</Badge>
                      <span className="text-xs text-emerald-600">+5 trust</span>
                    </div>
                  )}

                  {deal.status === "cancelled" && (
                    <div className="mt-3 text-xs text-destructive">
                      Deal was cancelled. -3 trust score applied.
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
