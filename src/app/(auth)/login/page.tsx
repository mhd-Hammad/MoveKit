"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Step = "email" | "otp"

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    // Check if it looks like a university email
    const domain = email.split("@")[1]
    const commonPersonal = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
    if (commonPersonal.includes(domain)) {
      setError("Please use your university email address (e.g., you@university.edu)")
      return
    }

    setIsLoading(true)
    // TODO: Call POST /api/auth/send-otp
    // For now, simulate
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)
    setStep("otp")
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    // TODO: Call POST /api/auth/verify-otp
    // For now, simulate
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)
    // TODO: redirect to /dashboard on success
    setError("Backend not connected yet — OTP verification coming soon!")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">📦</span>
            <span className="text-2xl font-bold">MoveKit</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === "email" ? "Welcome" : "Check your email"}
            </CardTitle>
            <CardDescription>
              {step === "email"
                ? "Sign in with your university email to get started"
                : `We sent a 6-digit code to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    University Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending code..." : "Send Verification Code"}
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
                    className="text-center text-2xl tracking-[0.5em]"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Code expires in 10 minutes
                  </p>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Sign In"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("email")
                    setOtp("")
                    setError("")
                  }}
                >
                  Use a different email
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Only students with verified university emails can access MoveKit.
          <br />
          Your email domain is checked against a global university database.
        </p>
      </div>
    </div>
  )
}
