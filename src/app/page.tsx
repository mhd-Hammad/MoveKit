"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm text-white font-bold">M</span>
            </div>
            <span className="text-lg font-bold">MoveKit</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gradient-primary border-0 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — Mercari-inspired: clean, big headline, clear value prop */}
        <section className="gradient-hero py-20 lg:py-28">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200 px-4 py-1.5 text-sm text-primary-700 mb-6">
                <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                Built for university students
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Your campus move,
                <br />
                <span className="gradient-text">sorted.</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                AI-powered relocation planning meets a verified student marketplace. 
                Get matched with outgoing students selling exactly what you need.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg" className="gradient-primary border-0 text-white px-8 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all">
                    Start free
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="px-8">
                    Browse marketplace
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust indicators — Airbnb-inspired */}
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { value: "Verified", label: "University students only" },
                { value: "AI-powered", label: "Personalized checklists" },
                { value: "< 25km", label: "Local matches" },
                { value: "Free", label: "No fees, ever" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-card border">
                  <p className="font-bold text-primary-700">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — Duolingo-inspired: step-by-step, rewarding */}
        <section className="py-16 border-t">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

                {[
                  { step: "1", title: "Verify your university email", desc: "Only real students get access. Quick OTP verification proves you belong.", color: "bg-primary-600" },
                  { step: "2", title: "Get your AI survival blueprint", desc: "Tell us where you're going, your housing type, and budget. AI generates a personalized packing list with climate and cultural tips.", color: "bg-primary-500" },
                  { step: "3", title: "Browse matched listings", desc: "Our algorithm finds items from nearby outgoing students that match your blueprint. Ranked by distance, price, and seller trust.", color: "bg-accent-500" },
                  { step: "4", title: "Deal, meet, done", desc: "Propose a deal, chat in-app, meet up, exchange cash for items. Both confirm — you earn trust badges.", color: "bg-accent-600" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 mb-8 last:mb-0">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.color} text-white font-bold text-lg shadow-md relative z-10`}>
                      {item.step}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features — Mercari card style */}
        <section className="py-16 bg-muted/30 border-t">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-center mb-2">Built for trust</h2>
            <p className="text-center text-muted-foreground mb-10">Every feature designed to make peer-to-peer safe and easy.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {[
                { title: "University verified", desc: "OTP email verification ensures only real students access the platform.", tag: "Identity" },
                { title: "GPS location check", desc: "Confirm sellers are actually near your campus before you deal.", tag: "Safety" },
                { title: "Trust scores", desc: "Every user earns reputation through verified deals and responsive behavior.", tag: "Trust" },
                { title: "Scam protection", desc: "Suspicious messages are blocked. Contact sharing is flagged. Cash only.", tag: "Safety" },
                { title: "Smart matching", desc: "AI matches your blueprint needs with nearby listings. Weighted by distance, price, and trust.", tag: "AI" },
                { title: "Deal badges", desc: "Complete deals to earn badges. Higher trust = higher ranking in search.", tag: "Gamification" },
              ].map((feature) => (
                <Card key={feature.title} className="border hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <CardContent className="pt-5 pb-5">
                    <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 mb-3">
                      {feature.tag}
                    </span>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof / CTA */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-xl mx-auto rounded-2xl gradient-primary p-10 text-center text-white shadow-xl">
              <h2 className="text-2xl font-bold">Ready to move smart?</h2>
              <p className="mt-2 text-primary-100 text-sm">
                Join verified students simplifying their university relocation.
              </p>
              <Link href="/register">
                <Button size="lg" className="mt-6 bg-white text-primary-700 hover:bg-primary-50 shadow-lg font-medium">
                  Create your account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded gradient-primary">
              <span className="text-[10px] text-white font-bold">M</span>
            </div>
            <span>MoveKit © 2026</span>
          </div>
          <div className="flex gap-4">
            <Link href="/policies" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/policies" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
