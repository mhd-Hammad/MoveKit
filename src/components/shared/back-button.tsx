"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"

interface BackButtonProps {
  href?: string        // Explicit destination (e.g., "/dashboard")
  label?: string       // Custom label (default: "Back")
  className?: string   // Additional styling
}

/**
 * Reusable back navigation button.
 * - If `href` is provided, links to that page
 * - If no `href`, uses router.back() (browser history)
 * - Positioned top-left of the content area
 * - Subtle hover animation
 */
export function BackButton({ href, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter()

  const content = (
    <span className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer ${className}`}>
      <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span>
      {label}
    </span>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return <button onClick={() => router.back()} className="text-left">{content}</button>
}
