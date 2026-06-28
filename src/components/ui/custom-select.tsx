"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

/**
 * Custom styled select with max-height dropdown, search filtering,
 * and theme-matched colors. Replaces native <select> for better UX.
 */
export function CustomSelect({ value, onChange, options, placeholder = "Select...", className }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedLabel = options.find(o => o.value === value)?.label

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span className={selectedLabel ? "text-foreground" : "text-muted-foreground"}>
          {selectedLabel || placeholder}
        </span>
        <span className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-card shadow-lg animate-in fade-in-0 zoom-in-95">
          {/* Search input */}
          {options.length > 8 && (
            <div className="p-2 border-b">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-sm border border-input bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
            </div>
          )}

          {/* Options list — max height with scroll */}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">No results</p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => { onChange(option.value); setOpen(false); setSearch("") }}
                  className={cn(
                    "flex w-full items-center rounded-sm px-2 py-1.5 text-sm transition-colors",
                    value === option.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  )}
                >
                  {option.label}
                  {value === option.value && <span className="ml-auto text-primary">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
