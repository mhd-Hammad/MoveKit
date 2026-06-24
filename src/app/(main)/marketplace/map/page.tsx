"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Map view placeholder — actual Leaflet integration requires dynamic import
// to avoid SSR issues. For now, showing a visual representation.
const mockPins = [
  { id: "1", title: "IKEA Desk Lamp", price: 25, lat: 42.361, lng: -71.094, category: "Electronics" },
  { id: "2", title: "Kitchen Bundle", price: 60, lat: 42.363, lng: -71.097, category: "Kitchen" },
  { id: "3", title: "Winter Jacket", price: 80, lat: 42.358, lng: -71.091, category: "Clothing" },
  { id: "4", title: "Bedding Set", price: 45, lat: 42.365, lng: -71.089, category: "Housing" },
  { id: "5", title: "Power Adapter", price: 15, lat: 42.360, lng: -71.096, category: "Electronics" },
  { id: "6", title: "Bicycle", price: 120, lat: 42.357, lng: -71.100, category: "Transport" },
]

export default function MapViewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Map View</h1>
          <p className="text-muted-foreground">Listings near your campus</p>
        </div>
        <Link href="/marketplace">
          <Button variant="outline" size="sm">📋 List View</Button>
        </Link>
      </div>

      {/* Map Placeholder */}
      <Card className="overflow-hidden">
        <div className="relative h-[400px] bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
          {/* Visual map representation */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="0.2" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.2" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeWidth="0.2" />
              <line x1="25" y1="0" x2="25" y2="100" stroke="currentColor" strokeWidth="0.2" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.2" />
              <line x1="75" y1="0" x2="75" y2="100" stroke="currentColor" strokeWidth="0.2" />
            </svg>
          </div>

          {/* Pins */}
          {mockPins.map((pin, i) => (
            <div
              key={pin.id}
              className="absolute animate-bounce"
              style={{
                top: `${20 + (i * 10) % 60}%`,
                left: `${15 + (i * 13) % 70}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '2s',
              }}
            >
              <div className="relative group cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs shadow-lg">
                  📍
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className="rounded-lg bg-card border shadow-lg p-2 text-xs whitespace-nowrap">
                    <p className="font-medium">{pin.title}</p>
                    <p className="text-primary font-bold">${pin.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Center marker (you) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white text-lg shadow-xl ring-4 ring-emerald-200">
              🧑
            </div>
            <p className="text-[10px] text-center mt-1 font-medium">You</p>
          </div>
        </div>
      </Card>

      {/* Nearby listings */}
      <div>
        <h3 className="font-semibold mb-3">Nearby Listings ({mockPins.length})</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {mockPins.map((pin) => (
            <Link key={pin.id} href={`/marketplace/${pin.id}`}>
              <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{pin.title}</p>
                    <Badge variant="secondary" className="text-[10px] mt-1">{pin.category}</Badge>
                  </div>
                  <p className="font-bold text-primary">${pin.price}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
