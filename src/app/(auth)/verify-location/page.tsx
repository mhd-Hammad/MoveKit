"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/shared/back-button"

type Status = "idle" | "requesting" | "verifying" | "success" | "error"

export default function VerifyLocationPage() {
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<{ campus?: string; distance?: number }>({})

  const handleVerify = async () => {
    setStatus("requesting")
    setMessage("Requesting GPS access...")

    if (!navigator.geolocation) {
      setStatus("error")
      setMessage("Your browser doesn't support GPS location.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("verifying")
        setMessage("Checking proximity to campus...")

        const user = JSON.parse(localStorage.getItem("movekit_user") || "{}")

        try {
          const res = await fetch("/api/verification/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              user_id: user.id,
            }),
          })

          const data = await res.json()

          if (res.ok && data.verified) {
            setStatus("success")
            setMessage(data.message)
            setDetails({ campus: data.campus_name, distance: data.distance_km })
          } else {
            setStatus("error")
            setMessage(data.message || data.error)
            if (data.distance_km) setDetails({ distance: data.distance_km })
          }
        } catch {
          setStatus("error")
          setMessage("Network error. Please try again.")
        }
      },
      (error) => {
        setStatus("error")
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setMessage("Location permission denied. Please enable GPS in your browser settings.")
            break
          case error.POSITION_UNAVAILABLE:
            setMessage("Location unavailable. Make sure GPS is enabled.")
            break
          case error.TIMEOUT:
            setMessage("Location request timed out. Please try again in an open area.")
            break
          default:
            setMessage("Failed to get location. Please try again.")
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <span className="text-lg text-white">📦</span>
            </div>
            <span className="text-xl font-bold">MoveKit</span>
          </Link>
        </div>

        <Card className="border-0 shadow-xl shadow-black/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify Location</CardTitle>
            <CardDescription>
              Confirm you&apos;re within 10km of a registered university campus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Display */}
            <div className="rounded-xl border bg-muted/30 p-6 text-center">
              {status === "idle" && (
                <>
                  <div className="text-4xl mb-3">📍</div>
                  <p className="text-sm text-muted-foreground">
                    Click below to verify your GPS location. We only store your campus association — never raw coordinates.
                  </p>
                </>
              )}
              {status === "requesting" && (
                <>
                  <div className="text-4xl mb-3 animate-pulse">🛰️</div>
                  <p className="text-sm text-muted-foreground">{message}</p>
                </>
              )}
              {status === "verifying" && (
                <>
                  <div className="text-4xl mb-3 animate-bounce">📡</div>
                  <p className="text-sm text-muted-foreground">{message}</p>
                </>
              )}
              {status === "success" && (
                <>
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-medium text-emerald-700">{message}</p>
                  {details.campus && (
                    <Badge className="mt-2" variant="default">{details.campus}</Badge>
                  )}
                </>
              )}
              {status === "error" && (
                <>
                  <div className="text-4xl mb-3">❌</div>
                  <p className="text-sm text-destructive">{message}</p>
                  {details.distance && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Distance: {details.distance}km from nearest campus
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Action Button */}
            {status !== "success" && (
              <Button
                onClick={handleVerify}
                className="w-full h-11 gradient-primary border-0 text-white"
                disabled={status === "requesting" || status === "verifying"}
              >
                {status === "requesting" || status === "verifying"
                  ? "Verifying..."
                  : status === "error"
                  ? "Try Again"
                  : "Verify My Location"
                }
              </Button>
            )}

            {status === "success" && (
              <Link href="/dashboard">
                <Button className="w-full h-11 gradient-primary border-0 text-white">
                  Continue to Dashboard →
                </Button>
              </Link>
            )}

            {/* Privacy Notice */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
              <strong>🔒 Privacy:</strong> We only store which campus you&apos;re near — never your exact GPS coordinates. Verification is valid for 90 days.
            </div>

            {/* Back link */}
            <BackButton href="/dashboard" label="Back to Dashboard" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
