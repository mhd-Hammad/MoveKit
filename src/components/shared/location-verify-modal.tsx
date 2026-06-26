"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LocationVerifyModalProps {
  open: boolean
  onClose: () => void
  onVerified?: () => void
}

type Status = "idle" | "requesting" | "verifying" | "success" | "error"

export function LocationVerifyModal({ open, onClose, onVerified }: LocationVerifyModalProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const [campus, setCampus] = useState("")

  const handleVerify = () => {
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
            setCampus(data.campus_name || "")
            onVerified?.()
          } else {
            setStatus("error")
            setMessage(data.message || data.error)
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
            setMessage("Location permission denied. Enable GPS in browser settings.")
            break
          case error.POSITION_UNAVAILABLE:
            setMessage("Location unavailable. Make sure GPS is enabled.")
            break
          case error.TIMEOUT:
            setMessage("Location request timed out. Try in an open area.")
            break
          default:
            setMessage("Failed to get location.")
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    )
  }

  const handleClose = () => {
    setStatus("idle")
    setMessage("")
    setCampus("")
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl bg-card border shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-3 text-center">
                <motion.div
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                  animate={
                    status === "requesting" || status === "verifying"
                      ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <span className="text-2xl">
                    {status === "idle" && "📍"}
                    {status === "requesting" && "🛰️"}
                    {status === "verifying" && "📡"}
                    {status === "success" && "✅"}
                    {status === "error" && "❌"}
                  </span>
                </motion.div>
                <h3 className="text-lg font-semibold">
                  {status === "success" ? "Location Verified!" : "Verify Location"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {status === "idle" && "Confirm you're near a registered university campus"}
                  {status === "requesting" && message}
                  {status === "verifying" && message}
                  {status === "success" && message}
                  {status === "error" && message}
                </p>
                {campus && (
                  <Badge className="mt-2" variant="default">{campus}</Badge>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 pt-3 space-y-3">
                {status === "idle" && (
                  <>
                    <Button onClick={handleVerify} className="w-full gradient-primary border-0 text-white">
                      Verify My Location
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground">
                      We only store which campus you're near, never exact coordinates.
                    </p>
                  </>
                )}

                {(status === "requesting" || status === "verifying") && (
                  <div className="flex justify-center py-2">
                    <motion.div
                      className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                  </div>
                )}

                {status === "error" && (
                  <>
                    <Button onClick={handleVerify} className="w-full" variant="outline">
                      Try Again
                    </Button>
                    <Button onClick={handleClose} className="w-full" variant="ghost">
                      Close
                    </Button>
                  </>
                )}

                {status === "success" && (
                  <Button onClick={handleClose} className="w-full gradient-primary border-0 text-white">
                    Done
                  </Button>
                )}

                {status === "idle" && (
                  <Button onClick={handleClose} className="w-full" variant="ghost">
                    Not now
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
