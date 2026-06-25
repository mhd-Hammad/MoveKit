"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Step = "email" | "otp"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send code")
        return
      }

      setSuccess(data.message)
      setStep("otp")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Verification failed")
        return
      }

      setSuccess("✓ Verified! Redirecting...")
      localStorage.setItem("movekit_user", JSON.stringify(data.user))
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="text-2xl">📦</span>
          </div>
          <h2 className="text-3xl font-bold">Welcome to MoveKit</h2>
          <p className="mt-4 text-blue-100 leading-relaxed">
            The AI-powered platform that helps university students relocate smarter. 
            Get matched with outgoing students, build your survival blueprint, and settle in with confidence.
          </p>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">✓</div>
              <span>Verified university students only</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">✓</div>
              <span>AI-generated personalized packing lists</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">✓</div>
              <span>Safe peer-to-peer transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <span className="text-lg text-white">📦</span>
              </div>
              <span className="text-xl font-bold">MoveKit</span>
            </Link>
          </div>

          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">
                {step === "email" ? "Sign In" : "Enter Code"}
              </CardTitle>
              <CardDescription className="text-base">
                {step === "email"
                  ? "Use your university email to get started"
                  : `6-digit code sent to ${email}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {step === "email" ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="h-11"
                    />
                  </div>
                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                      {success}
                    </div>
                  )}
                  <Button type="submit" className="w-full h-11 gradient-primary border-0 text-white" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending...
                      </span>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label htmlFor="otp" className="mb-2 block text-sm font-medium">
                      Verification Code
                    </label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      autoFocus
                      className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Code expires in 5 minutes
                    </p>
                  </div>
                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                      {success}
                    </div>
                  )}
                  <Button type="submit" className="w-full h-11 gradient-primary border-0 text-white" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Sign In"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep("email")
                      setOtp("")
                      setError("")
                      setSuccess("")
                    }}
                  >
                    ← Use a different email
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
