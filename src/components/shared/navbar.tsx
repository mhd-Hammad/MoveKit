"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/blueprint", label: "Blueprint", icon: "📋" },
  { href: "/marketplace", label: "Marketplace", icon: "🛍️" },
  { href: "/matching", label: "Matches", icon: "🔗" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-6">
        <Link href="/dashboard" className="mr-8 flex items-center gap-2">
          <span className="text-xl">📦</span>
          <span className="font-bold">MoveKit</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-1.5",
                  pathname.startsWith(link.href) && "font-medium"
                )}
              >
                <span className="text-sm">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm">
            🔔
          </Button>
          <Button variant="ghost" size="sm">
            👤
          </Button>
        </div>
      </div>
    </header>
  )
}
