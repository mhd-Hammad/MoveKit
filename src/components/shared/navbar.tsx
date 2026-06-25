"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/blueprint", label: "Blueprint", icon: "📋" },
  { href: "/marketplace", label: "Marketplace", icon: "🛍️" },
  { href: "/matching", label: "Matches", icon: "🔗" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/deals", label: "Deals", icon: "🤝" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 sm:px-6">
        <Link href="/dashboard" className="mr-6 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
            <span className="text-xs text-white">📦</span>
          </div>
          <span className="font-bold hidden sm:inline">MoveKit</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                size="sm"
                className={cn("gap-1.5", pathname.startsWith(link.href) && "font-medium")}
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              >
                <span className="text-sm" aria-hidden="true">{link.icon}</span>
                <span>{link.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto mr-2 p-2 rounded-md hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

        {/* Desktop right icons */}
        <div className="hidden md:flex ml-auto items-center gap-2">
          <Link href="/notifications" aria-label="Notifications">
            <Button variant="ghost" size="sm">🔔</Button>
          </Link>
          <Link href="/profile" aria-label="Profile">
            <Button variant="ghost" size="sm">👤</Button>
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t bg-background px-4 py-3 space-y-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <div className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                pathname.startsWith(link.href) ? "bg-secondary font-medium" : "hover:bg-muted"
              )}>
                <span aria-hidden="true">{link.icon}</span>
                <span>{link.label}</span>
              </div>
            </Link>
          ))}
          <div className="border-t pt-2 mt-2 flex gap-2">
            <Link href="/notifications" onClick={() => setMobileOpen(false)} className="flex-1">
              <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
                <span>🔔</span> Notifications
              </div>
            </Link>
            <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex-1">
              <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
                <span>👤</span> Profile
              </div>
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
