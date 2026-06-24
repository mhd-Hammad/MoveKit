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
    color: "bg-blue-50 border-blue-100",
  },
  {
    icon: "🤖",
    title: "AI Survival Blueprint",
    description: "Get a personalized packing list and task plan powered by AI for your destination.",
    color: "bg-violet-50 border-violet-100",
  },
  {
    icon: "🔗",
    title: "Smart Matching",
    description: "Automatically matched with outgoing students selling exactly what you need.",
    color: "bg-emerald-50 border-emerald-100",
  },
  {
    icon: "🛡️",
    title: "Trust & Safety",
    description: "Reputation scores, deal badges, and controlled communication keep transactions safe.",
    color: "bg-amber-50 border-amber-100",
  },
  {
    icon: "💬",
    title: "Real-time Chat",
    description: "Negotiate, plan meetups, and confirm deals — all within the platform.",
    color: "bg-pink-50 border-pink-100",
  },
  {
    icon: "📍",
    title: "Location Verified",
    description: "GPS verification ensures sellers are actually near your campus.",
    color: "bg-cyan-50 border-cyan-100",
  },
]

const stats = [
  { value: "9,000+", label: "Universities Supported" },
  { value: "100%", label: "Free to Use" },
  { value: "< 15s", label: "AI Blueprint Generation" },
  { value: "25km", label: "Match Radius" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm text-white">📦</span>
            </div>
            <span className="text-lg font-bold">MoveKit</span>
          </div>
          <Link href="/login">
            <Button size="sm">Get Started →</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="gradient-hero py-24 lg:py-32">
          <div className="container mx-auto px-6 text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              🏆 Built for Youth Code × AI Hackathon
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Relocating to University?
              <br />
              <span className="gradient-text">We&apos;ve Got Your Kit.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              MoveKit is an AI-powered platform that connects incoming students with outgoing students 
              selling exactly what they need. Verified trust. Smart matching. Zero guesswork.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="gradient-primary border-0 px-8 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                  Start Your Blueprint
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg" className="px-8">
                  Browse Marketplace
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border bg-card p-4 shadow-sm">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t py-20">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">How It Works</Badge>
              <h2 className="text-3xl font-bold">Three steps to a smooth move</h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                { step: "1", title: "Verify & Plan", desc: "Sign up with your university email, verify your location, and get an AI-generated survival blueprint tailored to your destination.", icon: "🎯" },
                { step: "2", title: "Match & Connect", desc: "Get matched with nearby outgoing students selling items from your checklist. Chat securely in-app to negotiate.", icon: "🤝" },
                { step: "3", title: "Deal & Settle", desc: "Lock in deals, meet up, confirm exchanges. Both parties earn trust badges. Welcome to campus!", icon: "✨" },
              ].map((item) => (
                <div key={item.step} className="relative rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
                  <div className="absolute -top-4 left-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl">{item.icon}</span>
                    <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl font-bold">Everything you need to relocate smart</h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className={`border ${feature.color} transition-all hover:shadow-md hover:-translate-y-0.5`}>
                  <CardContent className="pt-6">
                    <div className="mb-3 text-3xl">{feature.icon}</div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-2xl rounded-2xl gradient-primary p-12 text-center text-white shadow-xl shadow-blue-500/20">
              <h2 className="text-3xl font-bold">Ready to Move Smart?</h2>
              <p className="mt-3 text-blue-100">
                Join verified students already using MoveKit to simplify their relocation.
              </p>
              <Link href="/login">
                <Button size="lg" className="mt-8 bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
                  Verify Your University Email →
                </Button>
              </Link>
            </div>
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
