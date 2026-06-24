"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockTimeline = [
  { day: -7, title: "Research local SIM providers", desc: "Compare prices online, pre-order if possible", done: true },
  { day: -5, title: "Confirm housing move-in details", desc: "Get landlord/RA contact, move-in time, key pickup", done: true },
  { day: -3, title: "Pack essentials in carry-on", desc: "Adapter, charger, change of clothes, important docs", done: true },
  { day: -1, title: "Download offline maps", desc: "Save campus area and route from airport in Google Maps", done: false },
  { day: 0, title: "🛬 Arrival Day", desc: "Get SIM card at airport, transit to housing", done: false },
  { day: 1, title: "Grocery run", desc: "Buy basics: water, snacks, toiletries, cleaning supplies", done: false },
  { day: 2, title: "Campus orientation", desc: "Pick up student ID, campus tour, library card", done: false },
  { day: 3, title: "Open bank account", desc: "Bring passport + student ID + proof of enrollment", done: false },
  { day: 5, title: "Get transit pass", desc: "Monthly student pass — usually cheapest option", done: false },
  { day: 7, title: "Register with local authorities", desc: "Some countries require this within 7 days", done: false },
  { day: 10, title: "Join student clubs", desc: "Attend club fair or sign up online", done: false },
  { day: 14, title: "Settle-in check", desc: "Review what's still missing from blueprint", done: false },
]

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Arrival Timeline</h1>
        <p className="text-muted-foreground">Your day-by-day action plan from 7 days before to 14 days after arrival</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {mockTimeline.map((task, i) => (
            <div key={i} className="relative flex gap-4 pl-2">
              {/* Dot */}
              <div className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                task.done
                  ? "bg-emerald-500 text-white"
                  : task.day === 0
                  ? "bg-primary text-white"
                  : "bg-muted border-2 border-border"
              }`}>
                {task.done ? "✓" : task.day === 0 ? "✈️" : ""}
              </div>

              {/* Card */}
              <Card className={`flex-1 ${task.done ? "opacity-60" : ""}`}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-sm ${task.done ? "line-through" : ""}`}>
                      {task.title}
                    </h3>
                    <Badge variant={task.day < 0 ? "secondary" : task.day === 0 ? "default" : "outline"} className="text-[10px]">
                      {task.day < 0 ? `Day ${task.day}` : task.day === 0 ? "Arrival" : `Day +${task.day}`}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{task.desc}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
