"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog"
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

  const [confirmDialog, setConfirmDialog] = useState<{ type: string; dealId: string } | null>(null)
  const [actionLoading, setActionLoading] = useState("")

  const handleConfirm = async (dealId: string) => {
    setActionLoading(dealId)
    const res = await fetch(`/api/deals/${dealId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
    const data = await res.json()
    setActionLoading("")
    setConfirmDialog(null)
    if (res.ok) fetchDeals(userId)
  }

  const handleAccept = async (dealId: string) => {
    setActionLoading(dealId)
    const res = await fetch(`/api/deals/${dealId}/accept`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
    setActionLoading("")
    setConfirmDialog(null)
    if (res.ok) fetchDeals(userId)
  }

  const handleCancel = async (dealId: string) => {
    setActionLoading(dealId)
    const res = await fetch(`/api/deals/${dealId}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
    setActionLoading("")
    setConfirmDialog(null)
    if (res.ok) fetchDeals(userId)
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
                          <Button size="sm" className="gradient-primary border-0 text-white" onClick={() => setConfirmDialog({ type: "confirm", dealId: deal.id })} disabled={actionLoading === deal.id}>
                            {actionLoading === deal.id ? "..." : "Confirm Exchange ✓"}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ type: "cancel", dealId: deal.id })} disabled={actionLoading === deal.id}>
                          Cancel Deal
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Proposed — seller can accept */}
                  {deal.status === "proposed" && !isBuyer && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="gradient-primary border-0 text-white" onClick={() => setConfirmDialog({ type: "accept", dealId: deal.id })} disabled={actionLoading === deal.id}>
                        Accept Deal
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ type: "cancel", dealId: deal.id })} disabled={actionLoading === deal.id}>
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
      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)}>
        <DialogHeader>
          <DialogTitle>
            {confirmDialog?.type === "confirm" && "Confirm Exchange"}
            {confirmDialog?.type === "accept" && "Accept Deal"}
            {confirmDialog?.type === "cancel" && "Cancel Deal"}
          </DialogTitle>
          <DialogDescription>
            {confirmDialog?.type === "confirm" && "Confirm that you've completed the exchange. Both parties must confirm for the deal to be marked complete. You'll earn +5 trust and a deal badge."}
            {confirmDialog?.type === "accept" && "Accept this deal proposal. The listing will be reserved and the price will be locked. You can still cancel later (with a -3 trust penalty)."}
            {confirmDialog?.type === "cancel" && "Are you sure? Cancelling a deal will deduct 3 points from your trust score and return the listing to active."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDialog(null)}>
            Go Back
          </Button>
          <Button
            variant={confirmDialog?.type === "cancel" ? "destructive" : "default"}
            className={confirmDialog?.type !== "cancel" ? "gradient-primary border-0 text-white" : ""}
            onClick={() => {
              if (!confirmDialog) return
              if (confirmDialog.type === "confirm") handleConfirm(confirmDialog.dealId)
              if (confirmDialog.type === "accept") handleAccept(confirmDialog.dealId)
              if (confirmDialog.type === "cancel") handleCancel(confirmDialog.dealId)
            }}
            disabled={!!actionLoading}
          >
            {actionLoading ? "Processing..." : confirmDialog?.type === "cancel" ? "Yes, Cancel Deal" : "Confirm"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
