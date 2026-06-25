"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/lib/data/policies"

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">("privacy")

  const policy = activeTab === "privacy" ? PRIVACY_POLICY : TERMS_OF_SERVICE

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Policies</h1>
        <p className="text-muted-foreground">How we protect your data and keep the platform safe</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === "privacy" ? "default" : "outline"}
          onClick={() => setActiveTab("privacy")}
          size="sm"
        >
          🔒 Privacy Policy
        </Button>
        <Button
          variant={activeTab === "terms" ? "default" : "outline"}
          onClick={() => setActiveTab("terms")}
          size="sm"
        >
          📋 Terms of Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{policy.title}</CardTitle>
          <p className="text-xs text-muted-foreground">Last updated: {policy.lastUpdated}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {policy.sections.map((section, i) => (
            <div key={i}>
              <h3 className="font-semibold text-sm mb-1">{section.heading}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
