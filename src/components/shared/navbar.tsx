"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/blueprint", label: "Blueprint" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/matching", label: "Matches" },
  { href: "/chat", label: "Chat" },
  { href: "/deals", label: "Deals" },
  { href: "/tips", label: "Tips" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <span className="text-xs text-white">📦</span>
            </div>
            <span className="font-bold">MoveKit</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => {
                const isDark = document.documentElement.classList.toggle('dark')
                localStorage.setItem('theme', isDark ? 'dark' : 'light')
              }}
              className="p-2 rounded-md hover:bg-muted text-sm"
              aria-label="Toggle dark mode"
            >
              🌙
            </button>
            <Link href="/notifications" aria-label="Notifications">
              <Button variant="ghost" size="sm">🔔</Button>
            </Link>
            <Link href="/profile" aria-label="Profile">
              <Button variant="ghost" size="sm">👤</Button>
            </Link>
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Left Sidebar (desktop) */}
      <aside className="hidden md:flex fixed left-0 top-14 bottom-0 z-40 w-52 flex-col border-r bg-background px-3 py-4" aria-label="Main navigation">
        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              >
                {link.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="border-t pt-3 space-y-1">
          <Link href="/policies">
            <div className="flex items-center rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Policies
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile slide menu */}
      {mobileOpen && (
        <nav className="md:hidden fixed inset-0 top-14 z-40 bg-background px-4 py-4 space-y-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <div className={cn(
                "flex items-center rounded-xl px-4 py-3 text-sm transition-colors",
                pathname.startsWith(link.href) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
              )}>
                {link.label}
              </div>
            </Link>
          ))}
          <div className="border-t pt-3 mt-3 space-y-1">
            <Link href="/notifications" onClick={() => setMobileOpen(false)}>
              <div className="flex items-center rounded-xl px-4 py-3 text-sm hover:bg-muted">Notifications</div>
            </Link>
            <Link href="/profile" onClick={() => setMobileOpen(false)}>
              <div className="flex items-center rounded-xl px-4 py-3 text-sm hover:bg-muted">Profile</div>
            </Link>
            <Link href="/policies" onClick={() => setMobileOpen(false)}>
              <div className="flex items-center rounded-xl px-4 py-3 text-sm hover:bg-muted">Policies</div>
            </Link>
          </div>
        </nav>
      )}
    </>
  )
}
