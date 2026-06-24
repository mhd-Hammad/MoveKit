"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back 👋</h1>
        <p className="text-muted-foreground">
          Here&apos;s your relocation overview.
        </p>
      </div>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification Status</CardTitle>
          <CardDescription>Complete all steps to unlock full platform access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">✓ Email Verified</Badge>
            <Badge variant="outline">⏳ Location Not Verified</Badge>
            <Badge variant="outline">⏳ No Document Badge</Badge>
          </div>
          <div className="mt-4">
            <Link href="/verify-location">
              <Button size="sm" variant="outline">Verify Location</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>🤖</span> AI Blueprint
            </CardTitle>
            <CardDescription>
              Generate your personalized survival kit for relocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/blueprint">
              <Button className="w-full">Create Blueprint</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>🛍️</span> Marketplace
            </CardTitle>
            <CardDescription>
              Browse items from outgoing students near your campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/marketplace">
              <Button variant="outline" className="w-full">Browse Listings</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>🔗</span> Matches
            </CardTitle>
            <CardDescription>
              See items matched to your blueprint checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/matching">
              <Button variant="outline" className="w-full">View Matches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Trust Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Trust Score</CardTitle>
          <CardDescription>
            Build trust by completing deals, verifying identity, and being responsive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              20
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Identity Trust: <span className="font-medium text-foreground">20 pts</span> (email verified)</p>
              <p>Location Trust: <span className="font-medium text-foreground">0 pts</span></p>
              <p>Behavior Trust: <span className="font-medium text-foreground">0 pts</span></p>
              <p className="mt-1">
                <Badge variant="secondary">New User</Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
