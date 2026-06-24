"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: "🎓",
    title: "University Verified",
    description: "Only verified students can access the platform. Trust starts with identity.",
  },
  {
    icon: "🤖",
    title: "AI Survival Blueprint",
    description: "Get a personalized packing list and task plan based on your destination, housing, and budget.",
  },
  {
    icon: "🔗",
    title: "Smart Matching",
    description: "Automatically matched with outgoing students selling exactly what you need, nearby.",
  },
  {
    icon: "🛡️",
    title: "Trust & Safety",
    description: "Reputation scores, deal badges, and in-app communication keep every transaction safe.",
  },
  {
    icon: "💬",
    title: "Real-time Chat",
    description: "Negotiate, plan meetups, and confirm deals — all within the platform.",
  },
  {
    icon: "📍",
    title: "Location Verified",
    description: "GPS verification ensures sellers are actually near your campus.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <span className="text-xl font-bold">MoveKit</span>
          </div>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            Built for the Youth Code × AI Hackathon
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Relocating to University?
            <br />
            <span className="text-primary">We've Got Your Kit.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            MoveKit connects incoming students with outgoing students selling exactly what they need. 
            AI-powered planning. Verified trust. Zero guesswork.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Start Your Blueprint</Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="lg">Browse Marketplace</Button>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t bg-muted/50 py-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 font-semibold">Verify & Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up with your university email, verify your location, and get an AI-generated survival blueprint.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground">
                  2
                </div>
                <h3 className="mb-2 font-semibold">Match & Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Get matched with nearby outgoing students selling items from your checklist. Chat securely in-app.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 font-semibold">Deal & Settle</h3>
                <p className="text-sm text-muted-foreground">
                  Lock in deals, meet up, confirm the exchange. Both earn trust badges. Welcome to campus.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-3xl font-bold">Platform Features</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="mb-3 text-3xl">{feature.icon}</div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/50 py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Move Smart?</h2>
            <p className="mb-8 text-muted-foreground">
              Join verified students already using MoveKit to simplify their relocation.
            </p>
            <Link href="/login">
              <Button size="lg">Verify Your University Email</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 MoveKit — Campus Relocation Network</p>
          <p className="mt-1">Built with Next.js, Supabase, Groq AI & ❤️</p>
        </div>
      </footer>
    </div>
  )
}
